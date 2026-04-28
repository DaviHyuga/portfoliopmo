// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/ui/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use SECURITY DEFINER RPC to bypass RLS for membership lookup.
  // Direct table queries via SSR can fail when auth.uid() isn't propagated
  // to the DB context — this function pattern is proven reliable in this app.
  type MemberRow = { organization_id: string; role: string; status: string }
  let member: MemberRow | null = null

  const { data: memberRows } = await supabase.rpc('get_my_membership')
  member = (memberRows as MemberRow[] | null)?.[0] ?? null

  // Fallback: if function not yet created, try direct query
  if (!member) {
    const { data: fallback } = await supabase
      .from('organization_members')
      .select('organization_id, role, status')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    member = fallback as MemberRow | null
  }

  if (!member) redirect('/onboarding')

  // Block pending / rejected users (only when status column exists)
  if (member.status && member.status !== 'active') {
    redirect('/aguardando-aprovacao')
  }

  // Fetch org name
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', member.organization_id)
    .single()

  const orgName = org?.name ?? 'Minha Empresa'

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
