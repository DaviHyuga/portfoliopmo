-- =============================================
-- PortfolioPMO — Auth Approval System
-- Migration 004: self-registration + admin approval
-- Execute no Supabase SQL Editor
-- =============================================

-- ─── STEP 1: Add nome and status to organization_members ──────────────────────

ALTER TABLE public.organization_members
  ADD COLUMN IF NOT EXISTS nome   text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add check constraint (safe: only adds if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organization_members_status_check'
  ) THEN
    ALTER TABLE public.organization_members
      ADD CONSTRAINT organization_members_status_check
      CHECK (status IN ('pending_approval', 'active', 'rejected'));
  END IF;
END;
$$;

-- Mark all existing members as active (they were invited before this system existed)
UPDATE public.organization_members SET status = 'active' WHERE status IS DISTINCT FROM 'active';

-- ─── STEP 2: Drop old RLS policies (recreate below with status filter) ────────

DROP POLICY IF EXISTS "members_select_org"           ON public.organizations;
DROP POLICY IF EXISTS "members_select_org"            ON public.organization_members;
DROP POLICY IF EXISTS "admins_insert_members"         ON public.organization_members;
DROP POLICY IF EXISTS "admins_update_members"         ON public.organization_members;
DROP POLICY IF EXISTS "admins_delete_members"         ON public.organization_members;
DROP POLICY IF EXISTS "members_select_projects"       ON public.projects;
DROP POLICY IF EXISTS "editors_insert_projects"       ON public.projects;
DROP POLICY IF EXISTS "editors_update_projects"       ON public.projects;
DROP POLICY IF EXISTS "admins_delete_projects"        ON public.projects;
DROP POLICY IF EXISTS "members_select_snapshots"      ON public.project_snapshots;
DROP POLICY IF EXISTS "org members can read weekly statuses"  ON public.weekly_statuses;
DROP POLICY IF EXISTS "editors can insert weekly statuses"    ON public.weekly_statuses;
DROP POLICY IF EXISTS "editors can update weekly statuses"    ON public.weekly_statuses;

-- ─── STEP 3: Recreate RLS policies enforcing status = 'active' ────────────────
-- Drop new policies too (safe if re-running after a partial execution)

DROP POLICY IF EXISTS "active_members_select_org"          ON public.organizations;
DROP POLICY IF EXISTS "users_see_own_member_record"         ON public.organization_members;
DROP POLICY IF EXISTS "active_members_see_org_members"      ON public.organization_members;
DROP POLICY IF EXISTS "admins_insert_members"               ON public.organization_members;
DROP POLICY IF EXISTS "admins_update_members"               ON public.organization_members;
DROP POLICY IF EXISTS "admins_delete_members"               ON public.organization_members;
DROP POLICY IF EXISTS "active_members_select_projects"      ON public.projects;
DROP POLICY IF EXISTS "editors_insert_projects"             ON public.projects;
DROP POLICY IF EXISTS "editors_update_projects"             ON public.projects;
DROP POLICY IF EXISTS "admins_delete_projects"              ON public.projects;
DROP POLICY IF EXISTS "active_members_select_snapshots"     ON public.project_snapshots;
DROP POLICY IF EXISTS "active_members_read_weekly_statuses"    ON public.weekly_statuses;
DROP POLICY IF EXISTS "active_editors_insert_weekly_statuses"  ON public.weekly_statuses;
DROP POLICY IF EXISTS "active_editors_update_weekly_statuses"  ON public.weekly_statuses;

-- Helper subquery used repeatedly: "active member of org X"
-- organizations: only ACTIVE members can see their org
CREATE POLICY "active_members_select_org" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- organization_members: every authenticated user can see their OWN record
--   (needed so a pending user can check their status on /aguardando-aprovacao)
CREATE POLICY "users_see_own_member_record" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

-- organization_members: ACTIVE members can see everyone in their org
CREATE POLICY "active_members_see_org_members" ON public.organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- organization_members: ACTIVE admin can insert members
CREATE POLICY "admins_insert_members" ON public.organization_members
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- organization_members: ACTIVE admin can update members in same org
CREATE POLICY "admins_update_members" ON public.organization_members
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- organization_members: ACTIVE admin can delete members (not themselves)
CREATE POLICY "admins_delete_members" ON public.organization_members
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
    AND user_id <> auth.uid()
  );

