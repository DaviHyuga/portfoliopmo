'use client'
// src/app/demo/context.tsx — estado global do demo com persistência em localStorage

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types'

export interface WeeklyStatus {
  id: string
  project_id: string
  week_start: string // 'YYYY-MM-DD' — Monday da semana
  progresso: string
  proximos_passos: string
  riscos: string
  acoes_mitigacao: string
  created_at: string
  updated_at: string
}

const INITIAL_PROJECTS: Project[] = [
  // ── Azul 2025 Q1 ──
  {
    id: '11', organization_id: 'demo',
    nome: 'Migração para Pagamentos PIX',
    descricao: 'Integração com o ecossistema PIX do Banco Central para pagamentos instantâneos em todos os produtos',
    beneficios: 'Eliminação de taxas de TED/DOC estimada em R$ 800K/ano e redução de 90% no tempo de liquidação',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Bruno Alves',
    data_inicio: '2024-10-01', data_fim_prevista: '2025-02-28',
    created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-01T00:00:00Z',
  },
  // ── Azul 2025 Q2 ──
  {
    id: '12', organization_id: 'demo',
    nome: 'Customer Data Platform (CDP)',
    descricao: 'Unificação de dados de clientes em plataforma centralizada com segmentação em tempo real',
    beneficios: 'Aumento de 28% na conversão de campanhas e redução de 40% no custo de aquisição por cliente',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'negocios',
    desvios: [], responsavel: 'Juliana Ramos',
    data_inicio: '2024-12-01', data_fim_prevista: '2025-05-31',
    created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z',
  },
  // ── Azul 2025 Q3 ──
  {
    id: '13', organization_id: 'demo',
    nome: 'Automação de Onboarding Corporativo',
    descricao: 'Digitalização e automação do processo de onboarding de clientes pessoa jurídica com validação de KYC',
    beneficios: 'Redução de 15 para 2 dias no tempo de ativação e aumento de 22% na satisfação (NPS pós-onboarding)',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'negocios',
    desvios: [], responsavel: 'Thiago Souza',
    data_inicio: '2025-02-01', data_fim_prevista: '2025-08-15',
    created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z',
  },
  // ── Azul 2026 Q2 ──
  {
    id: '14', organization_id: 'demo',
    nome: 'Open Insurance — Fase 2',
    descricao: 'Implementação da fase 2 do Open Insurance com compartilhamento de dados de seguros e APIs padronizadas',
    beneficios: 'Conformidade regulatória com SUSEP e habilitação para novos produtos baseados em dados compartilhados',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Carla Mendes',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-05-31',
    created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z',
  },
  // ── Azul 2026 Q4 ──
  {
    id: '15', organization_id: 'demo',
    nome: 'Plataforma de Gestão de Sinistros 2.0',
    descricao: 'Modernização do sistema de sinistros com IA para triagem automática e análise de documentos',
    beneficios: 'Redução de 65% no tempo de liquidação de sinistros simples e economia de R$ 3,2M/ano em operações',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'backoffice',
    desvios: [], responsavel: 'Eduardo Pires',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-11-30',
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
  },
  // ── Projetos ativos ──
  {
    id: '1', organization_id: 'demo',
    nome: 'Plataforma de Dados Corporativos',
    descricao: 'Centralização e governança dos dados estratégicos da empresa em data lake unificado com pipelines automatizados',
    beneficios: 'Redução de 60% no tempo de geração de relatórios executivos e eliminação de silos de dados entre áreas',
    riscos: 'Qualidade inconsistente dos dados legados\nDependência de aprovação do Comitê de Tecnologia',
    pct_evolucao: 82, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Camila Torres',
    data_inicio: '2025-10-01', data_fim_prevista: '2026-04-30',
    created_at: '2025-10-01T00:00:00Z', updated_at: '2025-10-01T00:00:00Z',
  },
  {
    id: '2', organization_id: 'demo',
    nome: 'Transformação Digital — Jornada do Cliente',
    descricao: 'Redesenho completo da jornada digital do cliente com omnicanalidade e personalização por IA',
    beneficios: 'Aumento de 35% no NPS, +22% na taxa de retenção e redução de 30% no custo de aquisição',
    riscos: 'Integrações com sistemas legados de CRM\nResistência cultural dos times de atendimento\nBudget adicional para infraestrutura de IA',
    pct_evolucao: 67, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Rafael Monteiro',
    data_inicio: '2025-09-01', data_fim_prevista: '2026-06-30',
    created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z',
  },
  {
    id: '3', organization_id: 'demo',
    nome: 'Adequação Regulatória — Resolução 4.966',
    descricao: 'Adequação dos processos contábeis e de provisionamento às novas normas do BACEN',
    beneficios: 'Conformidade regulatória total e mitigação de risco de multa estimada em R$ 12M',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Patrícia Gomes',
    data_inicio: '2025-04-01', data_fim_prevista: '2025-12-31',
    created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z',
  },
  {
    id: '4', organization_id: 'demo',
    nome: 'ERP Next — Módulo Financeiro',
    descricao: 'Implantação do novo módulo financeiro integrado com contas a pagar, receber e conciliação automática',
    beneficios: 'Economia de 120h/mês em processos manuais e fechamento contábil em 2 dias úteis vs 8 dias atuais',
    riscos: 'Escopo ampliado pelo sponsor após kickoff\nFornecedor com histórico de atrasos em outros clientes',
    pct_evolucao: 38, farol: 'vermelho', natureza: 'backoffice',
    desvios: ['escopo', 'prazo'], responsavel: 'Henrique Bastos',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-02-28',
    created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z',
  },
  {
    id: '5', organization_id: 'demo',
    nome: 'Portal B2B de Autoatendimento',
    descricao: 'Portal self-service para parceiros comerciais com gestão de contratos, emissão de documentos e acompanhamento em tempo real',
    beneficios: 'Redução de 40% no volume de chamados ao backoffice e melhora no SLA de atendimento de 5 para 1 dia',
    riscos: 'Integração com API de legado sem documentação atualizada\nAlinhamento com área jurídica para assinatura digital',
    pct_evolucao: 91, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Larissa Campos',
    data_inicio: '2026-01-05', data_fim_prevista: '2026-05-15',
    created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: '6', organization_id: 'demo',
    nome: 'Modernização da Infraestrutura Cloud',
    descricao: 'Migração de workloads críticos on-premise para arquitetura multi-cloud com alta disponibilidade',
    beneficios: 'Redução de 45% em custos de infraestrutura (R$ 2,1M/ano) e eliminação de janelas de manutenção',
    riscos: 'Risco de indisponibilidade durante janelas de migração\nDependência de certificação técnica do time interno',
    pct_evolucao: 54, farol: 'amarelo', natureza: 'backoffice',
    desvios: ['prazo'], responsavel: 'Diego Martins',
    data_inicio: '2025-12-01', data_fim_prevista: '2026-07-31',
    created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: '7', organization_id: 'demo',
    nome: 'Programa LGPD — Ciclo 2026',
    descricao: 'Revisão anual do programa de proteção de dados: mapeamento de fluxos, DPIAs e treinamentos obrigatórios',
    beneficios: 'Conformidade contínua com a LGPD e redução do risco de sanções da ANPD',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Fernanda Costa',
    data_inicio: '2026-01-02', data_fim_prevista: '2026-03-31',
    created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z',
  },
  {
    id: '8', organization_id: 'demo',
    nome: 'Expansão — Região Norte e Nordeste',
    descricao: 'Estruturação de equipes regionais, parcerias locais e abertura de 4 novos escritórios em capitais',
    beneficios: 'Projeção de R$ 18M em novas receitas e aumento de 20% na base de clientes corporativos até 2027',
    riscos: 'Contratação e retenção de talentos nas regiões-alvo\nCronograma dependente de aprovação jurídica dos contratos de locação',
    pct_evolucao: 48, farol: 'amarelo', natureza: 'regional',
    desvios: ['risco'], responsavel: 'Marcos Ferreira',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-12-31',
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '9', organization_id: 'demo',
    nome: 'Automação de Subscrição com IA',
    descricao: 'Implementação de modelos preditivos para análise de risco e precificação automatizada em tempo real',
    beneficios: 'Redução de 70% no tempo médio de subscrição (de 3 dias para 4 horas) e ganho de R$ 5M em precisão de pricing',
    riscos: 'Modelo de IA requer base histórica de 3 anos — dados incompletos para segmentos novos\nAprovação do regulador para uso de IA em decisões de subscrição',
    pct_evolucao: 25, farol: 'vermelho', natureza: 'negocios',
    desvios: ['escopo', 'risco'], responsavel: 'Isabela Nogueira',
    data_inicio: '2025-10-15', data_fim_prevista: '2026-03-31',
    created_at: '2025-10-15T00:00:00Z', updated_at: '2025-10-15T00:00:00Z',
  },
  {
    id: '10', organization_id: 'demo',
    nome: 'Cultura de Agilidade Corporativa',
    descricao: 'Programa de transformação ágil com certificações, squads multidisciplinares e novos rituais de gestão',
    beneficios: 'Aumento de 50% na velocidade de entrega de projetos e melhoria no índice de engajamento dos colaboradores',
    riscos: 'Resistência da liderança média à mudança de processos',
    pct_evolucao: 73, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Ana Lima',
    data_inicio: '2025-08-01', data_fim_prevista: '2026-08-31',
    created_at: '2025-08-01T00:00:00Z', updated_at: '2025-08-01T00:00:00Z',
  },
]

