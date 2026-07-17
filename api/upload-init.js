// Vercel Serverless Function: autoriza e prepara um upload de material pro
// Drive. Não recebe os bytes do arquivo — só valida a senha compartilhada,
// autentica como service account, garante que a pasta
// <ROOT>/<DISCIPLINA>/<tipo>/ existe e devolve uma URL de "resumable upload"
// do próprio Google. O navegador faz o PUT do arquivo direto pra essa URL
// (ver src/pages/UploadPage.vue), sem passar pelo limite de payload (~4.5MB)
// das functions da Vercel.
//
// Env vars exigidas: DRIVE_ROOT_FOLDER_ID (já usada pelo sync de leitura),
// GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
// UPLOAD_ACCESS_PASSWORD. A pasta raiz do Drive precisa estar compartilhada
// com o e-mail da service account como Editor.

import crypto from 'node:crypto'
import { DISCIPLINES } from '../src/data.js'
import { TYPE_TO_FOLDER } from '../src/data/driveTypes.js'

const FOLDER_MIME = 'application/vnd.google-apps.folder'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function signServiceAccountJWT(email, privateKey) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: email,
    scope: DRIVE_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }
  const signInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signInput)
  signer.end()
  const signature = signer.sign(privateKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${signInput}.${signature}`
}

async function getAccessToken(email, privateKey) {
  const jwt = signServiceAccountJWT(email, privateKey)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    throw new Error(`Falha ao autenticar service account: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.access_token
}

function escapeForQuery(value) {
  return String(value).replace(/'/g, "\\'")
}

async function findChildFolder(token, parentId, name) {
  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set(
    'q',
    `'${escapeForQuery(parentId)}' in parents and trashed = false and mimeType = '${FOLDER_MIME}' and name = '${escapeForQuery(name)}'`,
  )
  url.searchParams.set('fields', 'files(id, name)')
  url.searchParams.set('supportsAllDrives', 'true')
  url.searchParams.set('includeItemsFromAllDrives', 'true')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new Error(`Falha ao consultar pastas do Drive: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.files?.[0] || null
}

async function createFolder(token, parentId, name) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
  })
  if (!res.ok) {
    throw new Error(`Falha ao criar pasta no Drive: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return data.id
}

async function findOrCreateFolder(token, parentId, name) {
  const existing = await findChildFolder(token, parentId, name)
  if (existing) return existing.id
  return createFolder(token, parentId, name)
}

async function initResumableUpload(token, folderId, fileName, mimeType) {
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType || 'application/octet-stream',
      },
      body: JSON.stringify({ name: fileName, parents: [folderId] }),
    },
  )
  if (!res.ok) {
    throw new Error(`Falha ao iniciar upload resumível: ${res.status} ${await res.text()}`)
  }
  const uploadUrl = res.headers.get('location')
  if (!uploadUrl) throw new Error('Drive não retornou URL de upload.')
  return uploadUrl
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const expectedPassword = process.env.UPLOAD_ACCESS_PASSWORD
  const rootId = process.env.DRIVE_ROOT_FOLDER_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  // Tolera aspas envolvendo o valor (comuns quando alguém cola o formato de
  // .env, com aspas literais, direto no campo de env var da Vercel — lá elas
  // não são removidas automaticamente como um dotenv faria) e normaliza os
  // "\n" escapados de volta pra quebras de linha reais do PEM.
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\\n/g, '\n')
  if (!expectedPassword || !rootId || !email || !privateKey) {
    res.status(500).json({ error: 'Upload não configurado no servidor.' })
    return
  }
  if (!privateKey.includes('BEGIN PRIVATE KEY')) {
    res.status(500).json({
      error:
        'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY malformada no servidor (não parece um PEM válido). Confira se colou o valor sem aspas ao redor no painel da Vercel.',
    })
    return
  }

  const { password, disciplineCode, folderType, fileName, mimeType } = req.body || {}

  if (!password || !safeEqual(password, expectedPassword)) {
    res.status(401).json({ error: 'Senha incorreta.' })
    return
  }

  const code = String(disciplineCode || '').trim().toUpperCase()
  const discipline = DISCIPLINES.find((d) => d.code === code)
  if (!discipline) {
    res.status(400).json({ error: `Disciplina desconhecida: ${disciplineCode}` })
    return
  }

  const folder = TYPE_TO_FOLDER[folderType]
  if (!folder) {
    res.status(400).json({ error: `Tipo de material desconhecido: ${folderType}` })
    return
  }

  if (!fileName || typeof fileName !== 'string') {
    res.status(400).json({ error: 'Nome de arquivo ausente.' })
    return
  }

  try {
    const token = await getAccessToken(email, privateKey)
    const disciplineFolderId = await findOrCreateFolder(token, rootId, code)
    const typeFolderId = await findOrCreateFolder(token, disciplineFolderId, folder)
    const uploadUrl = await initResumableUpload(token, typeFolderId, fileName, mimeType)
    res.status(200).json({ uploadUrl })
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: 'Falha ao preparar upload no Drive.' })
  }
}
