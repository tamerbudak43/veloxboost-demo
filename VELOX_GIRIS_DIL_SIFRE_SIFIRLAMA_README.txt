VELOX — Giriş dili ve şifre sıfırlama paketi

1) ZIP içeriğini proje köküne çıkarın:
   C:\PROJECT OFFICE\velox-dashboard

2) Vercel > Environment Variables bölümüne ekleyin:
   RESEND_API_KEY = Resend hesabınızdan alınan gizli anahtar
   AUTH_EMAIL_FROM = VELOX <noreply@veloxboost.online>

3) Resend üzerinde veloxboost.online alan adını doğrulayın.

4) Yalnızca bu değişiklikleri GitHub'a gönderin:
   git add .env.example app/forgot-password/page.tsx app/reset-password/page.tsx components/velox/auth/auth-form.tsx components/velox/auth/auth-translations.ts components/velox/auth/password-recovery-form.tsx lib/auth.ts lib/email.ts
   git commit -m "Giris ekranina dil ve sifre sifirlama ekle"
   git push origin main

Notlar:
- Dil tercihi cihazda saklanır.
- Sıfırlama bağlantısı 1 saat geçerlidir.
- admin@velox.local gerçek bir posta adresi olmadığı için bu hesaba e-posta ulaşmaz.
- Gerçek e-posta adresi olan kullanıcılar sıfırlama bağlantısını alabilir.
