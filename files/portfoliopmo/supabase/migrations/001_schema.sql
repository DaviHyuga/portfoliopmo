-- =============================================
-- PortfolioPMO — Schema completo
-- Execute no Supabase SQL Editor
-- =============================================

-- Extensão UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- ORGANIZATIONS
-- =============================================
create table public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- =============================================
-- ORGANIZATION MEMBERS (quem pertence a qual org)
-- =============================================
create table public.organization_members (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at      timestamptz not null default now(),
  unique(organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- =============================================
-- PROJECTS
-- =============================================
create table public.projects (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  nome             text not null,
  descricao        text,
  beneficios       text,
  pct_evolucao     integer not null default 0 check (pct_evolucao between 0 and 100),
  farol            text not null check (farol in ('verde', 'amarelo', 'vermelho', 'azul')),
  natureza         text not null check (natureza in ('backoffice', 'regulatorio', 'negocios', 'regional')),
  desvios          text[] not null default '{}',
  responsavel      text,
  data_inicio      date,
  data_fim_prevista date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.projects enable row level security;

-- =============================================
-- PROJECT SNAPSHOTS (histórico de evolução)
-- =============================================
create table public.project_snapshots (
  id            uuid primary key default uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  pct_evolucao  integer not null,
  farol         text not null,
  snapshot_at   timestamptz not null default now()
);

alter table public.project_snapshots enable row level security;

-- =============================================
-- TRIGGER: updated_at automático
-- =============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- TRIGGER: snapshot automático ao salvar projeto
-- =============================================
create or replace function public.snapshot_project()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') or
     (TG_OP = 'UPDATE' and (
       old.pct_evolucao <> new.pct_evolucao or
       old.farol <> new.farol
     )) then
    insert into public.project_snapshots (project_id, pct_evolucao, farol)
    values (new.id, new.pct_evolucao, new.farol);
  end if;
  return new;
end;
$$;

create trigger projects_snapshot
  after insert or update on public.projects
  for each row execute procedure public.snapshot_project();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Organizations: membros veem sua própria org
create policy "members_select_org" on public.organizations
  for select using (
    id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organization Members: membros veem todos da mesma org
create policy "members_select_org" on public.organization_members
  for select using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Organization Members: admin pode adicionar membros à sua org
create policy "admins_insert_members" on public.organization_members
  for insert with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Organization Members: admin pode atualizar papel dos membros
create policy "admins_update_members" on public.organization_members
  for update using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Organization Members: admin pode remover membros (não a si mesmo)
create policy "admins_delete_members" on public.organization_members
  for delete using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role = 'admin'
    )
    and user_id <> auth.uid()
  );

-- Projects: qualquer membro da org vê
create policy "members_select_projects" on public.projects
  for select using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Projects: editor e admin podem inserir/editar
create policy "editors_insert_projects" on public.projects
  for insert with check (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('admin', 'editor')
    )
  );

create policy "editors_update_projects" on public.projects
  for update using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Projects: apenas admin pode deletar
create policy "admins_delete_projects" on public.projects
  for delete using (
    organization_id in (
      select organization_id from public.organization_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Snapshots: membros veem, sistema escreve
create policy "members_select_snapshots" on public.project_snapshots
  for select using (
    project_id in (
      select p.id from public.projects p
      join public.organization_members m on m.organization_id = p.organization_id
      where m.user_id = auth.uid()
    )
  );

-- =============================================
-- FUNÇÃO: criar organização + membro admin
-- (chame após o primeiro login)
-- =============================================
create or replace function public.create_organization(org_name text, org_slug text)
returns uuid language plpgsql security definer as $$
declare
  new_org_id uuid;
begin
  insert into public.organizations (name, slug)
  values (org_name, org_slug)
  returning id into new_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'admin');

  return new_org_id;
end;
$$;

-- =============================================
-- FUNÇÃO: listar membros da org com email
-- (retorna dados do auth.users via SECURITY DEFINER)
-- =============================================
create or replace function public.get_org_members_with_email()
returns table(id uuid, user_id uuid, role text, created_at timestamptz, email text)
language plpgsql security definer as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from public.organization_members
  where public.organization_members.user_id = auth.uid()
  limit 1;

  return query
  select
    m.id,
    m.user_id,
    m.role,
    m.created_at,
    u.email::text
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = org_id
  order by m.created_at asc;
end;
$$;

-- =============================================
-- FUNÇÃO: buscar user_id pelo email
-- (necessário para convidar membros via client)
-- =============================================
create or replace function public.get_user_id_by_email(user_email text)
returns uuid language plpgsql security definer as $$
declare
  found_user_id uuid;
begin
  select id into found_user_id
  from auth.users
  where email = user_email
  limit 1;

  return found_user_id;
end;
$$;
