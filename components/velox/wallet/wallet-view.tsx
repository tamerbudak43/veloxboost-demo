'use client'

import { useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  Copy,
  Check,
  Wallet,
  Info,
  ShieldCheck,
  Download,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PageHeader,
  Panel,
  PanelHeader,
  StatTile,
  StatusPill,
} from '@/components/velox/primitives'
import { formatUSDT, safeNumber } from '@/lib/format'
import { demoBalance } from '@/lib/demo-data'
import { createInvestmentInstruction } from '@/app/actions/investment-receipt'
import type { InvestmentReceipt } from '@/lib/types'
import { useLanguage } from '@/components/velox/language-context'

type WalletTab = 'deposit' | 'withdraw' | 'auto'

export function WalletView({
  initialTab = 'deposit',
  initialReceipts = [],
  depositAddress,
}: {
  initialTab?: WalletTab
  initialReceipts?: InvestmentReceipt[]
  depositAddress?: string | null
}) {
  const [tab, setTab] = useState<WalletTab>(initialTab)
  const { t } = useLanguage()
  const tabs: { id: WalletTab; label: string; icon: typeof Wallet }[] = [
    { id: 'deposit', label: t.deposit, icon: ArrowDownToLine },
    { id: 'withdraw', label: t.withdraw, icon: ArrowUpFromLine },
    { id: 'auto', label: t.topAutoWithdraw, icon: Repeat },
  ]

  return (
    <div>
      <PageHeader
        title="Cüzdan İşlemleri"
        description="USDT (TRC-20) bakiye yatırma, çekim talebi ve otomatik çekim kurallarını yönetin."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <StatTile label="Ticaret bakiyesi" value={formatUSDT(demoBalance.tradingBalance)} />
        <StatTile label="Gelir bakiyesi (çekilebilir)" value={formatUSDT(demoBalance.incomeBalance)} accent />
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {tabs.map((walletTab) => {
          const Icon = walletTab.icon
          const active = tab === walletTab.id
          return (
            <button
              key={walletTab.id}
              type="button"
              onClick={() => setTab(walletTab.id)}
              className={
                active
                  ? 'inline-flex items-center gap-1.5 rounded-md bg-elevated px-3 py-1.5 text-sm font-medium text-foreground'
                  : 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              <Icon className="size-4" />
              {walletTab.label}
            </button>
          )
        })}
      </div>

      {tab === 'deposit' && <DepositTab initialReceipts={initialReceipts} depositAddress={depositAddress} />}
      {tab === 'withdraw' && <WithdrawTab />}
      {tab === 'auto' && <AutoWithdrawTab />}
    </div>
  )
}

function DepositTab({
  initialReceipts,
  depositAddress,
}: {
  initialReceipts: InvestmentReceipt[]
  depositAddress?: string | null
}) {
  const { language } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [receipts, setReceipts] = useState(initialReceipts)

  const copy = async () => {
    if (!depositAddress) return
    try {
      await navigator.clipboard.writeText(depositAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function createInstruction() {
    setError(null)
    setMessage(null)
    setCreating(true)
    try {
      const receipt = await createInvestmentInstruction(Number(amount))
      setReceipts((current) => [receipt, ...current])
      setMessage(`Talimat ${receipt.receiptNumber} ile oluşturuldu. Ağ doğrulamasından sonra PDF indirilebilir.`)
      setAmount('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yatırım talimatı oluşturulamadı.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel>
        <PanelHeader title="USDT Yatırma Adresi" right={<StatusPill tone="active">TRC-20</StatusPill>} />
        <div className="p-4">
          <div className="rounded-lg border border-border bg-elevated p-4">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Cüzdan adresi (yalnızca USDT-TRC20)
            </span>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-card px-3 py-2 font-mono text-sm text-foreground">
                {depositAddress ?? 'Yönetici tarafından yapılandırılmayı bekliyor'}
              </code>
              <Button variant="outline" size="icon-sm" aria-label="Adresi kopyala" onClick={copy} disabled={!depositAddress}>
                {copied ? <Check className="text-light-cyan" /> : <Copy />}
              </Button>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0 text-bright" />
              Yalnızca TRON (TRC-20) ağı üzerinden USDT gönderin. Diğer ağlar kayıpla sonuçlanır.
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-light-cyan" />
              Yatırımlar ağ onayından sonra ticaret bakiyenize otomatik eklenir.
            </li>
          </ul>
        </div>
      </Panel>

      <Panel>
          <PanelHeader title="Yatırım talimatı" />
        <div className="p-4">
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Tutar (USDT)
          </label>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Minimum yatırım <span className="font-mono text-foreground">50 USDT</span>. Tutar,
            yukarıdaki adrese gönderiminizle eşleştirilir.
          </p>
          <Button
            className="mt-4 w-full velox-gradient text-primary-foreground"
            onClick={createInstruction}
            disabled={creating || !depositAddress || Number(amount) < 50}
          >
            <Wallet />
            {creating ? 'Oluşturuluyor…' : 'Yatırım talimatı oluştur'}
          </Button>
          {message && <p className="mt-3 text-xs text-light-cyan">{message}</p>}
          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
      </Panel>

      <Panel id="investment-receipts" className="lg:col-span-2">
        <PanelHeader title="Yatırım belgelerim" />
        {receipts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Henüz oluşturulmuş yatırım belgeniz yok.</div>
        ) : (
          <div className="divide-y divide-border">
            {receipts.map((receipt) => {
              const downloadable = receipt.status === 'confirmed'
              return (
                <div key={receipt.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground"><FileText className="size-4 text-cyan" />{receipt.receiptNumber}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatUSDT(receipt.amount)} • {receipt.network} • {downloadable ? 'Doğrulandı' : 'Ağ doğrulaması bekliyor'}</p>
                  </div>
                  {downloadable ? (
                    <a href={`/api/receipts/${encodeURIComponent(receipt.receiptNumber)}?lang=${language}`} className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 px-3 py-1.5 text-xs font-medium text-cyan transition-colors hover:bg-cyan/10">
                      <Download className="size-3.5" /> PDF indir
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Doğrulama sonrası indirilebilir</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}

function WithdrawTab() {
  const available = safeNumber(demoBalance.incomeBalance)
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const n = safeNumber(amount)
  const fee = n > 0 ? Math.max(1, n * 0.01) : 0
  const receive = Math.max(0, n - fee)
  const overBalance = n > available
  const canSubmit = n > 0 && !overBalance && address.trim().length >= 20

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel>
        <PanelHeader title="Çekim Talebi" right={<StatusPill tone="active">TRC-20</StatusPill>} />
        <div className="p-4">
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Alıcı USDT-TRC20 adresi
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="T ile başlayan adres"
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
          />

          <div className="mt-4 flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Tutar (USDT)
            </label>
            <button
              type="button"
              onClick={() => setAmount(String(available))}
              className="text-xs text-bright hover:underline"
            >
              Maks: {formatUSDT(available, 2)}
            </button>
          </div>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
          />
          {overBalance ? (
            <p className="mt-1.5 text-xs text-destructive-foreground">
              Tutar, çekilebilir gelir bakiyenizi aşıyor.
            </p>
          ) : null}

          <Button
            className="mt-4 w-full velox-gradient text-primary-foreground"
            disabled={!canSubmit}
          >
            <ArrowUpFromLine />
            Çekim talebi oluştur
          </Button>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Talep özeti" />
        <div className="flex flex-col gap-3 p-4">
          <SummaryRow label="Çekim tutarı" value={formatUSDT(n, 2)} />
          <SummaryRow label="Ağ ücreti (%1)" value={`- ${formatUSDT(fee, 2)}`} />
          <div className="h-px bg-border" />
          <SummaryRow label="Hesabınıza geçecek" value={formatUSDT(receive, 2)} strong />
          <div className="mt-2 rounded-lg border border-border bg-elevated p-3 text-xs text-muted-foreground">
            Çekimler manuel güvenlik onayından sonra 24 saat içinde işlenir. Yalnızca gelir
            bakiyesi çekilebilir; ticaret bakiyesi aktif arbitrajda kullanılır.
          </div>
        </div>
      </Panel>
    </div>
  )
}

function AutoWithdrawTab() {
  const [enabled, setEnabled] = useState(false)
  const [threshold, setThreshold] = useState('50')
  const [address, setAddress] = useState('')

  return (
    <Panel className="max-w-2xl">
      <PanelHeader
        title="Otomatik Çekim Kuralı"
        right={
          <StatusPill tone={enabled ? 'success' : 'neutral'}>
            {enabled ? 'Aktif' : 'Pasif'}
          </StatusPill>
        }
      />
      <div className="p-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-elevated px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Otomatik çekimi etkinleştir</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gelir bakiyeniz eşiğe ulaştığında otomatik çekim talebi oluşturulur.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={
              enabled
                ? 'relative h-6 w-11 rounded-full bg-electric transition-colors'
                : 'relative h-6 w-11 rounded-full bg-surface transition-colors'
            }
          >
            <span
              className={
                enabled
                  ? 'absolute left-6 top-0.5 size-5 rounded-full bg-white transition-all'
                  : 'absolute left-0.5 top-0.5 size-5 rounded-full bg-muted-foreground transition-all'
              }
            />
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Çekim eşiği (USDT)
            </label>
            <input
              inputMode="decimal"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              disabled={!enabled}
              className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-electric disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Hedef adres (TRC-20)
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!enabled}
              placeholder="T ile başlayan adres"
              className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric disabled:opacity-50"
            />
          </div>
        </div>

        <Button className="mt-4 velox-gradient text-primary-foreground" disabled={!enabled}>
          <Repeat />
          Kuralı kaydet
        </Button>
      </div>
    </Panel>
  )
}

function QuickAmountInput() {
  const [amount, setAmount] = useState('')
  const presets = [50, 100, 250, 500]
  return (
    <div>
      <input
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(String(p))}
            className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-secondary-foreground transition-colors hover:bg-elevated hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? 'font-mono text-base font-semibold tabular-nums velox-gradient-text'
            : 'font-mono tabular-nums text-foreground'
        }
      >
        {value}
      </span>
    </div>
  )
}
