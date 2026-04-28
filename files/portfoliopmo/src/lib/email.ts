// src/lib/email.ts
// E-mail notifications via Resend (resend.com).
// All functions are no-ops when RESEND_API_KEY is not configured.

import { Resend } from 'resend'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'PortfolioPMO <onboarding@resend.dev>'
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfoliopmo.vercel.app'

// ─── Notificação para admins: novo pedido de acesso ───────────────────────────

export async function sendPendingApprovalNotification(opts: {
  adminEmails: string[]
  newUserNome: string
  newUserEmail: string
  requestedRole: string
  memberId?: string
}) {
  const resend = getResend()
  if (!resend || opts.adminEmails.length === 0) return

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Viewer',
  }

  const approveUrl = opts.memberId
    ? `${SITE()}/acao-membro?action=approve&id=${opts.memberId}`
    : `${SITE()}/configuracoes`
  const rejectUrl = opts.memberId
    ? `${SITE()}/acao-membro?action=reject&id=${opts.memberId}`
    : `${SITE()}/configuracoes`

  await resend.emails.send({
    from: FROM,
    to: opts.adminEmails,
    subject: `[PortfolioPMO] Novo pedido de acesso — ${opts.newUserNome}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;padding:32px;border-radius:12px">
        <h2 style="color:#818cf8;margin-top:0">Novo pedido de acesso</h2>
        <p>Um novo usuário solicitou acesso ao <strong>PortfolioPMO</strong>:</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#1a1f2e;border-radius:8px;padding:16px">
          <tr>
            <td style="padding:8px 12px;color:#94a3b8;width:40%">Nome</td>
            <td style="padding:8px 12px;font-weight:600">${opts.newUserNome}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#94a3b8">E-mail</td>
            <td style="padding:8px 12px;font-weight:600">${opts.newUserEmail}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;color:#94a3b8">Tipo de acesso</td>
            <td style="padding:8px 12px;font-weight:600">${roleLabel[opts.requestedRole] ?? opts.requestedRole}</td>
          </tr>
        </table>
        <p style="margin-bottom:16px">O que deseja fazer?</p>
        <div style="display:flex;gap:12px">
          <a href="${approveUrl}"
             style="display:inline-block;background:#22c55e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            ✅ Aprovar acesso
          </a>
          <a href="${rejectUrl}"
             style="display:inline-block;background:#374151;color:#e2e8f0;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
            ❌ Rejeitar
          </a>
        </div>
        <p style="color:#64748b;font-size:12px;margin-top:24px">
          Você precisa estar logado como administrador para executar a ação.<br>
          Também é possível gerenciar em <a href="${SITE()}/configuracoes" style="color:#818cf8">Configurações → Solicitações Pendentes</a>.
        </p>
      </div>
    `,
  }).catch(() => {})
}

// ─── E-mail para o usuário: acesso aprovado ───────────────────────────────────

export async function sendApprovedEmail(userEmail: string, userName: string | null) {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: [userEmail],
    subject: '[PortfolioPMO] Seu acesso foi aprovado!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#22c55e">Acesso aprovado!</h2>
        <p>Olá${userName ? ` ${userName}` : ''}, seu acesso ao <strong>PortfolioPMO</strong> foi aprovado.</p>
        <a href="${SITE()}/login"
           style="display:inline-block;background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Acessar a plataforma →
        </a>
      </div>
    `,
  }).catch(() => {})
}

// ─── E-mail para o usuário: acesso rejeitado ──────────────────────────────────

export async function sendRejectedEmail(userEmail: string, userName: string | null) {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: [userEmail],
    subject: '[PortfolioPMO] Solicitação de acesso não aprovada',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#ef4444">Solicitação não aprovada</h2>
        <p>Olá${userName ? ` ${userName}` : ''}, sua solicitação de acesso ao <strong>PortfolioPMO</strong>
           não foi aprovada.</p>
        <p style="color:#555">Entre em contato com o administrador da plataforma para mais informações.</p>
      </div>
    `,
  }).catch(() => {})
}
