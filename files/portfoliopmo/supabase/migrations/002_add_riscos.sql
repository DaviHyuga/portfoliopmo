-- =============================================
-- PortfolioPMO v1.1 — Adiciona coluna riscos
-- Execute no Supabase SQL Editor
-- =============================================

alter table public.projects
  add column if not exists riscos text;
