// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/ui/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Busca organização do usuário
  const { data: member } = await supabase
    .from('organization_members')
    .select('organizations(name)')
    .eq('user_id', user.id)
    .single()

  const orgs = member?.organizations as { name: string } | { name: string }[] | null
  const orgName = (Array.isArray(orgs) ? orgs[0]?.name : orgs?.name) ?? 'Minha Empresa'

  // Se não tem org, redireciona para onboarding
  if (!member) redirect('/onboarding')

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={orgName} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
