'use client'

import { useState, type FormEvent } from 'react'
import { BadgeCheck, CheckCircle2, FileLock2, Loader2, Save, ShieldAlert, WalletCards } from 'lucide-react'
import { saveMyKycProfile, type KycProfileInput } from '@/app/actions/kyc'
import { Panel, PanelHeader, StatusPill } from '@/components/velox/primitives'

type Initial = Partial<KycProfileInput> & { status?: string; email: string }

const empty: KycProfileInput = {
  fullName: '', birthDate: '', nationality: '', country: '', city: '', addressLine: '', postalCode: '', phone: '', documentType: 'national_id', documentNumber: '', documentExpiry: '', walletNetwork: 'BEP20', walletAddress: '', consentAccepted: false,
}

export function KycProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState<KycProfileInput>({ ...empty, ...initial, consentAccepted: Boolean(initial.consentAccepted) })
  const [status, setStatus] = useState(initial.status ?? 'draft')
  const [loading, setLoading] = useState<'save' | 'submit' | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const update = (key: keyof KycProfileInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))

  async function persist(submit: boolean) {
    setLoading(submit ? 'submit' : 'save'); setMessage(null)
    try {
      const result = await saveMyKycProfile(form, submit)
      setStatus(result.status)
      setMessage({ tone: 'ok', text: submit ? 'KYC profili demo inceleme kuyruğuna gönderildi.' : 'Taslak kaydedildi.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'KYC profili kaydedilemedi.' })
    } finally { setLoading(null) }
  }

  function onSubmit(event: FormEvent) { event.preventDefault(); void persist(true) }

  return <form onSubmit={onSubmit} className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan">Hesap güvenliği</p><h1 className="mt-1 text-2xl font-semibold text-foreground">KYC profili</h1><p className="mt-1 text-sm text-muted-foreground">Kimlik, ikamet ve USDT ödeme adresi bilgilerinizi yönetin.</p></div><StatusPill tone={status === 'approved' ? 'success' : status === 'pending' ? 'active' : status === 'rejected' ? 'danger' : 'neutral'}>{statusLabel(status)}</StatusPill></div>

    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100"><span className="font-semibold">Demo güvenlik notu:</span> Bu aşamada gerçek kimlik fotoğrafı, selfie veya adres belgesi yüklemeyin. Üretimde belge doğrulama, şifreli saklama ve canlılık kontrolü yetkili bir KYC sağlayıcısıyla yapılmalıdır.</div>

    <Panel><PanelHeader title="Kişisel bilgiler" right={<BadgeCheck className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label="Ad ve soyadı" required><Input value={form.fullName} onChange={(v) => update('fullName', v)} placeholder="Ad Soyad" /></Field><Field label="Doğum tarihi" required><Input type="date" value={form.birthDate} onChange={(v) => update('birthDate', v)} /></Field><Field label="Uyruk" required><Input value={form.nationality} onChange={(v) => update('nationality', v)} placeholder="Türkiye Cumhuriyeti" /></Field><Field label="E-posta"><Input type="email" value={initial.email} onChange={() => {}} disabled /></Field><Field label="Telefon" required><Input type="tel" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+90 5xx xxx xx xx" /></Field></div></Panel>

    <Panel><PanelHeader title="İkamet bilgileri" right={<FileLock2 className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label="Ülke" required><Input value={form.country} onChange={(v) => update('country', v)} placeholder="Türkiye" /></Field><Field label="Şehir" required><Input value={form.city} onChange={(v) => update('city', v)} placeholder="Ankara" /></Field><Field label="Posta kodu"><Input value={form.postalCode ?? ''} onChange={(v) => update('postalCode', v)} /></Field><Field label="Açık adres" required wide><textarea value={form.addressLine} onChange={(event) => update('addressLine', event.target.value)} rows={3} className="velox-input h-auto resize-y" placeholder="Mahalle, cadde, bina ve daire" /></Field></div></Panel>

    <Panel><PanelHeader title="Kimlik bilgileri" right={<ShieldAlert className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label="Belge türü" required><select value={form.documentType} onChange={(event) => update('documentType', event.target.value)} className="velox-input"><option value="national_id">T.C. kimlik kartı</option><option value="passport">Pasaport</option><option value="residence_permit">Oturma izni</option></select></Field><Field label="Belge numarası" required><Input value={form.documentNumber} onChange={(v) => update('documentNumber', v)} placeholder="Kimlik veya pasaport numarası" /></Field><Field label="Belge son kullanma tarihi"><Input type="date" value={form.documentExpiry ?? ''} onChange={(v) => update('documentExpiry', v)} /></Field></div></Panel>

    <Panel><PanelHeader title="USDT cüzdan bilgileri" right={<WalletCards className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]"><Field label="Ağ" required><select value={form.walletNetwork} onChange={(event) => update('walletNetwork', event.target.value)} className="velox-input"><option value="BEP20">BNB Smart Chain (BEP20)</option><option value="TRC20">TRON (TRC20)</option><option value="ERC20">Ethereum (ERC20)</option></select></Field><Field label="USDT cüzdan adresi" required><Input value={form.walletAddress} onChange={(v) => update('walletAddress', v)} placeholder="Seçilen ağa ait cüzdan adresi" mono /></Field></div><div className="mx-5 mb-5 rounded-md border border-border bg-elevated px-4 py-3 text-xs leading-5 text-muted-foreground">Cüzdan ağı ile adres aynı zincire ait olmalıdır. Üretimde adres değişiklikleri e-posta/2FA doğrulaması ve bekleme süresiyle korunmalıdır.</div></Panel>

    <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-secondary-foreground"><input type="checkbox" checked={form.consentAccepted} onChange={(event) => update('consentAccepted', event.target.checked)} className="mt-1 size-4 accent-cyan" /><span>KYC bilgilerimin kimlik doğrulama, mevzuat uyumu ve hesap güvenliği amacıyla işlenmesini kabul ediyorum. Demo ortamına gerçek belge görseli yüklemeyeceğimi biliyorum.</span></label>
    {message && <div className={message.tone === 'ok' ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200' : 'rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'}>{message.text}</div>}
    <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => void persist(false)} disabled={Boolean(loading)} className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-elevated disabled:opacity-50">{loading === 'save' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Taslak kaydet</button><button type="submit" disabled={Boolean(loading)} className="velox-gradient inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{loading === 'submit' ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}İncelemeye gönder</button></div>
  </form>
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? 'md:col-span-2 xl:col-span-3' : ''}><span className="mb-1.5 block text-xs font-medium text-secondary-foreground">{label}{required && <span className="ml-1 text-cyan">*</span>}</span>{children}</label> }
function Input({ value, onChange, type = 'text', placeholder, disabled, mono }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean; mono?: boolean }) { return <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className={`velox-input ${mono ? 'font-mono' : ''}`} /> }
function statusLabel(status: string) { return status === 'approved' ? 'Onaylandı' : status === 'pending' ? 'İnceleme bekliyor' : status === 'rejected' ? 'Düzeltme gerekli' : 'Taslak' }
