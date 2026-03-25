// src/app/demo/_utils.ts — funções utilitárias compartilhadas do modo demo
import type { Farol, Project } from '@/types'

export function getDeadlineBadge(dataFim: string | null, farol: Farol) {
  if (!dataFim || farol === 'azul') return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(dataFim + 'T00:00:00')
  const diff = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `${Math.abs(diff)}d em atraso`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  if (diff <= 7) return { label: `${diff}d restantes`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  if (diff <= 30) return { label: `${diff}d restantes`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return null
}

export function gerarMitigacao(risco: string, farol: Project['farol']): string {
  const r = risco.toLowerCase()
  if (/aprovação|dependência/.test(r))       return 'Mapeamento de stakeholders e processo de aprovação antecipado com buffer no cronograma'
  if (/migração|dados|legado/.test(r))       return 'Migração incremental com ambiente de testes paralelo e validação por etapa'
  if (/recurso|equipe|capacidade/.test(r))   return 'Identificação de gap e acionamento de alocação com antecedência mínima de 4 semanas'
  if (/fornecedor|terceiro|externo/.test(r)) return 'Cláusulas de SLA com penalidades e identificação de fornecedor backup'
  if (/escopo|requisito|mudança/.test(r))    return 'Processo formal de controle de mudanças (CCB) e versionamento de requisitos'
  if (/orçamento|custo|licença/.test(r))     return 'Buffer de 15–20% nas estimativas e alerta ao atingir 70% do orçamento'
  if (/prazo|cronograma|atraso/.test(r))     return 'Caminho crítico (CPM) e revisão semanal de dependências'
  if (/treinamento|capacitação|adoção/.test(r))  return 'Plano de gestão da mudança com treinamentos antecipados'
  if (/qualidade|inconsistência|erro/.test(r))   return 'Regras de validação e relatório de qualidade automatizado'
  if (/regulatório|compliance|lgpd/.test(r))     return 'Envolvimento do DPO e revisões bimestrais com checklist'
  if (/comunicação|alinhamento|stakeholder/.test(r)) return 'Plano de comunicação com cadência definida e canal dedicado'
  if (/tecnologia|sistema|integração|api/.test(r))   return 'Prova de conceito técnica e documentação de interfaces'
  if (farol === 'vermelho') return 'War room imediato com sponsor e equipe, plano de ação em 48h'
  if (farol === 'amarelo')  return 'Monitoramento semanal e ativação de contingência em 2 semanas'
  return 'Registro no log de riscos com responsável e revisão em reuniões de status'
}