-- projects: ACTIVE members can view
CREATE POLICY "active_members_select_projects" ON public.projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- projects: ACTIVE editor/admin can insert
CREATE POLICY "editors_insert_projects" ON public.projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND status = 'active'
    )
  );

-- projects: ACTIVE editor/admin can update
CREATE POLICY "editors_update_projects" ON public.projects
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor') AND status = 'active'
    )
  );

-- projects: ACTIVE admin can delete
CREATE POLICY "admins_delete_projects" ON public.projects
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- snapshots: ACTIVE members can view
CREATE POLICY "active_members_select_snapshots" ON public.project_snapshots
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.organization_members m ON m.organization_id = p.organization_id
      WHERE m.user_id = auth.uid() AND m.status = 'active'
    )
  );

-- weekly_statuses: ACTIVE members can read
CREATE POLICY "active_members_read_weekly_statuses" ON public.weekly_statuses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = weekly_statuses.project_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- weekly_statuses: ACTIVE editor/admin can insert
CREATE POLICY "active_editors_insert_weekly_statuses" ON public.weekly_statuses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = weekly_statuses.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'editor')
        AND om.status = 'active'
    )
  );

-- weekly_statuses: ACTIVE editor/admin can update
CREATE POLICY "active_editors_update_weekly_statuses" ON public.weekly_statuses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = weekly_statuses.project_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'editor')
        AND om.status = 'active'
    )
  );

-- ─── STEP 4: Update get_org_members_with_email (include nome + status) ────────

DROP FUNCTION IF EXISTS public.get_org_members_with_email();

CREATE OR REPLACE FUNCTION public.get_org_members_with_email()
RETURNS TABLE(
  id          uuid,
  user_id     uuid,
  nome        text,
  role        text,
  status      text,
  created_at  timestamptz,
  email       text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Only ACTIVE callers can list org members
  SELECT organization_id INTO org_id
  FROM public.organization_members
  WHERE public.organization_members.user_id = auth.uid()
    AND public.organization_members.status = 'active'
  LIMIT 1;

  IF org_id IS NULL THEN
    RETURN; -- no rows
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.nome,
    m.role,
    m.status,
    m.created_at,
    u.email::text
  FROM public.organization_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.organization_id = org_id
  ORDER BY
    CASE m.status WHEN 'pending_approval' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
    m.created_at ASC;
END;
$$;

-- ─── STEP 5: Function to approve a member (admin only) ────────────────────────

CREATE OR REPLACE FUNCTION public.approve_member(p_member_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller_role   text;
  v_caller_org_id uuid;
  v_target_org_id uuid;
BEGIN
  -- Caller must be an ACTIVE admin
  SELECT role, organization_id INTO v_caller_role, v_caller_org_id
  FROM public.organization_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;

  IF v_caller_role IS NULL OR v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores ativos podem aprovar membros';
  END IF;

  -- Target must belong to caller's org
  SELECT organization_id INTO v_target_org_id
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_target_org_id IS NULL OR v_target_org_id != v_caller_org_id THEN
    RAISE EXCEPTION 'Membro não encontrado na sua organização';
  END IF;

  UPDATE public.organization_members
  SET status = 'active'
  WHERE id = p_member_id;
END;
$$;

-- ─── STEP 6: Function to reject a member (admin only) ─────────────────────────

CREATE OR REPLACE FUNCTION public.reject_member(p_member_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_caller_role   text;
  v_caller_org_id uuid;
  v_target_org_id uuid;
BEGIN
  SELECT role, organization_id INTO v_caller_role, v_caller_org_id
  FROM public.organization_members
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;

  IF v_caller_role IS NULL OR v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores ativos podem rejeitar membros';
  END IF;

  SELECT organization_id INTO v_target_org_id
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_target_org_id IS NULL OR v_target_org_id != v_caller_org_id THEN
    RAISE EXCEPTION 'Membro não encontrado na sua organização';
  END IF;

  UPDATE public.organization_members
  SET status = 'rejected'
  WHERE id = p_member_id;
END;
$$;

-- ─── STEP 7: Update create_organization to explicitly set status = 'active' ───
-- (ensures the first admin created via onboarding is always active)

CREATE OR REPLACE FUNCTION public.create_organization(org_name text, org_slug text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, status)
  VALUES (new_org_id, auth.uid(), 'admin', 'active');

  RETURN new_org_id;
END;
$$;
