// src/lib/pptx-generator.ts
// Gerador de PPTX fiel ao template executivo Portfólio Chubb
// Funciona tanto server-side (Node) quanto client-side (browser) via imageLoader abstrato
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

function addFooter(slide: Slide, orgName: string, today: Date, pageNum: number, total: number) {
  const mes = MESES[today.getMonth()]
  txt(slide, `${orgName} · ${mes}/${today.getFullYear()}`,
    0.781, 5.277, 2, 0.15, { fontSize: 6.2, color: C.gray })
  txt(slide, `${pageNum} / ${total}`,
    9.145, 5.277, 0.5, 0.15, { fontSize: 6.2, color: C.gray, align: 'right' })
}

// ─── Cabeçalho interno (título + subtítulo do slide) ────────────────────────
function addSlideHeader(slide: Slide, title: string, subtitle?: string) {
  txt(slide, title, 0.781, 0.469, 8.594, 0.305,
    { fontSize: 16, bold: true, color: C.purple })
  if (subtitle) {
    txt(slide, subtitle, 0.781, 0.852, 8.594, 0.225,
      { fontSize: 9.4, color: C.dark })
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
  txt(s, subMsg, 0.781, 0.852, 8.594, 0.225, { fontSize: 9.4, color: C.dark })

  // ── KPIs ──
  const kpis: [string | number, string, string][] = [
    [total,              'TOTAL DE PROJETOS',    C.purple],
    [`${media}%`,        'EVOLUÇÃO MÉDIA',        C.purple],
    [criticos + amarelo, 'EM RISCO / CRÍTICOS',   criticos > 0 ? C.red : C.yellow],
    [entregues,          'ENTREGUES NO CICLO',    C.green],
  ]
  const kxPositions = [0.938, 3.125, 5.312, 7.500]
  kpis.forEach(([val, lbl, color], i) => {
    const kx = kxPositions[i]
    // valor grande sem wrap para não quebrar "68%" em duas linhas
    txt(s, String(val), kx, 1.420, 1.719, 0.500, { fontSize: 24.4, bold: true, color, wrap: false })
    txt(s, lbl, kx, 1.960, 1.719, 0.180, { fontSize: 7.3, color: C.gray, wrap: false })
  })

  // ── Cabeçalho da tabela ──
  const colX = [0.781, 2.500, 3.600, 4.700, 6.200]
  const colW = [1.719, 1.100, 1.100, 1.500, 1.800]
  const hdrs = ['Projeto', 'Categoria', 'Progresso', 'Status', 'Término']
  hdrs.forEach((h, i) => {
    txt(s, h, colX[i], 2.600, colW[i], 0.250, { fontSize: 7, bold: true, color: C.purple })
  })
  // linha separadora
  s.addShape('rect', { x: 0.781, y: 2.850, w: 9.0, h: 0.020, fill: { color: C.light }, line: { color: C.light } })

  // ── Linhas da tabela (max 4) ──
  const MAX_ROWS = 4
  const ROW_H    = 0.340
  let rowY = 2.900
  for (const p of projects.slice(0, MAX_ROWS)) {
    const status = STATUS_LBL[p.farol] ?? p.farol
    const color  = STATUS_COLOR[p.farol] ?? C.dark
    txt(s, trunc(p.nome, 26),                    colX[0], rowY, colW[0], ROW_H, { fontSize: 7, bold: true,  color: C.dark,   wrap: true  })
    txt(s, NAT_LBL[p.natureza] ?? p.natureza,    colX[1], rowY, colW[1], ROW_H, { fontSize: 7, bold: false, color: C.dark,   wrap: false })
    txt(s, `${p.pct_evolucao}%`,                 colX[2], rowY, colW[2], ROW_H, { fontSize: 7, bold: true,  color,           wrap: false })
    txt(s, status,                               colX[3], rowY, colW[3], ROW_H, { fontSize: 7, bold: true,  color,           wrap: false })
    txt(s, fmtDate(p.data_fim_prevista),         colX[4], rowY, colW[4], ROW_H, { fontSize: 7, bold: false, color: C.dark,   wrap: false })
    // linha separadora de linha
    s.addShape('rect', { x: 0.781, y: rowY + ROW_H - 0.01, w: 9.0, h: 0.012, fill: { color: 'EEEEEE' }, line: { color: 'EEEEEE' } })
    rowY += ROW_H
  }

  // ── Nota de volume ──
  if (total > MAX_ROWS) {
    txt(s, `+ ${total - MAX_ROWS} projeto${total - MAX_ROWS > 1 ? 's' : ''} adicionais — ver slides individuais`,
      colX[0], rowY + 0.05, 9.0, 0.20, { fontSize: 6.5, color: C.gray, italic: true })
  }

  // ── Insight ──
  const mainCritico = projects.find(p => p.farol === 'vermelho')
  if (mainCritico) {
    txt(s,
      `⚠  Ação imediata: ${trunc(mainCritico.nome, 35)} — ${mainCritico.pct_evolucao}% concluído, prazo em ${fmtDate(mainCritico.data_fim_prevista)}.`,
      0.781, 4.900, 9.0, 0.400, { fontSize: 7.8, bold: true, color: C.dark })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 3: Projetos em Destaque ──────────────────────────────────────────
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
    'Os projetos que concentram atenção e riscos do portfólio.')

  const critico   = projects.find(p => p.farol === 'vermelho')
  const emRisco   = projects.find(p => p.farol === 'amarelo')
  const concluido = projects.find(p => p.farol === 'azul')

  // 3 colunas com largura fixa, x bem separado para não sobrepor
  const columns: Array<{ proj: Project | undefined; label: string; color: string; x: number }> = [
    { proj: critico,   label: 'CRÍTICO',   color: C.red,    x: 0.300 },
    { proj: emRisco,   label: 'EM RISCO',  color: C.yellow, x: 3.550 },
    { proj: concluido, label: 'CONCLUÍDO', color: C.green,  x: 6.800 },
  ]
  const COL_W = 2.900

  for (const col of columns) {
    const { proj, label, color, x } = col
    const nat = proj ? NAT_LBL[proj.natureza] ?? proj.natureza : '–'

    // Ícone colorido (pequeno retângulo)
    s.addShape('rect', { x, y: 1.520, w: 0.15, h: 0.15, fill: { color }, line: { color } })
    // Badge de status · categoria
    txt(s, `${label} · ${nat.toUpperCase()}`, x + 0.200, 1.520, COL_W - 0.220, 0.180,
      { fontSize: 7, bold: true, color, wrap: false })

    if (!proj) {
      txt(s, 'Sem projeto nesta categoria', x, 1.760, COL_W, 0.250, { fontSize: 9, color: C.gray })
      continue
    }

    // Nome do projeto (max 2 linhas)
    txt(s, trunc(proj.nome, 38), x, 1.740, COL_W, 0.420,
      { fontSize: 12, bold: true, color: C.dark })

    // Barra colorida abaixo do nome
    s.addShape('rect', { x, y: 2.170, w: COL_W, h: 0.025, fill: { color }, line: { color } })

    // Progresso e prazo
    txt(s,
      `${proj.pct_evolucao}% Concluído  ·  ${proj.farol === 'azul' ? 'Entregue' : 'Prazo'}: ${fmtDate(proj.data_fim_prevista)}`,
      x, 2.220, COL_W, 0.200, { fontSize: 7.5, color: C.gray, wrap: false })

    // Desvios
    const desvios = (proj.desvios ?? []).map(d => d[0].toUpperCase() + d.slice(1)).join(', ')
    if (desvios) {
      txt(s, `Desvio: ${desvios}`, x, 2.450, COL_W, 0.180, { fontSize: 8, color: C.dark, wrap: false })
    }

    // Contexto / Benefício
    const contexto = proj.farol === 'azul'
      ? `Benefício: ${trunc(clean(proj.beneficios), 130)}`
      : `Contexto: ${trunc(clean(proj.descricao), 130)}`
    txt(s, contexto, x, 2.660, COL_W, 0.700, { fontSize: 8, color: C.dark })

    // Decisão / Destaque
    const decisao = proj.farol === 'azul'
      ? 'Destaque: Entrega validada. Documentar lições aprendidas.'
      : 'Decisão necessária: Definir continuidade, pausa ou repriorização.'
    txt(s, decisao, x, 3.400, COL_W, 0.500, { fontSize: 8, color: C.dark })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 4: Distribuição Trimestral ───────────────────────────────────────
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

  // Máximo de projetos por quarter (para destacar MAIOR CONCENTRAÇÃO)
  const maxCount = Math.max(...Object.values(quarters).map(a => a.length))

  // Posições fixas das 4 colunas — mais largas para evitar wrapping
  // Cada coluna começa em: 0.30, 2.70, 5.10, 7.50 → largura 2.10"
  const COL_STARTS = [0.300, 2.700, 5.100, 7.500]
  const COL_W = 2.10

  for (let q = 1; q <= 4; q++) {
    const x  = COL_STARTS[q - 1]
    const ps = quarters[q]
    const count = ps.length

    // ── Badge "Q1" — texto único, sem wrap, fonte menor ──
    txt(s, `Q${q}`, x, 1.300, 0.600, 0.280, { fontSize: 16, bold: true, color: C.purple, wrap: false })

    // ── Contagem grande ──
    txt(s, String(count), x, 1.600, 0.600, 0.380, { fontSize: 22, bold: true, color: C.purple, wrap: false })

    // ── Label de contexto ──
    const ctxLabel = count === 0 ? 'SEM ENTREGAS'
      : count === maxCount && maxCount > 0 ? 'MAIOR CARGA'
      : count === 1 ? 'PROJETO' : 'PROJETOS'
    txt(s, ctxLabel, x, 2.010, COL_W, 0.180, { fontSize: 6.5, color: C.gray, wrap: false })

    // ── Linha separadora ──
    s.addShape('rect', { x, y: 2.210, w: COL_W, h: 0.015, fill: { color: C.light }, line: { color: C.light } })

    // ── Lista de projetos (max 3) ──
    const MAX_PER_Q = 3
    let projY = 2.260
    for (const p of ps.slice(0, MAX_PER_Q)) {
      const st = STATUS_LBL[p.farol] ?? p.farol
      const co = STATUS_COLOR[p.farol] ?? C.dark
      // Ícone colorido + status em uma linha
      s.addShape('rect', { x, y: projY + 0.030, w: 0.080, h: 0.080, fill: { color: co }, line: { color: co } })
      txt(s, st.toUpperCase(), x + 0.110, projY, COL_W - 0.110, 0.150,
        { fontSize: 6, bold: true, color: co, wrap: false })
      // Nome do projeto
      txt(s, trunc(p.nome, 28), x, projY + 0.160, COL_W, 0.180,
        { fontSize: 7.5, bold: true, color: C.dark })
      // Término
      txt(s, `Término: ${fmtDate(p.data_fim_prevista)}`, x, projY + 0.350, COL_W, 0.150,
        { fontSize: 6.5, color: C.gray, wrap: false })
      projY += 0.540
    }
    if (ps.length > MAX_PER_Q) {
      txt(s, `+ ${ps.length - MAX_PER_Q} projeto${ps.length - MAX_PER_Q > 1 ? 's' : ''}`,
        x, projY + 0.05, COL_W, 0.150, { fontSize: 6.5, color: C.gray, italic: true })
    }
  }

  // ── Insight ──
  const maxQ = Object.entries(quarters).reduce((a, b) => b[1].length > a[1].length ? b : a)
  const pct  = projects.length > 0 ? Math.round(Number(maxQ[1].length) / projects.length * 100) : 0
  const insight = pct > 0
    ? `Insight: Q${maxQ[0]} concentra ${pct}% das entregas previstas — atenção à capacidade das equipes.`
    : 'Insight: Nenhuma entrega com prazo definido neste ciclo — atualizar datas previstas.'
  txt(s, insight, 0.300, 4.900, 9.400, 0.380, { fontSize: 7.8, bold: true, color: C.dark })

  addFooter(s, orgName, today, pageNum, totalSlides)
}

// ─── SLIDE 5+: Projeto Individual ───────────────────────────────────────────
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

  const st  = (STATUS_LBL[proj.farol] ?? proj.farol).toUpperCase()
  const nat = (NAT_LBL[proj.natureza] ?? proj.natureza).toUpperCase()
  const color = STATUS_COLOR[proj.farol] ?? C.dark

  // ── Cabeçalho: badge status · natureza · número ──
  txt(s, `${st} · ${nat} · PROJETO ${idx}/${totalProjects}`,
    0.500, 0.420, 7.500, 0.200, { fontSize: 7, bold: true, color, wrap: false })

  // ── Nome do projeto ──
  txt(s, trunc(proj.nome, 55), 0.500, 0.640, 7.500, 0.500,
    { fontSize: 18, bold: true, color: C.purple })

  // ── Barra de progresso colorida ──
  const BAR_W = 8.500
  s.addShape('rect', { x: 0.500, y: 1.220, w: BAR_W, h: 0.060, fill: { color: 'EEEEEE' }, line: { color: 'EEEEEE' } })
  const filled = Math.max((proj.pct_evolucao / 100) * BAR_W, 0.05)
  s.addShape('rect', { x: 0.500, y: 1.220, w: filled, h: 0.060, fill: { color }, line: { color } })

  // ── Metadados ──
  txt(s,
    `Responsável: ${proj.responsavel ?? '–'}  ·  Início: ${fmtDate(proj.data_inicio)}  ·  Término Previsto: ${fmtDate(proj.data_fim_prevista)}`,
    0.500, 1.310, 8.000, 0.200, { fontSize: 8, color: C.gray, wrap: false })

  // ── % destaque (canto superior direito) — fonte menor e caixa maior para não quebrar ──
  txt(s, `${proj.pct_evolucao}%`, 8.300, 0.420, 1.400, 0.500,
    { fontSize: 28, bold: true, color, wrap: false, align: 'right' })
  txt(s, st, 8.300, 0.960, 1.400, 0.180,
    { fontSize: 7, color: C.gray, wrap: false, align: 'right' })

  // ── Frase de impacto ──
  const impacto = proj.farol === 'azul'
    ? trunc(clean(proj.beneficios), 140) || 'Entrega realizada com sucesso.'
    : proj.farol === 'vermelho'
      ? 'Projeto crítico — exige decisão imediata da liderança.'
      : 'Projeto em risco — monitoramento intensificado necessário.'
  txt(s, impacto, 0.500, 1.560, 9.000, 0.250, { fontSize: 9, color: C.dark })

  // ── 3 colunas: Descrição | Benefícios | Riscos & Desvios ──
  const C1X = 0.500, C2X = 3.500, C3X = 6.500
  const CW  = 2.750
  const SEC_Y = 1.880

  txt(s, 'DESCRIÇÃO DO PROJETO', C1X, SEC_Y, CW, 0.230, { fontSize: 8, bold: true, color: C.purple })
  s.addShape('rect', { x: C1X, y: SEC_Y + 0.240, w: CW, h: 0.018, fill: { color: C.light }, line: { color: C.light } })
  txt(s, trunc(clean(proj.descricao), 300), C1X, SEC_Y + 0.290, CW, 2.100,
    { fontSize: 8, color: C.dark })

  txt(s, 'BENEFÍCIOS ESPERADOS', C2X, SEC_Y, CW, 0.230, { fontSize: 8, bold: true, color: C.purple })
  s.addShape('rect', { x: C2X, y: SEC_Y + 0.240, w: CW, h: 0.018, fill: { color: C.light }, line: { color: C.light } })
  const benefLines = parseLines(proj.beneficios).slice(0, 5)
  if (benefLines.length === 0) benefLines.push(trunc(clean(proj.beneficios), 250) || '–')
  benefLines.forEach((line, i) => {
    txt(s, `• ${line}`, C2X, SEC_Y + 0.310 + i * 0.320, CW, 0.380, { fontSize: 7.5, color: C.dark })
  })

  txt(s, 'RISCOS & DESVIOS', C3X, SEC_Y, CW, 0.230, { fontSize: 8, bold: true, color: C.purple })
  s.addShape('rect', { x: C3X, y: SEC_Y + 0.240, w: CW, h: 0.018, fill: { color: C.light }, line: { color: C.light } })
  const riskLines: string[] = []
  ;(proj.desvios ?? []).forEach(d => riskLines.push(`Desvio de ${d[0].toUpperCase() + d.slice(1)} identificado`))
  parseLines(proj.riscos).slice(0, 4).forEach(l => riskLines.push(l))
  if (riskLines.length === 0) riskLines.push('Nenhum risco formal registrado')
  riskLines.slice(0, 5).forEach((line, i) => {
    txt(s, `• ${line}`, C3X, SEC_Y + 0.310 + i * 0.320, CW, 0.380, { fontSize: 7.5, color: C.dark })
  })

  // ── Decisão executiva ──
  const DEC_Y = 4.350
  if (proj.farol !== 'azul') {
    txt(s, 'DECISÃO EXECUTIVA NECESSÁRIA', 0.500, DEC_Y, 9.000, 0.200,
      { fontSize: 8, bold: true, color: C.purple })
    txt(s,
      '"Definir até a próxima reunião de comitê: continuidade do projeto no escopo atual, repriorização ou pausa estratégica."',
      0.500, DEC_Y + 0.230, 9.000, 0.300, { fontSize: 8, color: C.dark })
  } else {
    txt(s, 'RECOMENDAÇÃO', 0.500, DEC_Y, 9.000, 0.200,
      { fontSize: 8, bold: true, color: C.green })
    txt(s,
      '"Documentar as práticas de gestão deste projeto como referência para os próximos ciclos do portfólio."',
      0.500, DEC_Y + 0.230, 9.000, 0.300, { fontSize: 8, color: C.dark })
  }

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

  // Tabela de ações à direita
  txt(s, 'Ações Requeridas', 4.943, 1.342, 4.432, 0.266,
    { fontSize: 10, bold: true, color: C.purple })

  const hdrs = ['Projeto', 'Desvio', 'Ação Requerida', 'Prazo']
  const hx   = [5.021, 6.118, 6.659, 8.507]
  const hw   = [0.715, 0.541, 1.848, 0.868]
  hdrs.forEach((h, i) => {
    txt(s, h, hx[i], 1.727, hw[i], 0.266,
      { fontSize: 6.8, bold: true, color: C.purple })
  })

  const comDesvio = projects.filter(p => (p.desvios ?? []).length > 0 || p.farol === 'vermelho')
  const prazoPorFarol = (f: string) => f === 'vermelho' ? 'IMEDIATO' : f === 'amarelo' ? 'PRÓX. COMITÊ' : 'PRÓX. CICLO'

  let ry = 2.102
  for (const p of comDesvio.slice(0, 5)) {
    if (ry > 4.5) break
    const desvio = (p.desvios ?? [])[0] ?? 'prazo'
    const acao = p.farol === 'vermelho'
      ? 'Revisar viabilidade e cronograma'
      : p.farol === 'amarelo'
        ? 'Aprovar plano de ação'
        : 'Documentar lições aprendidas'
    const prazo = prazoPorFarol(p.farol)
    const color = STATUS_COLOR[p.farol] ?? C.dark

    txt(s, trunc(p.nome, 18), hx[0], ry + 0.22, hw[0], 0.137, { fontSize: 6.8, bold: true, color })
    txt(s, desvio[0].toUpperCase() + desvio.slice(1), hx[1], ry, hw[1], 0.389, { fontSize: 7.3, color: C.dark })
    txt(s, acao, hx[2], ry, hw[2], 0.389, { fontSize: 7.3, color: C.dark })
    txt(s, prazo, hx[3], ry, hw[3], 0.389, { fontSize: 7.3, bold: true, color })
    ry += 0.574
  }

  // Nota de governança
  const semRiscos = projects.filter(p => !p.riscos && (p.desvios ?? []).length === 0)
  if (semRiscos.length > 0) {
    txt(s,
      `Nota de Governança: ${semRiscos.length} projeto(s) sem riscos formais registrados — recomenda-se formalização imediata.`,
      4.943, 3.891, 4.432, 0.500, { fontSize: 7.3, color: C.gray })
  }

  // Matriz de risco (coluna esquerda) — tabela textual simplificada
  txt(s, 'Matriz de Risco', 0.781, 1.342, 3.693, 0.266, { fontSize: 10, bold: true, color: C.purple })
  txt(s, 'Probabilidade', 2.225, 4.562, 0.805, 0.113, { fontSize: 6, color: C.gray })
  txt(s, 'Impacto', 0.430, 3.027, 0.475, 0.500, { fontSize: 6, color: C.gray })

  let mx = 0.781, my = 2.000
  for (const p of projects.slice(0, 3)) {
    const color = STATUS_COLOR[p.farol] ?? C.dark
    txt(s, `● ${trunc(p.nome, 22)}`, mx, my, 3.5, 0.25, { fontSize: 7.5, bold: true, color })
    my += 0.28
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
    'Ações que concentram o maior impacto para estabilizar o portfólio neste ciclo.')

  const critico  = projects.find(p => p.farol === 'vermelho')
  const emRisco  = projects.find(p => p.farol === 'amarelo')
  const entregue = projects.find(p => p.farol === 'azul')

  type Rec = { label: string; title: string; actions: string[]; resp: string; prazo: string; x: number; y: number }

  const recs: Rec[] = [
    {
      label:   'AÇÃO IMEDIATA',
      title:   critico ? `Convocar reunião de crise: ${trunc(critico.nome, 30)}` : 'Revisar projetos com desvios',
      actions: [
        'Revisar cronograma e viabilidade do projeto',
        'Definir: continuidade, pausa ou repriorização',
      ],
      resp:  'C-Level / Patrocinador',
      prazo: 'Esta semana',
      x: 0.977, y: 1.537,
    },
    {
      label:   'MONITORAMENTO INTENSIFICADO',
      title:   emRisco ? `Acionar plano de contingência: ${trunc(emRisco.nome, 25)}` : 'Monitorar projetos em risco',
      actions: [
        'Aprovar plano de ação para desvios de escopo',
        'Estabelecer checkpoint semanal com responsável',
      ],
      resp:  'PMO + Gestor Regulatório',
      prazo: 'Próximos 7 dias',
      x: 5.391, y: 1.537,
    },
    {
      label:   'LIÇÕES APRENDIDAS',
      title:   entregue ? `Documentar entrega: ${trunc(entregue.nome, 28)}` : 'Documentar entregas do ciclo',
      actions: [
        'Registrar metodologia e fatores de sucesso',
        'Aplicar aprendizados nos projetos em andamento',
      ],
      resp:  'PMO + Responsável',
      prazo: 'Próximas 2 semanas',
      x: 0.977, y: 3.789,
    },
    {
      label:   'GOVERNANÇA',
      title:   'Atualizar sistema de gestão',
      actions: [
        'Formalizar riscos identificados no sistema',
        'Garantir status atualizado para próxima revisão',
      ],
      resp:  'PMO Chubb',
      prazo: 'Antes do próximo comitê',
      x: 5.391, y: 3.789,
    },
  ]

  for (const r of recs) {
    txt(s, r.label, r.x + 0.164, r.y, 3.625, 0.113, { fontSize: 7, bold: true, color: C.purple })
    txt(s, r.title, r.x, r.y + 0.231, 3.789, 0.25, { fontSize: 8.5, bold: true, color: C.dark })
    r.actions.forEach((a, i) => {
      txt(s, a, r.x, r.y + 0.537 + i * 0.253, 3.789, 0.25, { fontSize: 7.5, color: C.dark })
    })
    txt(s, `Responsável: ${r.resp}`, r.x, r.y + 1.545, 1.723, 0.2, { fontSize: 7, color: C.gray })
    txt(s, `Prazo: ${r.prazo}`, r.x + 2.461, r.y + 1.545, 1.328, 0.2, { fontSize: 7, color: C.gray })
  }

  addFooter(s, orgName, today, pageNum, totalSlides)
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

  const steps = [
    {
      prazo: 'Esta semana',
      acao:  critico ? `Reunião de crise: ${trunc(critico.nome, 30)}` : 'Revisar projetos críticos',
      resp:  `C-Level + ${critico?.responsavel ?? 'Responsável'}`,
    },
    {
      prazo: 'Próximos 7 dias',
      acao:  emRisco ? `Aprovar plano de ação: ${trunc(emRisco.nome, 28)}` : 'Monitorar projetos em risco',
      resp:  `PMO + ${emRisco?.responsavel ?? 'Responsável'}`,
    },
    {
      prazo: 'Próximas 2 semanas',
      acao:  entregue ? `Documentar lições: ${trunc(entregue.nome, 28)}` : 'Documentar entregas do ciclo',
      resp:  `${entregue?.responsavel ?? 'Responsável'} + PMO`,
    },
    {
      prazo: 'Antes do próx. comitê',
      acao:  'Atualizar sistema de gestão',
      resp:  'PMO Chubb',
    },
  ]

  const ySteps = [1.596, 2.490, 3.385, 4.279]
  steps.forEach((step, i) => {
    const y = ySteps[i]
    txt(s, step.prazo, 1.328, y, 1.562, 0.2, { fontSize: 8, bold: true, color: C.purple })
    txt(s, step.acao,  3.055, y - 0.098, 6.086, 0.2, { fontSize: 8.5, bold: true, color: C.dark })
    txt(s, `Responsável: ${step.resp}`, 3.055, y + 0.113, 6.086, 0.15, { fontSize: 7.5, color: C.gray })
  })

  // Encerramento
  const n = projects.length
  const nCrit = projects.filter(p => p.farol === 'vermelho').length
  const nRisco = projects.filter(p => p.farol === 'amarelo').length
  const nConc = projects.filter(p => p.farol === 'azul').length
  txt(s,
    `Com ${n} projeto${n !== 1 ? 's' : ''} no portfólio (${nCrit} crítico${nCrit !== 1 ? 's' : ''}, ${nRisco} em risco, ${nConc} concluído${nConc !== 1 ? 's' : ''}), as decisões deste ciclo definirão a trajetória do portfólio.`,
    1.016, 5.150, 8.125, 0.25, { fontSize: 7.5, color: C.gray })

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

  // Contagem total de slides: capa + visão + destaques + trimestral + N projetos + riscos + recomendações + próximos
  const totalSlides = 4 + sorted.length + 3

  await slideCover(prs, orgName, today, loader)
  await slideVisaoGeral(prs, sorted, today, loader, 2, totalSlides, orgName)
  await slideDestaques(prs, sorted, today, loader, 3, totalSlides, orgName)
  await slideTrimestral(prs, sorted, today, loader, 4, totalSlides, orgName)

  for (let i = 0; i < sorted.length; i++) {
    await slideProject(prs, sorted[i], i + 1, sorted.length, today, loader, 5 + i, totalSlides, orgName)
  }

  const baseSlide = 5 + sorted.length
  await slideRiscos(prs, sorted, today, loader, baseSlide, totalSlides, orgName)
  await slideRecomendacoes(prs, sorted, today, loader, baseSlide + 1, totalSlides, orgName)
  await slideProximosPassos(prs, sorted, today, loader, baseSlide + 2, totalSlides, orgName)

  return await prs.write({ outputType: 'uint8array' })
}
