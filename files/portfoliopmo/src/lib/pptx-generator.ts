// src/lib/pptx-generator.ts
// Gerador de PPTX fiel ao template executivo Portfólio Chubb
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PptxGenJS = require('pptxgenjs')

import type { Project } from '@/types'

// ─── Paleta do template ─────────────────────────────────────────────────────
const C = {
  purple:  '3E1F62',
  purple2: 'C39BD3',
  gray:    '7F8C8D',
  dark:    '2C3E50',
  white:   'FFFFFF',
  bg:      'F8F9FA',
  light:   'E0E0E0',
  red:     'E74C3C',
  green:   '27AE60',
  yellow:  'F39C12',
  blue:    '2980B9',
}

const STATUS_COLOR: Record<string, string> = {
  verde:    C.green,
  amarelo:  C.yellow,
  vermelho: C.red,
  azul:     C.blue,
}
const STATUS_LBL: Record<string, string> = {
  verde:    'No Prazo',
  amarelo:  'Em Risco',
  vermelho: 'Crítico',
  azul:     'Concluído',
}
const NAT_LBL: Record<string, string> = {
  backoffice:  'Backoffice',
  regulatorio: 'Regulatório',
  negocios:    'Negócios',
  regional:    'Regional',
}
const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ─── Tipos ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Slide = any
export type ImageLoader = (filename: string) => Promise<string>

// ─── Helpers ────────────────────────────────────────────────────────────────
function trunc(s: string | null | undefined, n: number): string {
  if (!s) return '–'
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '–'
  try {
    const [y, m, day] = d.slice(0, 10).split('-')
    return `${day}/${m}/${y}`
  } catch { return d }
}

function quarterOf(d: string | null | undefined): number | null {
  if (!d) return null
  try { return Math.floor(new Date(d).getMonth() / 3) + 1 } catch { return null }
}

function clean(s: string | null | undefined): string {
  if (!s) return ''
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
}

function parseLines(s: string | null | undefined): string[] {
  if (!s) return []
  return clean(s).split('\n').filter(l => l.trim())
}

// ─── Componente de texto padrão do template ─────────────────────────────────
function txt(
  slide: Slide,
  content: string,
  x: number, y: number, w: number, h: number,
  opts: {
    fontSize?: number
    bold?: boolean
    color?: string
    align?: 'left' | 'center' | 'right'
    italic?: boolean
    wrap?: boolean
  } = {}
) {
  slide.addText(content, {
    x, y, w, h,
    fontSize:  opts.fontSize ?? 9,
    bold:      opts.bold ?? false,
    color:     opts.color ?? C.dark,
    align:     opts.align ?? 'left',
    italic:    opts.italic ?? false,
    fontFace:  'Montserrat',
    valign:    'top',
    wrap:      opts.wrap !== false,
  })
}

// ─── Background + footer padrão ─────────────────────────────────────────────
async function addBg(slide: Slide, filename: string, loader: ImageLoader) {
  const data = await loader(filename)
  slide.addImage({ data, x: 0, y: 0, w: 10, h: 5.625 })
}

function addFooter(
  slide: Slide, orgName: string, today: Date,
  pageNum: number, total: number,
  footerY = 5.277,
) {
  const mes = MESES[today.getMonth()]
  txt(slide, `${orgName} · ${mes}/${today.getFullYear()}`,
    0.781, footerY, 1.365, 0.113, { fontSize: 6.21, color: C.gray })
  txt(slide, `${pageNum} / ${total}`,
    9.102, footerY, 0.273, 0.113, { fontSize: 6.21, color: C.gray, align: 'right' })
}

// ─── Cabeçalho interno (título + subtítulo do slide) ────────────────────────
function addSlideHeader(slide: Slide, title: string, subtitle?: string) {
  txt(slide, title, 0.781, 0.469, 8.594, 0.305,
    { fontSize: 16.02, bold: true, color: C.purple })
  if (subtitle) {
    txt(slide, subtitle, 0.781, 0.852, 8.594, 0.178,
      { fontSize: 9.42, color: C.dark })
  }
}

// ─── SLIDE 1: Capa ──────────────────────────────────────────────────────────
async function slideCover(
  prs: typeof PptxGenJS,
  orgName: string,
  today: Date,
  loader: ImageLoader,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-cover.jpeg', loader)

  txt(s, `Portfólio ${orgName}`, 2.743, 0.469, 4.155, 0.599,
    { fontSize: 32.94, bold: true, color: C.purple })
  txt(s, 'Relatório Executivo de Portfólio', 2.743, 1.225, 4.155, 0.305,
    { fontSize: 17, color: C.purple2 })

  const mes = MESES[today.getMonth()]
  txt(s, `${mes} de ${today.getFullYear()}  ·  Gerado em ${today.toLocaleDateString('pt-BR')}`,
    2.743, 2.184, 4.155, 0.172,
    { fontSize: 9.42, color: C.gray })
  txt(s, `Escritório de Portfólio  ·  PMO ${orgName}`,
    2.743, 2.434, 4.155, 0.172,
    { fontSize: 8.85, bold: true, color: C.purple })
}

