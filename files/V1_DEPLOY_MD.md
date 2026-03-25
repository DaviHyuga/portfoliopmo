# PortfolioPMO — Melhorias v1.1

Documento de referência das 6 melhorias implementadas no dashboard `portfolio_dashboard_pmo.html`.

---

## Melhoria 1 — Gráfico de Quarters no Dashboard

**Localização:** Aba Dashboard, abaixo dos cards KPI.

Um gráfico de barras horizontal empilhado que distribui os projetos ao longo do ano dividido em quatro trimestres:

| Trimestre | Meses |
|-----------|-------|
| T1 — 1º Trimestre | Janeiro, Fevereiro, Março |
| T2 — 2º Trimestre | Abril, Maio, Junho |
| T3 — 3º Trimestre | Julho, Agosto, Setembro |
| T4 — 4º Trimestre | Outubro, Novembro, Dezembro |

Cada barra é empilhada e colorida pelo status do farol do projeto. A classificação é feita com base no campo **Data de Término** (`data_fim_prevista`) de cada projeto.

**Comportamento:**
- Projetos sem data de término definida **não aparecem** no gráfico
- Ao passar o cursor sobre uma barra, o tooltip exibe o status e a contagem de projetos
- O badge do card exibe quantos projetos possuem prazo definido
- Se nenhum projeto tiver data de término, é exibida uma mensagem orientando o usuário a preencher o campo

**Legenda do gráfico:**

🟢 No Prazo · 🟡 Risco de Atraso · 🔴 Atrasado/Pausado · 🔵 Entregue

---

## Melhoria 2 — Renomeação das Legendas do Farol

**Localização:** Aba Dashboard, card "Status por Farol".

Os rótulos de status do farol foram atualizados em todos os pontos da interface para refletir a semântica de negócio:

| Cor | Nome anterior | Nome atual |
|-----|--------------|------------|
| Verde | Verde | No Prazo |
| Amarelo | Amarelo | Risco de Atraso |
| Vermelho | Vermelho | Atrasado/Pausado |
| Azul | Azul | Entregue |

A renomeação foi aplicada em: card de distribuição por farol, tabela consolidada, badges na aba Insights, Top 3 e no formulário de cadastro de projetos.

---

## Melhoria 3 — Coluna de Benefícios na Tabela Consolidada

**Localização:** Aba Dashboard, tabela "Portfólio Consolidado".

A tabela ganhou uma nova coluna **Benefícios**, que exibe o conteúdo preenchido no campo "Benefícios Esperados" no formulário do projeto.

**Comportamento:**
- O conteúdo é exibido automaticamente ao salvar ou editar um projeto
- Projetos sem benefícios cadastrados exibem `—`
- A coluna é atualizada em tempo real ao modificar qualquer projeto

A ordem final das colunas na tabela é: Projeto · Evolução · Farol · Natureza · Desvio · **Benefícios**

---

## Melhoria 4 — Expansão dos Cards KPI

**Localização:** Aba Dashboard, topo da página.

Os cards KPI foram expandidos de 4 para **6 cards**, organizados em grade 3×2.

| Card | Cor da borda | Descrição |
|------|-------------|-----------|
| Evolução Média | Índigo (gradiente) | Percentual médio de evolução de todos os projetos |
| Total de Projetos | Cinza | Quantidade total de projetos no portfólio |
| Projetos no Prazo | Verde | Projetos com farol **verde** |
| Em Risco | Amarelo | Projetos com farol **amarelo** |
| Críticos | Vermelho | Projetos com farol **vermelho** |
| Projetos Concluídos | Azul | Projetos com farol **azul** — entregues |

**Alterações em relação à versão anterior:**
- O card "Total de Projetos" teve a borda superior alterada de **verde para cinza**
- O card "Projetos no Prazo" foi criado com borda **verde**, substituindo o papel de destaque positivo
- O card "Projetos Concluídos" é novo, com borda **azul**

---

## Melhoria 5 — Campo de Riscos no Formulário de Projeto

**Localização:** Aba Projetos, formulário de criação e edição.

Um novo campo **Riscos do Projeto** foi adicionado ao formulário, posicionado após o campo "Benefícios Esperados".

**Como usar:**
- Descreva cada risco em uma linha separada
- Não é necessário usar marcadores — o sistema os interpreta automaticamente
- Exemplo de preenchimento:

```
Dependência de aprovação de TI
Atraso na migração de dados legados
Falta de recursos técnicos especializados
Mudança de escopo durante a execução
```

