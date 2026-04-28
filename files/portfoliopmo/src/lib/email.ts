// src/lib/email.ts
// E-mail notifications via Resend (resend.com).
// All functions are no-ops when RESEND_API_KEY is not configured.

import { Resend } from 'resend'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = 'PortfolioPMO <onboarding@resend.dev>'
const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfoliopmo.vercel.app'

// ─── Notificação para admins: novo pedido de acesso ───────────────────────────

export async function sendPendingApprovalNotification(opts: {
  adminEmails: string[]
  newUserNome: string
  newUserEmail: string
  requestedRole: string
}) {
  const resend = getResend()
  if (!resend || opts.adminEmails.length === 0) return

  const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Viewer',
  }

  await resend.emails.send({
    from: FROM,
    to: opts.adminEmails,
    subject: `[PortfolioPMO] Novo pedido de acesso — ${opts.newUserNome}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#6366f1">Novo pedido de acesso</h2>
        <p>Um novo usuário solicitou acesso ao <strong>PortfolioPMO</strong>:</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0">
          <tr><td style="padding:6px 0;color:#555">Nome</td>
              <td style="padding:6px 0;font-weight:600">${opts.newUserNome}</td></tr>
          <tr><td style="padding:6px 0;color:#555">E-mail</td>
              <td style="padding:6px 0;font-weight:600">${opts.newUserEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#555">Acesso solicitado</td>
              <td style="padding:6px 0;font-weight:600">${roleLabel[opts.requestedRole] ?? opts.requestedRole}</td></tr>
        </table>
        <a href="${SITE()}/configuracoes"
           style="display:inline-block;background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Aprovar ou Rejeitar →
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">
          Acesse Configurações → Solicitações Pendentes para gerenciar o acesso.
        </p>
      </div>
    `,
  }).catch(() => {
    // Never block the registration flow due to email errors
  })
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
