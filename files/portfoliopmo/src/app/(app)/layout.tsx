// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Sidebar } from '@/components/ui/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Use service client to look up membership by user.id — bypasses RLS entirely.
  // auth.uid() propagation to PostgreSQL is unreliable in Next.js SSR on Vercel,
  // even with SECURITY DEFINER functions. We already have the verified user from
  // supabase.auth.getUser() (JWT verification), so we can safely query by user.id.
  type MemberRow = { organization_id: string; role: string; status: string }
  let member: MemberRow | null = null

  try {
    const service = createServiceClient()
    const { data } = await service
      .from('organization_members')
      .select('organization_id, role, status')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    member = data as MemberRow | null
  } catch {
    // Service client unavailable — fall back to RPC
    const { data: memberRows } = await supabase.rpc('get_my_membership')
    member = (memberRows as MemberRow[] | null)?.[0] ?? null
  }

  if (!member) redirect('/onboarding')

  // Block pending / rejected users
  if (member.status && member.status !== 'active') {
    redirect('/aguardando-aprovacao')
  }

  // Fetch org name and project count via service client (same RLS bypass)
  let orgName = 'Minha Empresa'
  let projectCount = 0

  try {
    const service = createServiceClient()
    const { data: org } = await service
      .from('organizations')
      .select('name')
      .eq('id', member.organization_id)
      .single()
    orgName = org?.name ?? 'Minha Empresa'

    const { count } = await service
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', member.organization_id)
    projectCount = count ?? 0
  } catch {
    // Non-critical — sidebar still renders with defaults
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={orgName} projectCount={projectCount} />
      <main className="flex-1 overflow-y-auto min-w-0">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
    </div>
  )
}
