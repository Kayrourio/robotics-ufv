export const NODE_W = 160
export const NODE_H = 64
export const GAP_Y = 24
export const Y_START = 80
export const CANVAS_TOTAL_W = 2100

export const COLUMNS = {
  1: { x: 40, nodes: ['ECO270', 'ELT170', 'ELT171', 'FIS201', 'INF100', 'MAT141'] },
  2: { x: 240, nodes: ['ELT270', 'FIS224', 'INF101', 'MAT135', 'MAT143', 'QUI100'] },
  3: { x: 440, nodes: ['ELT211', 'ELT216', 'ELT230', 'ELT271', 'EST106', 'FIS203', 'MAT243'] },
  4: { x: 640, nodes: ['ADM100', 'ELT110', 'ELT231', 'ELT236', 'ELT414', 'FIS202', 'MAT340'] },
  5: {
    x: 840,
    nodes: ['ELT210', 'ELT215', 'ELT232', 'ELT237', 'ELT272', 'ELT310', 'ELT315', 'ENG275', 'FIS233'],
  },
  6: { x: 1060, nodes: ['ELT330', 'ELT373', 'ELT430', 'EPR397', 'MAT271'] },
  7: { x: 1260, nodes: ['ELT331', 'ELT335', 'ELT350', 'ELT355', 'ELT374', 'ELT471', 'ELT472', 'ELT476'] },
  8: { x: 1460, nodes: ['ELT333', 'ELT336', 'ELT451', 'ELT477'] },
  9: { x: 1660, nodes: ['ELT401'] },
  10: { x: 1860, nodes: ['ELT402', 'ELT498'] },
}

