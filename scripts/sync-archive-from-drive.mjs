// Sincroniza src/data/archive.json a partir de uma pasta do Google Drive.
//
// Estrutura esperada no Drive:
//   <ROOT>/<CODIGO_DA_DISCIPLINA>/exams|assignments|summaries|slides|books|extras/arquivo
// Ex.: <ROOT>/ELT231/exams/prova1.pdf
//
// Cada pasta de disciplina deve se chamar exatamente igual ao "code" em
// src/data.js (ex.: "ELT231"). Pastas de tipo reconhecidas viram os tipos
// já usados pelo Archive (prova/lista/resumo/slide/livro); qualquer outro
// nome de subpasta (ex. "extras") entra como material avulso, sem tipo
// oficial — some do JSON. As pastas do Drive precisam estar compartilhadas
// como "Qualquer pessoa com o link — Leitor".
//
// Variáveis de ambiente exigidas:
//   DRIVE_API_KEY         — API key do Google Cloud (SEM restrição de
//                           referrer — essa chamada é servidor-a-servidor).
//   DRIVE_ROOT_FOLDER_ID  — ID da pasta raiz no Drive (o trecho depois de
//                           /folders/ na URL).

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DISCIPLINES } from '../src/data.js'

const API_KEY = process.env.DRIVE_API_KEY
const ROOT_ID = process.env.DRIVE_ROOT_FOLDER_ID

const FOLDER_MIME = 'application/vnd.google-apps.folder'

const FOLDER_TO_TYPE = {
  exams: 'prova',
  assignments: 'lista',
  summaries: 'resumo',
  slides: 'slide',
  books: 'livro',
}

function assertEnv() {
  const missing = ['DRIVE_API_KEY', 'DRIVE_ROOT_FOLDER_ID'].filter((k) => !process.env[k])
  if (missing.length) {
    console.error(`Faltando variáveis de ambiente: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function driveList(query, fields) {
  const files = []
  let pageToken
  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('q', query)
    url.searchParams.set('fields', `nextPageToken, files(${fields})`)
    url.searchParams.set('pageSize', '1000')
    url.searchParams.set('key', API_KEY)
    // cobre pastas dentro de Drives compartilhados também
    url.searchParams.set('supportsAllDrives', 'true')
    url.searchParams.set('includeItemsFromAllDrives', 'true')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Drive API respondeu ${res.status} para query "${query}": ${await res.text()}`)
    }
    const data = await res.json()
    files.push(...(data.files || []))
    pageToken = data.nextPageToken
  } while (pageToken)
  return files
}

function escapeForQuery(value) {
  return value.replace(/'/g, "\\'")
}

async function listChildren(folderId, { foldersOnly = false } = {}) {
  const mimeClause = foldersOnly ? `mimeType = '${FOLDER_MIME}'` : `mimeType != '${FOLDER_MIME}'`
  const q = `'${escapeForQuery(folderId)}' in parents and trashed = false and ${mimeClause}`
  return driveList(q, 'id, name, mimeType, createdTime, webViewLink')
}

async function buildDisciplineFiles(courseFolderId) {
  const typeFolders = await listChildren(courseFolderId, { foldersOnly: true })
  const files = []
  for (const folder of typeFolders) {
    const key = folder.name.trim().toLowerCase()
    const type = FOLDER_TO_TYPE[key]
    if (!type) {
      console.warn(`    subpasta ignorada (nome fora do padrão exams/assignments/summaries/slides/books): ${folder.name}`)
      continue
    }
    const driveFiles = await listChildren(folder.id)
    for (const file of driveFiles) {
      files.push({
        type,
        name: file.name,
        date: file.createdTime ? file.createdTime.slice(0, 10) : '',
        url: file.webViewLink || '',
      })
    }
  }
  return files
}

async function main() {
  assertEnv()

  const courseFolders = await listChildren(ROOT_ID, { foldersOnly: true })
  console.log(`Pastas encontradas na raiz (${courseFolders.length}): ${courseFolders.map((f) => f.name).join(', ') || '(nenhuma)'}`)
  if (!courseFolders.length) {
    console.error(
      'Nenhuma pasta visível na raiz. Causas prováveis:\n' +
        '  1. DRIVE_ROOT_FOLDER_ID errado — deve ser só o ID (trecho depois de /folders/ na URL), não a URL inteira.\n' +
        '  2. A pasta raiz não está compartilhada como "Qualquer pessoa com o link — Leitor" (a API key só enxerga arquivos públicos).\n' +
        '  3. A API key está com restrição de referrer/IP — precisa ser "Nenhuma" em restrições de aplicativo.',
    )
    process.exit(1)
  }

  const folderByCode = new Map(courseFolders.map((f) => [f.name.trim().toUpperCase(), f]))
  const knownCodes = new Set(DISCIPLINES.map((d) => d.code))
  const unmatched = courseFolders.filter((f) => !knownCodes.has(f.name.trim().toUpperCase()))
  if (unmatched.length) {
    console.warn(`Pastas ignoradas (nome não bate com nenhum código de disciplina): ${unmatched.map((f) => f.name).join(', ')}`)
  }

  const disciplines = []
  for (const d of DISCIPLINES) {
    const folder = folderByCode.get(d.code)
    const files = folder ? await buildDisciplineFiles(folder.id) : []
    if (folder) console.log(`  ${d.code}: ${files.length} arquivo(s)`)
    disciplines.push({ code: d.code, name: d.name, period: d.period, files })
  }

  const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/archive.json')
  const existing = JSON.parse(await readFile(outPath, 'utf8'))
  const output = { types: existing.types, disciplines }
  await writeFile(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8')

  const withFiles = disciplines.filter((d) => d.files.length).length
  const totalFiles = disciplines.reduce((n, d) => n + d.files.length, 0)
  console.log(`archive.json atualizado: ${withFiles}/${disciplines.length} disciplinas com material, ${totalFiles} arquivos ao todo.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
