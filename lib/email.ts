type PasswordResetEmail = {
  to: string
  userName?: string | null
  resetUrl: string
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character)
}

export async function sendPasswordResetEmail({ to, userName, resetUrl }: PasswordResetEmail) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_EMAIL_FROM

  if (!apiKey || !from) {
    console.error('Password reset email was not sent: RESEND_API_KEY or AUTH_EMAIL_FROM is missing.')
    return
  }

  const safeName = escapeHtml(userName?.trim() || 'VELOX kullanıcısı')
  const safeUrl = escapeHtml(resetUrl)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'VELOX şifre sıfırlama / Password reset',
      html: `
        <div style="margin:0;background:#02070d;padding:32px;font-family:Arial,sans-serif;color:#eef7ff">
          <div style="max-width:560px;margin:auto;border:1px solid #164b73;border-radius:14px;background:#071a2d;padding:28px">
            <div style="font-size:20px;font-weight:800;letter-spacing:4px;color:#ffffff">▼ VELOX</div>
            <h1 style="margin:28px 0 8px;font-size:22px">Şifre sıfırlama</h1>
            <p style="color:#9ab5cf;line-height:1.6">Merhaba ${safeName}, hesabın için güvenli bir şifre sıfırlama talebi aldık.</p>
            <p style="color:#9ab5cf;line-height:1.6">Hello ${safeName}, we received a secure password reset request for your account.</p>
            <a href="${safeUrl}" style="display:inline-block;margin:16px 0;padding:12px 20px;border-radius:8px;background:linear-gradient(90deg,#0966d8,#20c5dc);color:#fff;text-decoration:none;font-weight:700">Şifreyi sıfırla / Reset password</a>
            <p style="color:#6f8ca8;font-size:12px;line-height:1.5">Bu bağlantı 1 saat geçerlidir. Talebi siz yapmadıysanız bu e-postayı yok sayın.<br />This link is valid for 1 hour. If you did not request it, ignore this email.</p>
          </div>
        </div>`,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Password reset email provider returned ${response.status}: ${detail}`)
  }
}