// Semana atual (2026-04-21) e anterior (2026-04-14)
const W1 = '2026-04-14'
const W2 = '2026-04-21'

const INITIAL_WEEKLY_STATUSES: WeeklyStatus[] = [
  // ── Semana 14/04 ──────────────────────────────────────────────────────────
  {
    id: 'ws-1-w1', project_id: '1', week_start: W1,
    progresso: 'Pipelines validados em 78%\nCamada de ingestão 90% completa\nGovernança de dados ainda não iniciada',
    proximos_passos: 'Finalizar validação dos pipelines restantes\nIniciar módulo de governança de dados',
    riscos: 'Dados legados com qualidade inconsistente\nDependência de aprovação do Comitê de TI',
    acoes_mitigacao: 'Mapeamento dos registros corrompidos em andamento\nReunião com Comitê agendada para 16/04',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-2-w1', project_id: '2', week_start: W1,
    progresso: 'Módulo omnichannel 60% implementado\nIA de personalização em fase de testes\nIntegração com CRM legado não iniciada',
    proximos_passos: 'Concluir testes da IA de personalização\nIniciar integração com CRM legado',
    riscos: 'Resistência do time de atendimento ao novo sistema\nInstabilidade na API legada do CRM',
    acoes_mitigacao: 'Workshop de capacitação agendado para 17/04\nAbertura de incidente com fornecedor do CRM',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-4-w1', project_id: '4', week_start: W1,
    progresso: 'Evolução em 38% — sem avanço na semana\nMódulo de contas a pagar em finalização\nConciliação automática bloqueada por inconsistências de dados',
    proximos_passos: 'Resolver inconsistências de dados com o fornecedor\nRetomar implementação da conciliação automática',
    riscos: 'Fornecedor com 3 semanas de atraso acumulado\nEscopo ampliado pelo sponsor sem replanejamento formal',
    acoes_mitigacao: 'Reunião de crise com fornecedor agendada para 15/04\nSponsor ciente e envolvido',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-5-w1', project_id: '5', week_start: W1,
    progresso: 'Assinatura digital integrada com sucesso\nTestes de aceitação do usuário (UAT) em andamento\nEvolução em 91%',
    proximos_passos: 'Finalizar UAT com aprovação dos usuários-chave\nPrepara ambiente de produção para deploy',
    riscos: 'Validação jurídica ainda pendente para contratos digitais',
    acoes_mitigacao: 'Jurídico comprometeu retorno até 16/04',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-6-w1', project_id: '6', week_start: W1,
    progresso: '8 de 15 workloads migrados (54%)\nJanelas de migração respeitadas sem incidentes',
    proximos_passos: 'Migrar workloads de missão crítica na semana de 14/04\nCertificar 2 membros do time interno',
    riscos: 'Falta de certificação técnica de 2 membros do time interno\nRisco de indisponibilidade em workloads críticos',
    acoes_mitigacao: 'Treinamento acelerado com certificação prevista para 20/04\nChecklist de rollback atualizado',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-8-w1', project_id: '8', week_start: W1,
    progresso: '2 escritórios abertos: Fortaleza e Recife\nContratos de Salvador em revisão jurídica\nEvolução em 48%',
    proximos_passos: 'Assinar contratos de Salvador e iniciar processo de Manaus\nAcelerar contratações nas regiões-alvo',
    riscos: 'Dificuldade em contratar talentos sênior na região Norte',
    acoes_mitigacao: 'Parceria com headhunter regional ativada\nBusca ampliada para talentos em regime remoto',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-9-w1', project_id: '9', week_start: W1,
    progresso: 'Evolução em 25% — abaixo do planejado\nModelos preditivos em desenvolvimento inicial\nBase histórica insuficiente para 3 novos segmentos',
    proximos_passos: 'Completar análise da base histórica disponível\nIniciar testes com segmentos já consolidados',
    riscos: 'Aprovação regulatória da SUSEP ainda não iniciada\nDados insuficientes para modelagem de novos segmentos',
    acoes_mitigacao: 'Dossier regulatório em preparação\nParceria com segurador para dados históricos em negociação',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  {
    id: 'ws-10-w1', project_id: '10', week_start: W1,
    progresso: '6 squads certificados em metodologia ágil\n3 rituais de gestão implementados\nEvolução em 73%',
    proximos_passos: 'Certificar os 2 últimos squads\nAvaliar resultados com a liderança sênior',
    riscos: 'Resistência de 2 gestores sênior ao modelo ágil',
    acoes_mitigacao: 'Sessões de coaching individuais com gestores resistentes\nApresentação de resultados parciais para a liderança',
    created_at: W1 + 'T10:00:00Z', updated_at: W1 + 'T10:00:00Z',
  },
  // ── Semana 21/04 — Status Atual ───────────────────────────────────────────
  {
    id: 'ws-1-w2', project_id: '1', week_start: W2,
    progresso: 'Pipelines 95% validados\nMódulo de governança iniciado\nPreparação para Go-Live em 30/04',
    proximos_passos: 'Encerrar validação dos últimos pipelines\nRealizar testes finais de governança\nAgendar janela de Go-Live',
    riscos: 'Risco de indisponibilidade durante a migração final',
    acoes_mitigacao: 'Janela de manutenção agendada para madrugada de 28/04\nEquipe de plantão durante a migração',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-2-w2', project_id: '2', week_start: W2,
    progresso: 'IA de personalização validada com sucesso\nIntegração CRM 70% concluída\nPiloto com clientes em planejamento',
    proximos_passos: 'Finalizar integração com CRM legado\nIniciar piloto com 200 clientes selecionados',
    riscos: 'API legada de CRM com timeout intermitente\nPossível instabilidade durante o piloto',
    acoes_mitigacao: 'Time técnico abrindo incidente com fornecedor do CRM\nCircuito de fallback implementado',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-4-w2', project_id: '4', week_start: W2,
    progresso: 'Evolução em 38% — sem avanço pela 2ª semana consecutiva\nAguardando hotfix crítico do fornecedor',
    proximos_passos: 'Receber e validar hotfix do fornecedor\nReplanilhar cronograma com sponsor',
    riscos: 'Risco real de não entrega no Q2\nSponsor solicitou escalonamento para diretoria',
    acoes_mitigacao: 'Escalonado para diretoria na última sexta\nContrato em revisão com inclusão de cláusula de multa',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-5-w2', project_id: '5', week_start: W2,
    progresso: 'UAT concluída com aprovação de todos os usuários-chave\nEvolução em 95%\nAguardando validação jurídica final',
    proximos_passos: 'Obter sign-off jurídico até 23/04\nRealizar deploy em produção em 24/04',
    riscos: 'Atraso no Go-Live se jurídico não aprovar até 23/04',
    acoes_mitigacao: 'Reunião de alinhamento jurídico agendada para 22/04\nGerente do projeto acompanhando pessoalmente',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-6-w2', project_id: '6', week_start: W2,
    progresso: '11 de 15 workloads migrados (58%)\n1 incidente de indisponibilidade de 12 min registrado\nWorkloads críticos iniciados',
    proximos_passos: 'Concluir migração dos workloads críticos restantes\nDocumentar lições aprendidas do incidente',
    riscos: 'Incidente de indisponibilidade pode se repetir nas próximas janelas',
    acoes_mitigacao: 'Runbook atualizado com novos procedimentos\nPróxima janela com checklist aprimorado e equipe reforçada',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-8-w2', project_id: '8', week_start: W2,
    progresso: 'Contrato de Salvador assinado\nProcesso seletivo de Manaus em andamento\nEvolução em 50%',
    proximos_passos: 'Iniciar estruturação física do escritório de Manaus\nContratar gestor local',
    riscos: 'Cronograma de Manaus com risco de atraso de 3 semanas',
    acoes_mitigacao: 'Gestor local identificado como candidato prioritário\nInício previsto para 28/04',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-9-w2', project_id: '9', week_start: W2,
    progresso: 'Evolução em 25% — sem avanço técnico\nAguardando dados de parceiro externo',
    proximos_passos: 'Receber base histórica do parceiro externo\nRetomar modelagem preditiva com novos dados',
    riscos: 'Parceiro externo atrasando fornecimento de dados\nRisco de replanejamento total do prazo',
    acoes_mitigacao: 'Sponsor enviando ofício formal ao parceiro\nAlternativa de dataset público sendo avaliada',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
  {
    id: 'ws-10-w2', project_id: '10', week_start: W2,
    progresso: '7 squads certificados em metodologia ágil\nResultados positivos apresentados à diretoria\nEvolução em 76%',
    proximos_passos: 'Certificar o último squad restante\nPreparar apresentação de resultados para o Q2',
    riscos: 'Risco de regressão com saída do coach externo prevista para maio',
    acoes_mitigacao: 'Processo de internalização do conhecimento em andamento\nIdentificação de coach interno em curso',
    created_at: W2 + 'T09:00:00Z', updated_at: W2 + 'T09:00:00Z',
  },
]

export interface DemoUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

const INITIAL_USERS: DemoUser[] = [
  { id: 'u1', name: 'Davi de Paula', email: 'davi@portfoliopmo.com.br', role: 'admin' },
  { id: 'u2', name: 'Ana Lima', email: 'ana.lima@portfoliopmo.com.br', role: 'editor' },
  { id: 'u3', name: 'Rafael Monteiro', email: 'rafael.monteiro@portfoliopmo.com.br', role: 'editor' },
  { id: 'u4', name: 'Fernanda Costa', email: 'fernanda.costa@portfoliopmo.com.br', role: 'viewer' },
  { id: 'u5', name: 'Larissa Campos', email: 'larissa.campos@portfoliopmo.com.br', role: 'viewer' },
]

type ProjectInput = Omit<Project, 'id' | 'organization_id' | 'created_at' | 'updated_at'>

interface DemoContextType {
  projects: Project[]
  users: DemoUser[]
  weeklyStatuses: WeeklyStatus[]
  selectedYear: number
  setSelectedYear: (year: number) => void
  addProject: (data: ProjectInput) => void
  updateProject: (id: string, data: ProjectInput) => void
  deleteProject: (id: string) => void
  addUser: (user: Omit<DemoUser, 'id'>) => void
  removeUser: (id: string) => void
  updateUserRole: (id: string, role: DemoUser['role']) => void
  upsertWeeklyStatus: (
    projectId: string,
    weekStart: string,
    data: Partial<Pick<WeeklyStatus, 'progresso' | 'proximos_passos' | 'riscos' | 'acoes_mitigacao'>>
  ) => void
  resetDemo: () => void
}

const DemoContext = createContext<DemoContextType | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS)
  const [weeklyStatuses, setWeeklyStatuses] = useState<WeeklyStatus[]>(INITIAL_WEEKLY_STATUSES)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // Carrega do localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('demo_projects')
    const savedUsers = localStorage.getItem('demo_users')
    const savedWeeklyStatuses = localStorage.getItem('demo_weekly_statuses')
    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedWeeklyStatuses) setWeeklyStatuses(JSON.parse(savedWeeklyStatuses))
  }, [])

  // Salva no localStorage a cada mudança
  useEffect(() => { localStorage.setItem('demo_projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem('demo_users', JSON.stringify(users)) }, [users])
  useEffect(() => { localStorage.setItem('demo_weekly_statuses', JSON.stringify(weeklyStatuses)) }, [weeklyStatuses])

  const addProject = useCallback((data: ProjectInput) => {
    const now = new Date().toISOString()
    setProjects(prev => [{ ...data, id: crypto.randomUUID(), organization_id: 'demo', created_at: now, updated_at: now }, ...prev])
  }, [])

  const updateProject = useCallback((id: string, data: ProjectInput) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const addUser = useCallback((user: Omit<DemoUser, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: crypto.randomUUID() }])
  }, [])

  const removeUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const updateUserRole = useCallback((id: string, role: DemoUser['role']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
  }, [])

  const upsertWeeklyStatus = useCallback((
    projectId: string,
    weekStart: string,
    data: Partial<Pick<WeeklyStatus, 'progresso' | 'proximos_passos' | 'riscos' | 'acoes_mitigacao'>>
  ) => {
    const now = new Date().toISOString()
    setWeeklyStatuses(prev => {
      const idx = prev.findIndex(s => s.project_id === projectId && s.week_start === weekStart)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], ...data, updated_at: now }
        return updated
      }
      return [...prev, {
        id: crypto.randomUUID(),
        project_id: projectId,
        week_start: weekStart,
        progresso: data.progresso ?? '',
        proximos_passos: data.proximos_passos ?? '',
        riscos: data.riscos ?? '',
        acoes_mitigacao: data.acoes_mitigacao ?? '',
        created_at: now,
        updated_at: now,
      }]
    })
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem('demo_projects')
    localStorage.removeItem('demo_users')
    localStorage.removeItem('demo_weekly_statuses')
    setProjects(INITIAL_PROJECTS)
    setUsers(INITIAL_USERS)
    setWeeklyStatuses(INITIAL_WEEKLY_STATUSES)
  }, [])

  return (
    <DemoContext.Provider value={{ projects, users, weeklyStatuses, selectedYear, setSelectedYear, addProject, updateProject, deleteProject, addUser, removeUser, updateUserRole, upsertWeeklyStatus, resetDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemoContext must be used within DemoProvider')
  return ctx
}