// ─── SLIDE 2: Visão Geral ───────────────────────────────────────────────────
async function slideVisaoGeral(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-inner.jpeg', loader)
  addSlideHeader(s, 'Visão Geral do Portfólio')

  const total     = projects.length
  const media     = total > 0 ? Math.round(projects.reduce((a, p) => a + p.pct_evolucao, 0) / total) : 0
  const criticos  = projects.filter(p => p.farol === 'vermelho').length
  const amarelo   = projects.filter(p => p.farol === 'amarelo').length
  const entregues = projects.filter(p => p.farol === 'azul').length

  const subMsg = criticos > 0
    ? `${criticos} projeto${criticos > 1 ? 's' : ''} com farol Crítico — ação imediata necessária.`
    : `Portfólio com ${total} projeto${total !== 1 ? 's' : ''} e evolução média de ${media}%.`
  txt(s, subMsg, 0.781, 0.852, 8.594, 0.178, { fontSize: 9.42, color: C.dark })

  // ── KPIs ──
  const kpis: [string | number, string, string][] = [
    [total,              'TOTAL DE PROJETOS',   C.purple],
    [`${media}%`,        'EVOLUÇÃO MÉDIA',       C.purple],
    [criticos + amarelo, 'EM RISCO / CRÍTICOS',  criticos > 0 ? C.red : C.yellow],
    [entregues,          'ENTREGUES NO CICLO',   C.green],
  ]
  const kxPositions = [0.938, 3.125, 5.312, 7.500]
  kpis.forEach(([val, lbl, color], i) => {
    const kx = kxPositions[i]
    txt(s, String(val), kx, 1.420, 1.719, 0.500,
      { fontSize: 24.36, bold: true, color, wrap: false })
    txt(s, lbl, kx, 1.955, 1.719, 0.133,
      { fontSize: 7.27, color: C.gray, wrap: false })
  })

  // ── Cabeçalho da tabela ──
  const colX = [0.781, 2.410, 3.359, 4.264, 5.365]
  const colW = [1.629, 0.949, 0.906, 1.101, 2.000]
  const hdrs = ['Projeto', 'Categoria', 'Progresso', 'Status', 'Término']
  hdrs.forEach((h, i) => {
    txt(s, h, colX[i], 2.557, colW[i], 0.375,
      { fontSize: 6.83, bold: true, color: C.purple })
  })

  // ── Linhas da tabela ──
  const MAX_ROWS = 5
  const ROW_H    = 0.388
  let rowY = 2.932
  for (const p of projects.slice(0, MAX_ROWS)) {
    const status = (STATUS_LBL[p.farol] ?? p.farol).toUpperCase()
    const color  = STATUS_COLOR[p.farol] ?? C.dark
    txt(s, trunc(p.nome, 26),                    colX[0], rowY, colW[0], ROW_H, { fontSize: 6.83, bold: true, color: C.dark })
    txt(s, NAT_LBL[p.natureza] ?? p.natureza,    colX[1], rowY, colW[1], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    txt(s, `${p.pct_evolucao}%`,                 colX[2], rowY, colW[2], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    txt(s, status,                               colX[3], rowY, colW[3], ROW_H, { fontSize: 6.83, bold: true, color })
    txt(s, fmtDate(p.data_fim_prevista),         colX[4], rowY, colW[4], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    rowY += ROW_H
  }

  if (total > MAX_ROWS) {
    txt(s, `+ ${total - MAX_ROWS} projeto${total - MAX_ROWS > 1 ? 's' : ''} adicionais — ver slides individuais`,
      colX[0], rowY + 0.05, 9.0, 0.20, { fontSize: 6.5, color: C.gray, italic: true })
  }

  // ── Logo / Gráfico ──
  try {
    const logoData = await loader('slide-logo.png')
    s.addImage({ data: logoData, x: 6.615, y: 2.557, w: 2.760, h: 1.562 })
  } catch { /* logo opcional */ }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 3: Projetos por Quarter ──────────────────────────────────────────
async function slideProjetosPorQuarter(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-inner.jpeg', loader)
  addSlideHeader(s, 'Projetos entregues no Quarter',
    'Abaixo, uma visão dos projetos entregues por quarter no ciclo atual.')

  // ── KPI total ──
  txt(s, String(projects.length), 0.938, 1.420, 1.719, 0.457,
    { fontSize: 24.36, bold: true, color: C.purple, wrap: false })
  txt(s, 'TOTAL DE PROJETOS', 0.938, 1.955, 1.719, 0.133,
    { fontSize: 7.27, color: C.gray, wrap: false })

  // ── Cabeçalho da tabela ──
  const colX = [0.781, 2.410, 3.359, 4.264, 5.365]
  const colW = [1.629, 0.949, 0.906, 1.101, 2.000]
  const hdrs = ['Projeto', 'Categoria', 'Progresso', 'Status', 'Término']
  hdrs.forEach((h, i) => {
    txt(s, h, colX[i], 2.557, colW[i], 0.375,
      { fontSize: 6.83, bold: true, color: C.purple })
  })

  // ── Linhas da tabela (todos os projetos, max 6 para caber no slide) ──
  const MAX_ROWS = 6
  const ROW_H    = 0.388
  let rowY = 2.932
  for (const p of projects.slice(0, MAX_ROWS)) {
    const status = (STATUS_LBL[p.farol] ?? p.farol).toUpperCase()
    const color  = STATUS_COLOR[p.farol] ?? C.dark
    txt(s, trunc(p.nome, 28),                    colX[0], rowY, colW[0], ROW_H, { fontSize: 6.83, bold: true, color: C.dark })
    txt(s, NAT_LBL[p.natureza] ?? p.natureza,    colX[1], rowY, colW[1], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    txt(s, `${p.pct_evolucao}%`,                 colX[2], rowY, colW[2], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    txt(s, status,                               colX[3], rowY, colW[3], ROW_H, { fontSize: 6.83, bold: true, color })
    txt(s, fmtDate(p.data_fim_prevista),         colX[4], rowY, colW[4], ROW_H, { fontSize: 7.27, color: C.dark, wrap: false })
    rowY += ROW_H
  }

  if (projects.length > MAX_ROWS) {
    txt(s, `+ ${projects.length - MAX_ROWS} projeto${projects.length - MAX_ROWS > 1 ? 's' : ''} adicionais — ver slides individuais`,
      colX[0], rowY + 0.05, 9.0, 0.20, { fontSize: 6.5, color: C.gray, italic: true })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 4: Projetos em Destaque ──────────────────────────────────────────
async function slideDestaques(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-destaque.jpeg', loader)

  addSlideHeader(s, 'Projetos em Destaque',
    'Dois projetos concentram os riscos do portfólio e requerem atenção imediata da liderança.')

  const critico   = projects.find(p => p.farol === 'vermelho')
  const emRisco   = projects.find(p => p.farol === 'amarelo')
  const concluido = projects.find(p => p.farol === 'azul')

  // Colunas: posições exatas do template
  const columns: Array<{
    proj: Project | undefined
    label: string
    color: string
    badgeX: number
    colX: number
  }> = [
    { proj: critico,   label: 'CRÍTICO',   color: C.red,    badgeX: 1.133, colX: 0.977 },
    { proj: emRisco,   label: 'EM RISCO',  color: C.yellow, badgeX: 4.076, colX: 3.919 },
    { proj: concluido, label: 'CONCLUÍDO', color: C.blue,   badgeX: 7.018, colX: 6.862 },
  ]
  const COL_W    = 2.318
  const BADGE_Y  = 1.584
  const NOME_Y   = 1.815
  const LINE1_Y  = 2.340   // progresso · prazo
  const LINE2_Y  = 2.590   // desvio / benefício
  const LINE3_Y  = 2.843   // contexto
  const LINE4_Y  = 3.525   // decisão / destaque

  for (const col of columns) {
    const { proj, label, color, badgeX, colX } = col
    const nat = proj ? (NAT_LBL[proj.natureza] ?? proj.natureza).toUpperCase() : ''

    // Badge (sem retângulo colorido — apenas texto, posições exatas do template)
    txt(s, `${label} · ${nat}`, badgeX, BADGE_Y, COL_W, 0.113,
      { fontSize: 5.84, bold: true, color, wrap: false })

    if (!proj) {
      txt(s, 'Sem projeto nesta categoria', colX, NOME_Y, COL_W, 0.250,
        { fontSize: 9, color: C.gray })
      continue
    }

    // Nome do projeto — cor PURPLE conforme template
    txt(s, trunc(proj.nome, 30), colX, NOME_Y, COL_W, 0.400,
      { fontSize: 11.93, bold: true, color: C.purple })

    // Linha 1: progresso · prazo — BOLD PURPLE
    const prazoLabel = proj.farol === 'azul' ? 'Entregue' : 'Prazo'
    txt(s,
      `${proj.pct_evolucao}% Concluído · ${prazoLabel}: ${fmtDate(proj.data_fim_prevista)}`,
      colX, LINE1_Y, COL_W, 0.175, { fontSize: 6.83, bold: true, color: C.purple, wrap: false })

    // Linha 2: desvio ou benefício — BOLD DARK
    const desvios = (proj.desvios ?? [])
    const line2 = proj.farol === 'azul'
      ? `Benefício: ${trunc(clean(proj.beneficios), 60)}`
      : desvios.length > 0
        ? `Desvio: ${desvios[0][0].toUpperCase() + desvios[0].slice(1)}`
        : 'Nenhum desvio registrado'
    txt(s, line2, colX, LINE2_Y, COL_W, 0.175,
      { fontSize: 6.83, bold: true, color: C.dark, wrap: false })

    // Linha 3: contexto — BOLD DARK
    const line3 = proj.farol === 'azul'
      ? `Destaque: ${trunc(clean(proj.beneficios), 80)}`
      : `Contexto: ${trunc(clean(proj.descricao), 80)}`
    txt(s, line3, colX, LINE3_Y, COL_W, 0.350,
      { fontSize: 6.83, bold: true, color: C.dark })

    // Linha 4: decisão / destaque — BOLD DARK
    const line4 = proj.farol === 'azul'
      ? 'Destaque: Entrega validada, documentar lições aprendidas.'
      : 'Decisão necessária: Definir continuidade, pausa ou repriorização.'
    txt(s, line4, colX, LINE4_Y, COL_W, 0.350,
      { fontSize: 6.83, bold: true, color: C.dark })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 5: Distribuição Trimestral ───────────────────────────────────────
async function slideTrimestral(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-trimestral.jpeg', loader)

  addSlideHeader(s, 'Distribuição Trimestral',
    'Concentração de entregas por quarter e gestão de capacidade das equipes.')

  const quarters: Record<number, Project[]> = { 1: [], 2: [], 3: [], 4: [] }
  projects.forEach(p => {
    const q = quarterOf(p.data_fim_prevista)
    if (q && quarters[q]) quarters[q].push(p)
  })

  const maxCount = Math.max(...Object.values(quarters).map(a => a.length))
  const COL_STARTS = [0.300, 2.700, 5.100, 7.500]
  const COL_W = 2.100

  for (let q = 1; q <= 4; q++) {
    const x  = COL_STARTS[q - 1]
    const ps = quarters[q]
    const count = ps.length

    txt(s, `Q${q}`, x, 1.300, 0.600, 0.280,
      { fontSize: 16, bold: true, color: C.purple, wrap: false })
    txt(s, String(count), x, 1.600, 0.600, 0.380,
      { fontSize: 22, bold: true, color: C.purple, wrap: false })

    const ctxLabel = count === 0 ? 'SEM ENTREGAS'
      : count === maxCount && maxCount > 0 ? 'MAIOR CARGA'
      : count === 1 ? 'PROJETO' : 'PROJETOS'
    txt(s, ctxLabel, x, 2.010, COL_W, 0.180,
      { fontSize: 6.5, color: C.gray, wrap: false })

    s.addShape('rect', { x, y: 2.210, w: COL_W, h: 0.015,
      fill: { color: C.light }, line: { color: C.light } })

    const MAX_PER_Q = 3
    let projY = 2.260
    for (const p of ps.slice(0, MAX_PER_Q)) {
      const st = STATUS_LBL[p.farol] ?? p.farol
      const co = STATUS_COLOR[p.farol] ?? C.dark
      // Status em texto colorido (sem quadrado/ícone para não poluir o visual)
      txt(s, st.toUpperCase(), x, projY, COL_W, 0.150,
        { fontSize: 6, bold: true, color: co, wrap: false })
      txt(s, trunc(p.nome, 28), x, projY + 0.160, COL_W, 0.180,
        { fontSize: 7.5, bold: true, color: C.dark })
      txt(s, `Término: ${fmtDate(p.data_fim_prevista)}`, x, projY + 0.350, COL_W, 0.150,
        { fontSize: 6.5, color: C.gray, wrap: false })
      projY += 0.540
    }
    if (ps.length > MAX_PER_Q) {
      txt(s, `+ ${ps.length - MAX_PER_Q} projeto${ps.length - MAX_PER_Q > 1 ? 's' : ''}`,
        x, projY + 0.05, COL_W, 0.150, { fontSize: 6.5, color: C.gray, italic: true })
    }
  }

  const maxQ = Object.entries(quarters).reduce((a, b) => b[1].length > a[1].length ? b : a)
  const pct  = projects.length > 0 ? Math.round(Number(maxQ[1].length) / projects.length * 100) : 0
  const insight = pct > 0
    ? `Insight: Q${maxQ[0]} concentra ${pct}% das entregas previstas — atenção à capacidade das equipes.`
    : 'Insight: Nenhuma entrega com prazo definido neste ciclo — atualizar datas previstas.'
  txt(s, insight, 0.300, 4.900, 9.400, 0.380, { fontSize: 7.8, bold: true, color: C.dark })

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE: Projeto Individual ───────────────────────────────────────────────
async function slideProject(
  prs: typeof PptxGenJS,
  proj: Project,
  idx: number,
  totalProjects: number,
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  const bgFile = proj.farol === 'vermelho' ? 'slide-project-critico.jpeg'
    : proj.farol === 'amarelo' ? 'slide-project-risco.jpeg'
    : 'slide-project-concluido.jpeg'
  await addBg(s, bgFile, loader)

  const st    = (STATUS_LBL[proj.farol] ?? proj.farol).toUpperCase()
  const nat   = (NAT_LBL[proj.natureza] ?? proj.natureza).toUpperCase()
  const color = STATUS_COLOR[proj.farol] ?? C.dark

  // ── Badge: STATUS · NATUREZA · PROJETO N/N ──────────────────────────────
  txt(s, `${st} · ${nat} · PROJETO ${idx}/${totalProjects}`,
    0.938, 0.486, 2.121, 0.113,
    { fontSize: 5.84, bold: true, color, wrap: false })

  // ── Nome do projeto ──────────────────────────────────────────────────────
  txt(s, trunc(proj.nome, 50), 0.781, 0.678, 4.178, 0.457,
    { fontSize: 24.36, bold: true, color: C.purple })

  // ── Responsável · Início · Término ──────────────────────────────────────
  txt(s,
    `Responsável: ${proj.responsavel ?? '–'}  ·  Início: ${fmtDate(proj.data_inicio)}  ·  Término Previsto: ${fmtDate(proj.data_fim_prevista)}`,
    0.781, 1.213, 4.178, 0.133,
    { fontSize: 7.27, color: C.gray, wrap: false })

  // ── % (canto superior direito) ───────────────────────────────────────────
  txt(s, `${proj.pct_evolucao}%`, 8.564, 0.469, 0.811, 0.375,
    { fontSize: 24.36, bold: true, color, wrap: false, align: 'right' })
  txt(s, st, 8.564, 0.883, 0.811, 0.133,
    { fontSize: 7.27, color: C.gray, wrap: false, align: 'right' })

  // ── Frase de impacto — BOLD PURPLE (posição exata do template) ──────────
  const impacto = proj.farol === 'azul'
    ? trunc(clean(proj.beneficios), 140) || 'Entrega realizada com sucesso.'
    : proj.farol === 'vermelho'
      ? 'Maior oportunidade de ganho operacional do portfólio — exige decisão imediata.'
      : 'Projeto em risco — monitoramento intensificado necessário.'
  txt(s, impacto, 0.781, 1.830, 8.594, 0.197,
    { fontSize: 9.87, bold: true, color: C.purple })

  // ── DESCRIÇÃO ────────────────────────────────────────────────────────────
  txt(s, 'DESCRIÇÃO DO PROJETO',
    0.781, 2.340, 2.656, 0.266,
    { fontSize: 8.85, bold: true, color: C.purple })
  txt(s, trunc(clean(proj.descricao), 400),
    0.781, 2.762, 2.656, 1.000,
    { fontSize: 8.34, color: C.dark })

  // ── BENEFÍCIOS ───────────────────────────────────────────────────────────
  txt(s, 'BENEFÍCIOS ESPERADOS',
    3.750, 2.340, 2.656, 0.266,
    { fontSize: 8.85, bold: true, color: C.purple })

  const benefLines = parseLines(proj.beneficios)
  if (benefLines.length === 0) benefLines.push(clean(proj.beneficios) || '–')

  // Primeiro item: bold + destaque (posição fixa do template)
  txt(s, trunc(benefLines[0], 50),
    3.906, 2.783, 2.203, 0.156,
    { fontSize: 7.84, bold: true, color: C.dark, wrap: false })

  // Itens seguintes: regular
  const benefRest = benefLines.slice(1, 3)
  const benefYStarts = [3.079, 3.596]
  benefRest.forEach((line, i) => {
    txt(s, trunc(line, 60),
      3.906, benefYStarts[i], 2.500, 0.400,
      { fontSize: 8.34, color: C.dark })
  })

  // ── RISCOS & DESVIOS ─────────────────────────────────────────────────────
  txt(s, 'RISCOS & DESVIOS',
    6.719, 2.340, 2.656, 0.266,
    { fontSize: 8.85, bold: true, color: C.purple })

  // Desvio — para projetos concluídos usa cor neutra (dark) para evitar linha azul
  const desvioColor = proj.farol === 'azul' ? C.dark : color
  const desvioText = (proj.desvios ?? []).length > 0
    ? `Desvio de ${proj.desvios![0][0].toUpperCase() + proj.desvios![0].slice(1)} identificado`
    : proj.farol === 'azul' ? 'Entregue sem desvios críticos' : 'Nenhum desvio registrado'
  txt(s, desvioText,
    6.875, 2.762, 2.500, 0.200,
    { fontSize: 7.84, bold: true, color: desvioColor })

  // Riscos (regular dark)
  const riskLines = parseLines(proj.riscos)
  if (riskLines.length === 0) {
    riskLines.push(proj.farol === 'azul'
      ? 'Projeto entregue com sucesso no prazo'
      : 'Nenhum risco formal registrado no sistema')
  }
  riskLines.push(proj.farol === 'azul'
    ? 'Documentar lições aprendidas para o próximo ciclo'
    : 'Recomendação: formalizar riscos e plano de ação')
  const riskYStarts = [3.079, 3.596]
  riskLines.slice(0, 2).forEach((line, i) => {
    txt(s, trunc(line, 60),
      6.875, riskYStarts[i], 2.500, 0.400,
      { fontSize: 8.34, color: C.dark })
  })

  // ── DECISÃO EXECUTIVA ────────────────────────────────────────────────────
  // Usa roxo para projetos concluídos (evita rótulo azul que renderiza como linha fina)
  const decLabelColor = proj.farol === 'azul' ? C.purple : color
  const decLabel = proj.farol === 'azul' ? 'RECOMENDAÇÃO' : 'DECISÃO EXECUTIVA NECESSÁRIA'
  txt(s, decLabel,
    1.016, 4.543, 8.125, 0.266,
    { fontSize: 8.85, bold: true, color: decLabelColor })

  const decText = proj.farol === 'azul'
    ? '"Documentar as práticas de gestão deste projeto como referência para os próximos ciclos do portfólio."'
    : '"Definir até a próxima reunião de comitê: continuidade do projeto no escopo atual, repriorização ou pausa estratégica."'
  txt(s, decText,
    1.016, 4.810, 8.125, 0.350,
    { fontSize: 9.42, color: C.dark })

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE: Riscos Consolidados ─────────────────────────────────────────────
async function slideRiscos(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-riscos.jpeg', loader)

  addSlideHeader(s, 'Riscos Consolidados',
    'Vetores críticos de risco que requerem ação coordenada da liderança.')

  // ── Coluna esquerda: Matriz de Risco ──
  txt(s, 'Matriz de Risco', 0.781, 1.342, 3.693, 0.266,
    { fontSize: 11.93, bold: true, color: C.purple })

  let mx = 0.781, my = 2.000
  for (const p of projects.slice(0, 4)) {
    const clr = STATUS_COLOR[p.farol] ?? C.dark
    txt(s, `● ${trunc(p.nome, 22)}`, mx, my, 3.5, 0.25,
      { fontSize: 7.5, bold: true, color: clr })
    my += 0.280
  }

  // ── Coluna direita: Ações Requeridas ──
  txt(s, 'Ações Requeridas', 4.943, 1.342, 4.432, 0.266,
    { fontSize: 11.93, bold: true, color: C.purple })

  // Cabeçalhos da tabela
  const hx  = [4.943, 6.118, 6.659, 8.507]
  const hw  = [1.175, 0.541, 1.848, 0.868]
  const hdrs = ['Projeto', 'Desvio', 'Ação Requerida', 'Prazo']
  hdrs.forEach((h, i) => {
    txt(s, h, hx[i], 1.727, hw[i], 0.266,
      { fontSize: 6.83, bold: true, color: C.purple })
  })

  const prazoPorFarol = (f: string) =>
    f === 'vermelho' ? 'IMEDIATO' : f === 'amarelo' ? 'PRÓX. COMITÊ' : 'PRÓX. CICLO'
  const prazoColor = (f: string) =>
    f === 'vermelho' ? C.red : f === 'amarelo' ? C.yellow : C.blue

  const comRisco = projects.filter(p => (p.desvios ?? []).length > 0 || p.farol === 'vermelho' || p.farol === 'amarelo')
  const rowYs = [2.102, 2.676, 3.246]
  const ROW_H = 0.389

  comRisco.slice(0, 3).forEach((p, i) => {
    const ry    = rowYs[i]
    const desvio = (p.desvios ?? [])[0] ?? 'prazo'
    const acao   = p.farol === 'vermelho'
      ? 'Revisar viabilidade e cronograma'
      : p.farol === 'amarelo'
        ? 'Aprovar plano de ação'
        : 'Documentar lições aprendidas'
    const prazo = prazoPorFarol(p.farol)
    const pColor = prazoColor(p.farol)
    const nColor = STATUS_COLOR[p.farol] ?? C.dark

    txt(s, trunc(p.nome, 18),
      hx[0], ry + 0.128, hw[0], ROW_H - 0.128,
      { fontSize: 6.83, bold: true, color: nColor })
    txt(s, desvio[0].toUpperCase() + desvio.slice(1),
      hx[1], ry, hw[1], ROW_H,
      { fontSize: 7.27, color: C.dark })
    txt(s, acao,
      hx[2], ry, hw[2], ROW_H,
      { fontSize: 7.27, color: C.dark })
    txt(s, prazo,
      hx[3], ry, hw[3], ROW_H,
      { fontSize: 6.83, bold: true, color: pColor, wrap: false })
  })

  // Nota de governança
  const semRiscos = projects.filter(p => !p.riscos && (p.desvios ?? []).length === 0)
  if (semRiscos.length > 0) {
    txt(s,
      `Nota de Governança: ${semRiscos.length} projeto(s) sem riscos formais — recomenda-se formalização.`,
      4.943, 3.891, 4.432, 0.500,
      { fontSize: 7.27, color: C.gray })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE: Recomendações Executivas ────────────────────────────────────────
async function slideRecomendacoes(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-recomendacoes.jpeg', loader)

  addSlideHeader(s, 'Recomendações Executivas',
    'Quatro ações concentram 80% do impacto necessário para estabilizar o portfólio neste ciclo.')

  // ── Ícones dos quadrantes ─────────────────────────────────────────────────
  const iconFiles = ['icon-rec-1.png', 'icon-rec-2.png', 'icon-rec-3.png', 'icon-rec-4.png']
  const iconPositions = [
    { x: 0.977, y: 1.547, w: 0.102, h: 0.094 },
    { x: 5.391, y: 1.547, w: 0.078, h: 0.094 },
    { x: 0.977, y: 3.799, w: 0.102, h: 0.094 },
    { x: 5.391, y: 3.799, w: 0.078, h: 0.094 },
  ]
  for (let i = 0; i < 4; i++) {
    try {
      const iconData = await loader(iconFiles[i])
      s.addImage({ data: iconData, ...iconPositions[i] })
    } catch { /* ícone opcional */ }
  }

  const critico  = projects.find(p => p.farol === 'vermelho')
  const emRisco  = projects.find(p => p.farol === 'amarelo')
  const entregue = projects.find(p => p.farol === 'azul')

  // Dados dos 4 quadrantes (posições exatas do template)
  type Rec = {
    label: string; color: string
    labelX: number; titleX: number; tW: number
    labelY: number; titleY: number
    act1Y: number; act2Y: number
    action1: string; action2: string
    respX: number; respY: number; prazoX: number
    resp: string; prazo: string
    title: string
  }

  const recs: Rec[] = [
    {
      label:   'AÇÃO IMEDIATA',
      color:   C.red,
      labelX:  1.141, titleX: 0.977, tW: 3.789,
      labelY:  1.537, titleY: 1.768,
      act1Y:   2.074, act2Y:  2.327,
      title:   critico
        ? `Convocar reunião de crise: ${trunc(critico.nome, 30)}`
        : 'Revisar projetos com desvios críticos',
      action1: 'Revisar cronograma e viabilidade do projeto',
      action2: 'Definir: continuidade, pausa ou repriorização',
      respX:   0.977, respY: 3.082,
      prazoX:  3.838,
      resp:    'C-Level / Patrocinador',
      prazo:   'Esta semana',
    },
    {
      label:   'MONITORAMENTO INTENSIFICADO',
      color:   C.yellow,
      labelX:  5.531, titleX: 5.391, tW: 3.789,
      labelY:  1.537, titleY: 1.768,
      act1Y:   2.264, act2Y:  2.517,
      title:   emRisco
        ? `Acionar plano de contingência: ${trunc(emRisco.nome, 25)}`
        : 'Monitorar projetos em risco',
      action1: 'Aprovar plano de ação para desvios de escopo',
      action2: `Estabelecer checkpoint semanal com ${emRisco?.responsavel ?? 'responsável'}`,
      respX:   5.391, respY: 3.051,
      prazoX:  8.104,
      resp:    'PMO + Gestor Regulatório',
      prazo:   'Próximos 7 dias',
    },
    {
      label:   'LIÇÕES APRENDIDAS',
      color:   C.blue,
      labelX:  1.141, titleX: 0.977, tW: 3.789,
      labelY:  3.789, titleY: 4.020,
      act1Y:   4.327, act2Y:  4.580,
      title:   entregue
        ? `Documentar entrega: ${trunc(entregue.nome, 28)}`
        : 'Documentar entregas do ciclo',
      action1: 'Registrar metodologia e fatores de sucesso',
      action2: 'Aplicar aprendizados nos projetos em andamento',
      respX:   0.977, respY: 5.303,
      prazoX:  3.459,
      resp:    `${entregue?.responsavel ?? 'Responsável'} + PMO`,
      prazo:   'Próximas 2 semanas',
    },
    {
      label:   'GOVERNANÇA',
      color:   C.purple,
      labelX:  5.531, titleX: 5.391, tW: 3.789,
      labelY:  3.789, titleY: 4.020,
      act1Y:   4.327, act2Y:  4.580,
      title:   'Atualizar sistema de gestão',
      action1: 'Formalizar riscos identificados no sistema',
      action2: 'Garantir status atualizado para próxima revisão',
      respX:   5.391, respY: 5.303,
      prazoX:  7.641,
      resp:    'PMO Chubb',
      prazo:   'Antes do próximo comitê',
    },
  ]

  for (const r of recs) {
    txt(s, r.label, r.labelX, r.labelY, 2.500, 0.113,
      { fontSize: 5.84, bold: true, color: r.color, wrap: false })
    txt(s, r.title, r.titleX, r.titleY, r.tW, 0.189,
      { fontSize: 9.87, bold: true, color: C.purple })
    txt(s, r.action1, r.titleX, r.act1Y, r.tW, 0.175,
      { fontSize: 7.27, color: C.dark })
    txt(s, r.action2, r.titleX, r.act2Y, r.tW, 0.175,
      { fontSize: 7.27, color: C.dark })
    txt(s, `Responsável: ${r.resp}`, r.respX, r.respY, 2.000, 0.113,
      { fontSize: 6.21, color: C.gray })
    txt(s, `Prazo: ${r.prazo}`, r.prazoX, r.respY, 1.500, 0.113,
      { fontSize: 6.21, color: C.gray })
  }

  addFooter(s, orgName, today, pageNum, totalSlides, 5.577)
}

// ─── SLIDE: Próximos Passos ──────────────────────────────────────────────────
async function slideProximosPassos(
  prs: typeof PptxGenJS,
  projects: Project[],
  today: Date,
  loader: ImageLoader,
  pageNum: number,
  totalSlides: number,
  orgName: string,
) {
  const s = prs.addSlide()
  await addBg(s, 'slide-proximos-passos.jpeg', loader)

  addSlideHeader(s, 'Próximos Passos',
    'O portfólio tem capacidade de entrega comprovada — as decisões tomadas agora determinarão o resultado do próximo ciclo.')

  const critico  = projects.find(p => p.farol === 'vermelho')
  const emRisco  = projects.find(p => p.farol === 'amarelo')
  const entregue = projects.find(p => p.farol === 'azul')

  // Posições exatas do template (label / ação / responsável)
  const steps: Array<{ prazo: string; color: string; acao: string; resp: string }> = [
    {
      prazo: 'Esta semana',
      color: C.red,
      acao:  critico
        ? `Reunião de crise: ${trunc(critico.nome, 30)}`
        : 'Revisar projetos críticos',
      resp:  `C-Level + ${critico?.responsavel ?? 'Responsável'}`,
    },
    {
      prazo: 'Próximos 7 dias',
      color: C.yellow,
      acao:  emRisco
        ? `Aprovar plano de ação: ${trunc(emRisco.nome, 28)}`
        : 'Monitorar projetos em risco',
      resp:  `PMO + ${emRisco?.responsavel ?? 'Responsável'}`,
    },
    {
      prazo: 'Próximas 2 semanas',
      color: C.blue,
      acao:  entregue
        ? `Documentar lições: ${trunc(entregue.nome, 28)}`
        : 'Documentar entregas do ciclo',
      resp:  `${entregue?.responsavel ?? 'Responsável'} + PMO`,
    },
    {
      prazo: 'Antes do próx. comitê',
      color: C.purple,
      acao:  'Atualizar sistema de gestão',
      resp:  'PMO Chubb',
    },
  ]

  // Label y positions from template
  const labelYs  = [1.596, 2.490, 3.385, 4.279]
  // Action y positions from template (slightly above label)
  const actionYs = [1.498, 2.393, 3.287, 4.182]
  // Resp y positions from template (slightly below label)
  const respYs   = [1.709, 2.604, 3.498, 4.393]

  steps.forEach((step, i) => {
    txt(s, step.prazo,
      1.328, labelYs[i], 1.562, 0.152,
      { fontSize: 7.84, bold: true, color: step.color, wrap: false })
    txt(s, step.acao,
      3.055, actionYs[i], 6.086, 0.172,
      { fontSize: 8.85, bold: true, color: C.purple })
    txt(s, `Responsável: ${step.resp}`,
      3.055, respYs[i], 6.086, 0.137,
      { fontSize: 7.27, color: C.gray })
  })

  // ── Texto de encerramento (dentro da área visível do slide) ──
  const n      = projects.length
  const nCrit  = projects.filter(p => p.farol === 'vermelho').length
  const nRisco = projects.filter(p => p.farol === 'amarelo').length
  const nConc  = projects.filter(p => p.farol === 'azul').length
  txt(s,
    `Com ${n} projeto${n !== 1 ? 's' : ''} no portfólio (${nCrit} crítico${nCrit !== 1 ? 's' : ''}, ${nRisco} em risco, ${nConc} concluído${nConc !== 1 ? 's' : ''}), as decisões deste ciclo definirão a trajetória do portfólio.`,
    1.016, 4.750, 8.125, 0.225,
    { fontSize: 7.5, color: C.dark })
  txt(s, 'As decisões tomadas neste ciclo definirão a trajetória de entregas do próximo semestre.',
    1.016, 5.000, 8.125, 0.189,
    { fontSize: 7.84, bold: true, color: C.purple })

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── FUNÇÃO PRINCIPAL ────────────────────────────────────────────────────────
export async function generatePortfolioPptx(
  projects: Project[],
  orgName: string,
  loader: ImageLoader,
): Promise<Uint8Array> {
  const prs = new PptxGenJS()
  prs.defineLayout({ name: 'TEMPLATE', width: 10, height: 5.625 })
  prs.layout = 'TEMPLATE'

  const today = new Date()

  // Ordenação: vermelho → amarelo → verde → azul
  const farolOrder: Record<string, number> = { vermelho: 0, amarelo: 1, verde: 2, azul: 3 }
  const sorted = [...projects].sort((a, b) => (farolOrder[a.farol] ?? 4) - (farolOrder[b.farol] ?? 4))

  // Total: capa + visão + porQuarter + destaques + trimestral + N projetos + riscos + recomendações + próximos
  const totalSlides = 5 + sorted.length + 3

  await slideCover(prs, orgName, today, loader)
  await slideVisaoGeral(prs, sorted, today, loader, 2, totalSlides, orgName)
  await slideProjetosPorQuarter(prs, sorted, today, loader, 3, totalSlides, orgName)
  await slideDestaques(prs, sorted, today, loader, 4, totalSlides, orgName)
  await slideTrimestral(prs, sorted, today, loader, 5, totalSlides, orgName)

  for (let i = 0; i < sorted.length; i++) {
    await slideProject(prs, sorted[i], i + 1, sorted.length, today, loader, 6 + i, totalSlides, orgName)
  }

  const baseSlide = 6 + sorted.length
  await slideRiscos(prs, sorted, today, loader, baseSlide, totalSlides, orgName)
  await slideRecomendacoes(prs, sorted, today, loader, baseSlide + 1, totalSlides, orgName)
  await slideProximosPassos(prs, sorted, today, loader, baseSlide + 2, totalSlides, orgName)

  return await prs.write({ outputType: 'uint8array' })
}
