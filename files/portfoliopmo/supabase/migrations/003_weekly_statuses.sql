-- =============================================
-- Status Recorrente — tabela de status semanais
-- =============================================

create table public.weekly_statuses (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  week_start        date not null, -- Segunda-feira da semana
  progresso         text not null default '',
  proximos_passos   text not null default '',
  riscos            text not null default '',
  acoes_mitigacao   text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(project_id, week_start)
);

alter table public.weekly_statuses enable row level security;

-- Membros da org podem ler status de projetos da sua org
create policy "org members can read weekly statuses"
  on public.weekly_statuses for select
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = weekly_statuses.project_id
        and om.user_id = auth.uid()
    )
  );

-- Membros (editor+admin) podem inserir e atualizar
create policy "editors can insert weekly statuses"
  on public.weekly_statuses for insert
  with check (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = weekly_statuses.project_id
        and om.user_id = auth.uid()
        and om.role in ('admin', 'editor')
    )
  );

create policy "editors can update weekly statuses"
  on public.weekly_statuses for update
  using (
    exists (
      select 1 from public.projects p
      join public.organization_members om on om.organization_id = p.organization_id
      where p.id = weekly_statuses.project_id
        and om.user_id = auth.uid()
        and om.role in ('admin', 'editor')
    )
  );

-- Índice para queries por semana
create index weekly_statuses_week_start_idx on public.weekly_statuses(week_start desc);
create index weekly_statuses_project_id_idx on public.weekly_statuses(project_id);
