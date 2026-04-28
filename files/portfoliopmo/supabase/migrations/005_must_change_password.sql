-- =============================================
-- PortfolioPMO — Migration 005
-- Senha temporária: must_change_password flag
-- Execute no Supabase SQL Editor
-- =============================================

ALTER TABLE public.organization_members
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
