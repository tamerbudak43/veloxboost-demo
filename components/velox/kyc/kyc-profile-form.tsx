'use client'

import { useState, type FormEvent } from 'react'
import { BadgeCheck, CheckCircle2, FileLock2, Loader2, Save, ShieldAlert, WalletCards } from 'lucide-react'
import { saveMyKycProfile, type KycProfileInput } from '@/app/actions/kyc'
import { Panel, PanelHeader, StatusPill } from '@/components/velox/primitives'
import { useLanguage } from '@/components/velox/language-context'

type Initial = Partial<KycProfileInput> & { status?: string; email: string }

const empty: KycProfileInput = {
  fullName: '', birthDate: '', nationality: '', country: '', city: '', addressLine: '', postalCode: '', phone: '', documentType: 'national_id', documentNumber: '', documentExpiry: '', walletNetwork: 'BEP20', walletAddress: '', consentAccepted: false,
}

export function KycProfileForm({ initial }: { initial: Initial }) {
  const { t } = useLanguage()
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
      setMessage({ tone: 'ok', text: submit ? t.reviewSubmitted : t.draftSaved })
    } catch {
      setMessage({ tone: 'error', text: t.saveFailed })
    } finally { setLoading(null) }
  }

  function onSubmit(event: FormEvent) { event.preventDefault(); void persist(true) }

  return <form onSubmit={onSubmit} className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-cyan">{t.accountSecurity}</p><h1 className="mt-1 text-2xl font-semibold text-foreground">{t.kycProfile}</h1><p className="mt-1 text-sm text-muted-foreground">{t.kycIntro}</p></div><StatusPill tone={status === 'approved' ? 'success' : status === 'pending' ? 'active' : status === 'rejected' ? 'danger' : 'neutral'}>{status === 'approved' ? t.statusApproved : status === 'pending' ? t.statusPending : status === 'rejected' ? t.statusRejected : t.statusDraft}</StatusPill></div>

    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100"><span className="font-semibold">{t.demoSecurityTitle}</span> {t.demoSecurityNote}</div>

    <Panel><PanelHeader title={t.personalInformation} right={<BadgeCheck className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label={t.fullName} required><Input value={form.fullName} onChange={(v) => update('fullName', v)} placeholder={t.fullName} /></Field><Field label={t.birthDate} required><Input type="date" value={form.birthDate} onChange={(v) => update('birthDate', v)} /></Field><Field label={t.nationality} required><Input value={form.nationality} onChange={(v) => update('nationality', v)} placeholder={t.nationality} /></Field><Field label={t.email}><Input type="email" value={initial.email} onChange={() => {}} disabled /></Field><Field label={t.phone} required><Input type="tel" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+90 5xx xxx xx xx" /></Field></div></Panel>

    <Panel><PanelHeader title={t.residenceInformation} right={<FileLock2 className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label={t.country} required><Input value={form.country} onChange={(v) => update('country', v)} placeholder={t.country} /></Field><Field label={t.city} required><Input value={form.city} onChange={(v) => update('city', v)} placeholder={t.city} /></Field><Field label={t.postalCode}><Input value={form.postalCode ?? ''} onChange={(v) => update('postalCode', v)} /></Field><Field label={t.address} required wide><textarea value={form.addressLine} onChange={(event) => update('addressLine', event.target.value)} rows={3} className="velox-input h-auto resize-y" placeholder={t.address} /></Field></div></Panel>

    <Panel><PanelHeader title={t.identityInformation} right={<ShieldAlert className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label={t.documentType} required><select value={form.documentType} onChange={(event) => update('documentType', event.target.value)} className="velox-input"><option value="national_id">{t.nationalId}</option><option value="passport">{t.passport}</option><option value="residence_permit">{t.residencePermit}</option></select></Field><Field label={t.documentNumber} required><Input value={form.documentNumber} onChange={(v) => update('documentNumber', v)} placeholder={t.documentNumber} /></Field><Field label={t.documentExpiry}><Input type="date" value={form.documentExpiry ?? ''} onChange={(v) => update('documentExpiry', v)} /></Field></div></Panel>

    <Panel><PanelHeader title={t.walletInformation} right={<WalletCards className="size-4 text-cyan" />} /><div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]"><Field label={t.walletNetwork} required><select value={form.walletNetwork} onChange={(event) => update('walletNetwork', event.target.value)} className="velox-input"><option value="BEP20">BNB Smart Chain (BEP20)</option><option value="TRC20">TRON (TRC20)</option><option value="ERC20">Ethereum (ERC20)</option></select></Field><Field label={t.walletAddress} required><Input value={form.walletAddress} onChange={(v) => update('walletAddress', v)} placeholder={t.walletAddress} mono /></Field></div><div className="mx-5 mb-5 rounded-md border border-border bg-elevated px-4 py-3 text-xs leading-5 text-muted-foreground">{t.walletSecurityNote}</div></Panel>

    <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-secondary-foreground"><input type="checkbox" checked={form.consentAccepted} onChange={(event) => update('consentAccepted', event.target.checked)} className="mt-1 size-4 accent-cyan" /><span>{t.consent}</span></label>
    {message && <div className={message.tone === 'ok' ? 'rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200' : 'rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'}>{message.text}</div>}
    <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => void persist(false)} disabled={Boolean(loading)} className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-elevated disabled:opacity-50">{loading === 'save' ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{t.saveDraft}</button><button type="submit" disabled={Boolean(loading)} className="velox-gradient inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{loading === 'submit' ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{t.submitReview}</button></div>
  </form>
}

function Field({ label, required, wide, children }: { label: string; required?: boolean; wide?: boolean; children: React.ReactNode }) { return <label className={wide ? 'md:col-span-2 xl:col-span-3' : ''}><span className="mb-1.5 block text-xs font-medium text-secondary-foreground">{label}{required && <span className="ml-1 text-cyan">*</span>}</span>{children}</label> }
function Input({ value, onChange, type = 'text', placeholder, disabled, mono }: { value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean; mono?: boolean }) { return <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className={`velox-input ${mono ? 'font-mono' : ''}`} /> }
