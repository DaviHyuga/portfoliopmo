// src/app/(app)/projetos/page.tsx
import { getProjects } from '@/lib/projects'
import { ProjetosClient } from './_ProjetosClient'

export const revalidate = 0

export default async function ProjetosPage() {
  const projects = await getProjects()
  return <ProjetosClient initialProjects={projects} />
}
