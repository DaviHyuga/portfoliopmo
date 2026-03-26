// src/app/api/export/demo/pptx/route.ts
// Route de exportação PPTX para o modo demo — recebe projetos via POST body
import { NextRequest, NextResponse } from 'next/server'
import { generatePortfolioPptx } from '@/lib/pptx-generator'
import type { ImageLoader } from '@/lib/pptx-generator'
import path from 'path'
import fs from 'fs'
import type { Project } from '@/types'

const serverImageLoader: ImageLoader = async (filename: string) => {
  const filePath = path.join(process.cwd(), 'public', 'pptx-assets', filename)
  const data = fs.readFileSync(filePath)
  const b64  = data.toString('base64')
  const ext  = filename.endsWith('.png') ? 'png' : 'jpeg'
  return `data:image/${ext};base64,${b64}`
}

export async function POST(req: NextRequest) {
  try {
    const { projects, orgName } = await req.json() as { projects: Project[]; orgName: string }

    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'projects deve ser um array' }, { status: 400 })
    }

    const bytes  = await generatePortfolioPptx(projects, orgName ?? 'Chubb', serverImageLoader)
    const buffer = Buffer.from(bytes)
    const date   = new Date().toISOString().slice(0, 10)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="portfolio_executivo_${date}.pptx"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar PPTX demo:', err)
    return NextResponse.json({ error: 'Erro ao gerar PPTX' }, { status: 500 })
  }
}