export const DISCIPLINES = [
  { code: 'ECO270', name: 'Introdução à Economia', period: 1, area: 'eng', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'ELT170', name: 'Introdução à Engenharia de Robôs', period: 1, area: 'eng', credits: 2, hours: 30, prereqs: [], coreqs: [] },
  { code: 'ELT171', name: 'Ética, Sociedade e Robótica', period: 1, area: 'eng', credits: 2, hours: 30, prereqs: [], coreqs: [] },
  { code: 'FIS201', name: 'Física I', period: 1, area: 'fisica', credits: 4, hours: 60, prereqs: [], coreqs: ['MAT141'] },
  { code: 'INF100', name: 'Introdução à Programação I', period: 1, area: 'comp', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'MAT141', name: 'Cálculo I', period: 1, area: 'mat', credits: 6, hours: 90, prereqs: [], coreqs: [] },

  { code: 'ELT270', name: 'Desenho Assistido por Computador', period: 2, area: 'eng', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'FIS224', name: 'Laboratório de Física A', period: 2, area: 'fisica', credits: 2, hours: 30, prereqs: [], coreqs: ['FIS201'] },
  { code: 'INF101', name: 'Introdução à Programação II', period: 2, area: 'comp', credits: 4, hours: 60, prereqs: ['INF100'], coreqs: [] },
  { code: 'MAT135', name: 'Geometria Analítica e Álgebra Linear', period: 2, area: 'mat', credits: 6, hours: 90, prereqs: [], coreqs: [] },
  { code: 'MAT143', name: 'Cálculo II', period: 2, area: 'mat', credits: 6, hours: 90, prereqs: ['MAT141'], coreqs: [] },
  { code: 'QUI100', name: 'Química Geral', period: 2, area: 'qui', credits: 3, hours: 45, prereqs: [], coreqs: [] },

  { code: 'ELT211', name: 'Sistemas Digitais', period: 3, area: 'elt', credits: 2, hours: 30, prereqs: ['INF100'], coreqs: [] },
  { code: 'ELT216', name: 'Lab. Sistemas Digitais', period: 3, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT211'] },
  { code: 'ELT230', name: 'Fundamentos de Circuitos Elétricos', period: 3, area: 'elt', credits: 2, hours: 30, prereqs: ['MAT135'], coreqs: ['EST106'] },
  { code: 'ELT271', name: 'Programação e Simulação de Robôs', period: 3, area: 'comp', credits: 4, hours: 60, prereqs: ['INF100'], coreqs: [] },
  { code: 'EST106', name: 'Estatística I', period: 3, area: 'mat', credits: 4, hours: 60, prereqs: ['MAT141'], coreqs: [] },
  { code: 'FIS203', name: 'Física III', period: 3, area: 'fisica', credits: 4, hours: 60, prereqs: ['FIS201'], coreqs: ['MAT243'] },
  { code: 'MAT243', name: 'Cálculo III', period: 3, area: 'mat', credits: 6, hours: 90, prereqs: ['MAT143', 'MAT135'], coreqs: [] },

  { code: 'ADM100', name: 'Introdução à Administração', period: 4, area: 'eng', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'ELT110', name: 'Engenharia e Ciência dos Materiais', period: 4, area: 'eng', credits: 4, hours: 60, prereqs: ['QUI100'], coreqs: [] },
  { code: 'ELT231', name: 'Circuitos Elétricos I', period: 4, area: 'elt', credits: 2, hours: 30, prereqs: ['ELT230'], coreqs: ['MAT340'] },
  { code: 'ELT236', name: 'Lab. Circuitos Elétricos I', period: 4, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT231'] },
  { code: 'ELT414', name: 'Interfaces e Microprocessadores', period: 4, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT211'], coreqs: ['ELT216'] },
  { code: 'FIS202', name: 'Física II', period: 4, area: 'fisica', credits: 4, hours: 60, prereqs: ['FIS201', 'MAT141'], coreqs: [] },
  { code: 'MAT340', name: 'Equações Diferenciais I', period: 4, area: 'mat', credits: 4, hours: 60, prereqs: [], coreqs: ['MAT243'] },

  { code: 'ELT210', name: 'Medidas Elétricas e Magnéticas', period: 5, area: 'elt', credits: 2, hours: 30, prereqs: ['ELT231'], coreqs: ['ELT236'] },
  { code: 'ELT215', name: 'Lab. Medidas Elétricas', period: 5, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT210'] },
  { code: 'ELT232', name: 'Circuitos Elétricos II', period: 5, area: 'elt', credits: 2, hours: 30, prereqs: ['ELT231', 'MAT340'], coreqs: ['ELT236'] },
  { code: 'ELT237', name: 'Lab. Circuitos Elétricos II', period: 5, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT232'] },
  { code: 'ELT272', name: 'Prototipagem de Sistemas Robóticos', period: 5, area: 'comp', credits: 2, hours: 30, prereqs: ['ELT270'], coreqs: ['ELT271'] },
  { code: 'ELT310', name: 'Eletrônica I', period: 5, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT110', 'ELT231'], coreqs: [] },
  { code: 'ELT315', name: 'Lab. Eletrônica I', period: 5, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT310'] },
  { code: 'ENG275', name: 'Fenômenos de Transporte', period: 5, area: 'eng', credits: 4, hours: 60, prereqs: ['FIS202'], coreqs: ['MAT243'] },
  { code: 'FIS233', name: 'Mecânica', period: 5, area: 'fisica', credits: 4, hours: 60, prereqs: ['FIS201'], coreqs: [] },

  { code: 'ELT330', name: 'Sistemas de Controle I', period: 6, area: 'elt', credits: 4, hours: 60, prereqs: ['FIS233', 'ENG275', 'ELT232'], coreqs: [] },
  { code: 'ELT373', name: 'Percepção Robótica I', period: 6, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT310'], coreqs: ['ELT315'] },
  { code: 'ELT430', name: 'Modelagem e Identificação de Sistemas', period: 6, area: 'elt', credits: 4, hours: 60, prereqs: [], coreqs: ['ELT330'] },
  { code: 'EPR397', name: 'Gestão Ambiental', period: 6, area: 'eng', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'MAT271', name: 'Cálculo Numérico', period: 6, area: 'mat', credits: 4, hours: 60, prereqs: ['MAT135', 'MAT143', 'INF100'], coreqs: [] },

  { code: 'ELT331', name: 'Sistemas de Controle II', period: 7, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT330'], coreqs: [] },
  { code: 'ELT335', name: 'Lab. Sistemas de Controle', period: 7, area: 'elt', credits: 2, hours: 30, prereqs: ['ELT330'], coreqs: [] },
  { code: 'ELT350', name: 'Sinais e Sistemas', period: 7, area: 'elt', credits: 2, hours: 30, prereqs: ['ELT232'], coreqs: [] },
  { code: 'ELT355', name: 'Lab. Sinais e Sistemas', period: 7, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT350'] },
  { code: 'ELT374', name: 'Percepção Robótica II', period: 7, area: 'elt', credits: 6, hours: 90, prereqs: ['ELT373'], coreqs: [] },
  { code: 'ELT471', name: 'Robótica Industrial', period: 7, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: [] },
  { code: 'ELT472', name: 'Robótica Móvel', period: 7, area: 'elt', credits: 4, hours: 60, prereqs: [], coreqs: [] },
  { code: 'ELT476', name: 'Lab. Robótica Industrial', period: 7, area: 'elt', credits: 2, hours: 30, prereqs: [], coreqs: ['ELT471'] },

  { code: 'ELT333', name: 'Controle Digital', period: 8, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT331'], coreqs: [] },
  { code: 'ELT336', name: 'Fundamentos de Sistemas Lineares', period: 8, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT330'], coreqs: [] },
  { code: 'ELT451', name: 'Inteligência Computacional', period: 8, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT350'], coreqs: [] },
  { code: 'ELT477', name: 'Navegação de Robôs', period: 8, area: 'elt', credits: 4, hours: 60, prereqs: ['ELT472'], coreqs: ['ELT373'] },

  { code: 'ELT401', name: 'Projeto de Engenharia I', period: 9, area: 'eng', credits: 6, hours: 90, prereqs: [], coreqs: [] },

  { code: 'ELT402', name: 'Projeto de Engenharia II', period: 10, area: 'eng', credits: 6, hours: 90, prereqs: ['ELT401'], coreqs: [] },
  { code: 'ELT498', name: 'Estágio Supervisionado', period: 10, area: 'eng', credits: 12, hours: 180, prereqs: [], coreqs: [] },
]

export const DISCIPLINE_MAP = {}
DISCIPLINES.forEach((d) => (DISCIPLINE_MAP[d.code] = d))

export const EDGES = []
DISCIPLINES.forEach((d) => {
  d.prereqs.forEach((p) => EDGES.push({ from: p, to: d.code, coreq: false }))
  d.coreqs.forEach((p) => EDGES.push({ from: p, to: d.code, coreq: true }))
})

export const AREA_COLORS = {
  mat: 'var(--area-mat)',
  fisica: 'var(--area-fisica)',
  elt: 'var(--area-elt)',
  comp: 'var(--area-comp)',
  eng: 'var(--area-eng)',
  qui: 'var(--area-qui)',
}
