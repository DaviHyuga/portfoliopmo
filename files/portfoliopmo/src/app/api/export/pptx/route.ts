// src/app/api/export/pptx/route.ts
import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/projects'
import { generatePortfolioPptx } from '@/lib/pptx-generator'
import type { ImageLoader } from '@/lib/pptx-generator'
import path from 'path'
import fs from 'fs'

// Image loader server-side: lê arquivos da pasta public/pptx-assets
const serverImageLoader: ImageLoader = async (filename: string) => {
  const filePath = path.join(process.cwd(), 'public', 'pptx-assets', filename)
  const data = fs.readFileSync(filePath)
  const b64  = data.toString('base64')
  const ext  = filename.endsWith('.png') ? 'png' : 'jpeg'
  return `data:image/${ext};base64,${b64}`
}

export async function GET() {
  try {
    const projects = await getProjects()
    const bytes    = await generatePortfolioPptx(projects, 'Chubb', serverImageLoader)
    const date     = new Date().toISOString().slice(0, 10)
    const buffer   = Buffer.from(bytes)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="portfolio_executivo_${date}.pptx"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar PPTX:', err)
    return NextResponse.json({ error: 'Erro ao gerar PPTX' }, { status: 500 })
  }
}
