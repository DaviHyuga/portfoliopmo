// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/ui/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name)')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/onboarding')

  const orgs = member?.organizations as { name: string } | { name: string }[] | null
  const orgName = (Array.isArray(orgs) ? orgs[0]?.name : orgs?.name) ?? 'Minha Empresa'

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', member.organization_id)

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={orgName} projectCount={projectCount ?? 0} />
      <main className="flex-1 overflow-y-auto min-w-0">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
    </div>
  )
}
