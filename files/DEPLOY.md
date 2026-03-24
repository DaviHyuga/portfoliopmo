# 🚀 PortfolioPMO — Guia Completo de Deploy

Siga este guia do zero para colocar o sistema no ar em ~30 minutos.

---

## 📋 Pré-requisitos

- Conta gratuita no [GitHub](https://github.com)
- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita no [Vercel](https://vercel.com)
- Node.js 18+ instalado localmente

---

## ETAPA 1 — Configurar o Banco de Dados (Supabase)

### 1.1 Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New project"**
3. Preencha:
   - **Name:** `portfoliopmo`
   - **Database Password:** crie uma senha forte e guarde
   - **Region:** South America (São Paulo) — mais próximo do Brasil
4. Clique em **"Create new project"** e aguarde ~2 minutos

### 1.2 Executar o schema do banco

1. No painel do Supabase, clique em **"SQL Editor"** (menu lateral)
2. Clique em **"+ New query"**
3. Copie TODO o conteúdo do arquivo `supabase/migrations/001_schema.sql`
4. Cole no editor e clique em **"Run"** (▶)
5. Confirme que aparece: `Success. No rows returned`

### 1.3 Configurar autenticação por e-mail

1. Vá em **Authentication → Providers**
2. Confirme que **Email** está habilitado
3. Em **Authentication → URL Configuration**, adicione:
   - **Site URL:** `https://SEU-APP.vercel.app` (preencha depois do deploy)
   - **Redirect URLs:** `https://SEU-APP.vercel.app/auth/callback`
4. Salve

### 1.4 Pegar as credenciais

1. Vá em **Settings → API**
2. Copie e guarde:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ETAPA 2 — Subir o código no GitHub

### 2.1 Criar repositório

1. Acesse [github.com/new](https://github.com/new)
2. Nome: `portfoliopmo`
3. Visibilidade: **Private** (recomendado)
4. Clique em **"Create repository"**

### 2.2 Fazer upload do código

```bash
# No terminal, dentro da pasta portfoliopmo:
git init
git add .
git commit -m "feat: initial PortfolioPMO setup"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portfoliopmo.git
git push -u origin main
```

---

## ETAPA 3 — Deploy no Vercel

### 3.1 Importar projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta GitHub se ainda não conectou
3. Encontre o repositório `portfoliopmo` e clique em **"Import"**

### 3.2 Configurar variáveis de ambiente

Na tela de configuração do deploy, clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua-anon-key` |
| `NEXT_PUBLIC_SITE_URL` | `https://portfoliopmo.vercel.app` |

### 3.3 Deploy

1. Clique em **"Deploy"**
2. Aguarde ~3 minutos
3. Sua URL estará disponível: `https://portfoliopmo.vercel.app`

### 3.4 Atualizar URLs no Supabase

Volte ao Supabase → **Authentication → URL Configuration** e atualize com a URL real do Vercel.

---

## ETAPA 4 — Primeiro acesso

### 4.1 Criar sua conta de administrador

1. Acesse `https://seu-app.vercel.app/login`
2. Clique em **"Cadastre-se"**
3. Informe e-mail e senha
4. Confirme o e-mail (verifique a caixa de entrada)

### 4.2 Criar a organização

1. Após confirmar o e-mail e fazer login, será redirecionado para `/onboarding`
2. Informe o nome da empresa (ex: "Acme Corp")
3. Clique em **"Criar organização e continuar"**
4. Você será o administrador da organização

---

## ETAPA 5 — Convidar sua equipe

### 5.1 Como funciona o acesso multi-usuário

O sistema tem 3 níveis de acesso:

| Papel | O que pode fazer |
|-------|-----------------|
| **Admin** | Tudo: criar, editar, excluir projetos + gerenciar membros |
| **Editor** | Criar e editar projetos (não pode excluir) |
| **Viewer** | Apenas visualizar o dashboard e projetos |

### 5.2 Convidar um membro

O membro precisa:
1. Criar uma conta em `https://seu-app.vercel.app/login` → "Cadastre-se"
2. Confirmar o e-mail

Depois você (admin) convida via **Configurações → Membros da equipe**, informando o e-mail e o papel desejado.

### 5.3 Todos verão os mesmos dados

Sim! Todos os membros da mesma organização acessam o **mesmo portfólio de projetos** em tempo real, via banco de dados compartilhado no Supabase.

---

## ETAPA 6 — Desenvolvimento local (opcional)

Para rodar localmente e desenvolver novas funcionalidades:

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/portfoliopmo.git
cd portfoliopmo

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Rode o servidor de desenvolvimento
npm run dev

# 5. Acesse em http://localhost:3000
```

---

## 🏗️ Arquitetura do sistema

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                 │
│                                                      │
│  Next.js 14 App Router                              │
│  ├── /login          → Autenticação                 │
│  ├── /onboarding     → Criar organização            │
│  ├── /dashboard      → Painel executivo (KPIs)      │
│  ├── /projetos       → Lista + CRUD de projetos     │
│  ├── /insights       → Análise automática           │
│  └── /configuracoes  → Membros da equipe            │
│                                                      │
│  Server Components → busca dados no servidor        │
│  Server Actions    → mutações seguras               │
│  Client Components → gráficos interativos           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                  SUPABASE (Backend)                  │
│                                                      │
│  PostgreSQL                                         │
│  ├── organizations        → empresas/equipes        │
│  ├── organization_members → quem acessa o quê       │
│  ├── projects             → projetos do portfólio   │
│  └── project_snapshots    → histórico de evolução   │
│                                                      │
│  Row Level Security → cada org só vê seus dados     │
│  Triggers → snapshot automático ao salvar           │
│  Auth → e-mail + senha (Supabase Auth)              │
└─────────────────────────────────────────────────────┘
```

---

## 💰 Custos

| Serviço | Plano gratuito cobre |
|---------|---------------------|
| Vercel | Até 100GB bandwidth/mês, deploys ilimitados |
| Supabase | 500MB banco, 50.000 usuários ativos/mês, 5GB storage |

**Para a maioria das empresas: custo zero.** Só paga se crescer muito.

---

## 🔒 Segurança

- Cada organização é isolada por Row Level Security (RLS) no banco
- Nenhum dado de uma empresa é visível para outra
- Autenticação via Supabase Auth (tokens JWT seguros)
- Variáveis de ambiente nunca expostas no cliente (apenas `NEXT_PUBLIC_*`)
- Server Actions validam autenticação antes de qualquer mutação

---

## 🚀 Próximas evoluções sugeridas

1. **Exportar PDF/Excel** — relatório executivo em um clique
2. **Notificações por e-mail** — alerta quando farol mudar para vermelho
3. **Histórico de evolução** — gráfico de tendência por projeto
4. **Relatório com IA** — botão para gerar relatório executivo em texto (Anthropic API)
5. **Integrações** — sincronizar % com Jira, Monday ou Asana via webhook
6. **App mobile** — PWA instalável no celular

---

## 🆘 Problemas comuns

**"Erro de autenticação" no deploy**
→ Verifique se as URLs de redirect no Supabase estão corretas

**"Organização não encontrada" após login**
→ Acesse `/onboarding` manualmente para criar a organização

**Usuário convidado não consegue acessar**
→ Verifique se confirmou o e-mail E se foi adicionado como membro da organização

**Dados não aparecem para o novo membro**
→ Confirme que o convite foi feito pelo admin com o e-mail correto
