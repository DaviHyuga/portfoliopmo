// src/app/api/export/demo/csv/route.ts
// Route de exportação CSV para o modo demo — recebe projetos via POST body
import { NextRequest, NextResponse } from 'next/server'
import type { Project } from '@/types'

const STATUS_LBL: Record<string, string> = {
  verde: 'No Prazo', amarelo: 'Em Risco', vermelho: 'Crítico', azul: 'Concluído',
}
const NAT_LBL: Record<string, string> = {
  backoffice: 'Backoffice', regulatorio: 'Regulatório', negocios: 'Negócios', regional: 'Regional',
}

function esc(val: string | null | undefined): string {
  if (!val) return ''
  const s = val.replace(/"/g, '""').replace(/\r\n|\n|\r/g, ' | ')
  return `"${s}"`
}

export async function POST(req: NextRequest) {
  try {
    const { projects } = await req.json() as { projects: Project[] }

    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'projects deve ser um array' }, { status: 400 })
    }

    const cols = [
      'id', 'projeto', 'status', 'natureza', 'evolucao_%',
      'data_inicio', 'data_fim_prevista', 'responsavel',
      'desvios', 'descricao', 'beneficios', 'riscos',
    ]

    const rows = [
      cols.join(';'),
      ...projects.map(p =>
        [
          esc(p.id),
          esc(p.nome),
          STATUS_LBL[p.farol] ?? p.farol,
          NAT_LBL[p.natureza] ?? p.natureza,
          p.pct_evolucao,
          p.data_inicio ?? '',
          p.data_fim_prevista ?? '',
          esc(p.responsavel),
          (p.desvios ?? []).join(', '),
          esc(p.descricao),
          esc(p.beneficios),
          esc(p.riscos),
        ].join(';')
      ),
    ]

    const csv  = '\uFEFF' + rows.join('\n')
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="portfolio_demo_${date}.csv"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar CSV demo:', err)
    return NextResponse.json({ error: 'Erro ao gerar CSV' }, { status: 500 })
  }
}