**Comportamento:**
- O campo é salvo junto com os demais dados do projeto
- Ao editar um projeto, os riscos cadastrados são carregados no campo
- Os riscos alimentam automaticamente a seção de mitigação na aba Insights (ver Melhoria 6)

---

## Melhoria 6 — Análise e Mitigação de Riscos nos Insights

**Localização:** Aba Insights, seção "Análise e Mitigação de Riscos".

Para cada projeto que possui riscos cadastrados, o sistema exibe uma tabela de duas colunas:

| Coluna | Conteúdo |
|--------|----------|
| ⚠ Risco identificado | Texto do risco exatamente como foi cadastrado |
| 🛡 Estratégia de mitigação | Recomendação gerada automaticamente com base em palavras-chave |

O badge no cabeçalho da seção exibe o total de riscos cadastrados em todo o portfólio.

**Lógica de geração das estratégias:**

As estratégias são geradas por detecção de palavras-chave no texto do risco:

| Palavras detectadas | Estratégia gerada |
|--------------------|-------------------|
| aprovação, dependência | Mapeamento de stakeholders e processo de aprovação antecipado com buffer no cronograma |
| migração, dados, legado | Migração incremental com ambiente de testes paralelo e validação por etapa |
| recurso, equipe, capacidade | Identificação de gap e acionamento de alocação com antecedência mínima de 4 semanas |
| fornecedor, terceiro, externo | Cláusulas de SLA com penalidades e identificação de fornecedor backup |
| escopo, requisito, mudança | Processo formal de controle de mudanças (CCB) e versionamento de requisitos |
| orçamento, custo, licença | Buffer de 15–20% nas estimativas e alerta ao atingir 70% do orçamento |
| prazo, cronograma, atraso | Caminho crítico (CPM) e revisão semanal de dependências |
| treinamento, capacitação, adoção | Plano de gestão da mudança com treinamentos antecipados |
| qualidade, inconsistência, erro | Regras de validação e relatório de qualidade automatizado |
| regulatório, compliance, LGPD | Envolvimento do DPO e revisões bimestrais com checklist |
| comunicação, alinhamento, stakeholder | Plano de comunicação com cadência definida e canal dedicado |
| tecnologia, sistema, integração, API | Prova de conceito técnica e documentação de interfaces |
| *(farol vermelho — sem match)* | War room imediato com sponsor e equipe, plano de ação em 48h |
| *(farol amarelo — sem match)* | Monitoramento semanal e ativação de contingência em 2 semanas |
| *(demais casos)* | Registro no log de riscos com responsável e revisão em reuniões de status |

---

## Resumo das Alterações por Arquivo

O arquivo `portfolio_dashboard_pmo.html` concentra todas as melhorias. As alterações foram aplicadas em três camadas:

**CSS**
- Grade KPI alterada para `repeat(3, 1fr)` (2 linhas de 3 cards)
- Nova classe `.kpi-card.cinza::before` com borda cinza (`#888`)
- Largura de `.farol-name` aumentada para `150px`
- Novas classes: `.field-hint`, `.risk-grid`, `.risk-col-label`, `.risk-text`, `.risk-mitigation`, `.beneficios-cell`, `.quarters-legend`

**HTML**
- 6 cards KPI no lugar de 4
- Card de gráfico de quarters com div `id="quarters-chart-wrap"` e legenda
- Rótulos do farol renomeados no card "Status por Farol"
- Coluna `<th>Benefícios</th>` adicionada na tabela (colspan atualizado para 6)
- Campo `id="f-riscos"` com hint de instrução no formulário
- Seção `id="ins-riscos"` com badge `id="riscos-badge"` na aba Insights

**JavaScript**
- Variável `quartersChart` declarada
- Função `updateQuartersChart()` — renderiza o gráfico empilhado por trimestre
- Função `gerarMitigacao(risco, projeto)` — retorna estratégia por palavras-chave
- Função `renderRiskInsights()` — renderiza a seção de riscos por projeto
- `updateDashboard()` atualiza `kpi-noprazo`, `kpi-concluidos` e a coluna de benefícios
- `updateInsights()` chama `renderRiskInsights()`
- `saveProject()`, `loadProject()` e `clearForm()` incluem o campo `riscos`
- Dados de exemplo (seed) atualizados com o campo `riscos` populado
"""

with open('/home/claude/DEPLOY_MD.md', 'w', encoding='utf-8') as f:
    f.write(content)

print('ok: ' + str(len(content)) + ' chars')
PYEOF