'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
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
  ChevronDown,
  AlertTriangle,
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
import type { WalletNetworkConfig, WalletNetworkId } from '@/lib/wallet/network-config'

type WalletTab = 'deposit' | 'withdraw' | 'auto'

export function WalletView({
  initialTab = 'deposit',
  initialReceipts = [],
  walletNetworks,
}: {
  initialTab?: WalletTab
  initialReceipts?: InvestmentReceipt[]
  walletNetworks: WalletNetworkConfig[]
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
        description="Desteklenen USDT ağlarında bakiye yatırma, çekim talebi ve otomatik çekim kurallarını yönetin."
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

      {tab === 'deposit' && <DepositTab initialReceipts={initialReceipts} walletNetworks={walletNetworks} />}
      {tab === 'withdraw' && <WithdrawTab walletNetworks={walletNetworks} />}
      {tab === 'auto' && <AutoWithdrawTab walletNetworks={walletNetworks} />}
    </div>
  )
}

function DepositTab({
  initialReceipts,
  walletNetworks,
}: {
  initialReceipts: InvestmentReceipt[]
  walletNetworks: WalletNetworkConfig[]
}) {
  const defaultNetwork = walletNetworks.find((network) => network.configured) ?? walletNetworks[0]
  const [networkId, setNetworkId] = useState<WalletNetworkId>(defaultNetwork?.id ?? 'TON')
  const [copiedField, setCopiedField] = useState<'address' | 'memo' | null>(null)
  const [amount, setAmount] = useState(() => String(defaultNetwork?.minimumDeposit ?? 100))
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [receipts, setReceipts] = useState(initialReceipts)
  const selectedNetwork = walletNetworks.find((network) => network.id === networkId) ?? defaultNetwork

  const copy = async (field: 'address' | 'memo', value: string | null) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  async function createInstruction() {
    setError(null)
    setMessage(null)
    setCreating(true)
    try {
      const receipt = await createInvestmentInstruction(Number(amount), networkId)
      setReceipts((current) => [receipt, ...current])
      setMessage(`Talimat ${receipt.receiptNumber} ile oluşturuldu. Ağ doğrulamasından sonra PDF indirilebilir.`)
      setAmount(String(selectedNetwork?.minimumDeposit ?? 100))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Yatırım talimatı oluşturulamadı.')
    } finally {
      setCreating(false)
    }
  }

  function selectDepositNetwork(nextNetworkId: WalletNetworkId) {
    const nextNetwork = walletNetworks.find((network) => network.id === nextNetworkId)
    setNetworkId(nextNetworkId)
    setAmount(String(nextNetwork?.minimumDeposit ?? 100))
    setMessage(null)
    setError(null)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel>
        <PanelHeader title="Bakiye yatır" right={<StatusPill tone="active">{selectedNetwork?.id ?? 'USDT'}</StatusPill>} />
        <div className="space-y-4 p-4">
          <NetworkSelector networks={walletNetworks} value={networkId} onChange={selectDepositNetwork} />

          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs leading-5 text-rose-200">
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>USDT varlığında çalışmanın minimum tutarı <strong>{selectedNetwork?.minimumDeposit ?? 100} USDT</strong>.</span></div>
          </div>

          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs leading-5 text-rose-200">
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>Cüzdan bakiyenizi USDT kripto para ile gönderin. Yanlış ağ veya eksik Memo/Etiket kullanılması durumunda transfer geri alınamayabilir.</span></div>
          </div>

          <CopyField
            label="Cüzdan adresi"
            value={selectedNetwork?.depositAddress ?? null}
            placeholder="Yönetici tarafından yapılandırılmayı bekliyor"
            copied={copiedField === 'address'}
            onCopy={() => copy('address', selectedNetwork?.depositAddress ?? null)}
          />

          {selectedNetwork?.configured && selectedNetwork.depositAddress ? (
            <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-4">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="shrink-0 rounded-xl bg-white p-2.5 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                  <QRCodeSVG
                    value={selectedNetwork.depositAddress}
                    size={148}
                    level="M"
                    marginSize={4}
                    title={`${selectedNetwork.label} — USDT Yatırma Adresi`}
                    className="h-36 w-36"
                  />
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold text-foreground">QR ile yatır</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Cüzdan uygulamanızla QR kodunu tarayın.
                  </p>
                  <span className="mt-3 inline-flex rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-light-cyan">
                    USDT · {selectedNetwork.id}
                  </span>
                  <p className="mt-2 text-[11px] leading-4 text-amber-200">
                    Yalnızca seçili ağ üzerinden USDT gönderin.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {selectedNetwork?.memoRequired ? (
            <CopyField
              label="Memo / Etiket"
              value={selectedNetwork.depositMemo}
              placeholder="Zorunlu Memo/Etiket yapılandırılmayı bekliyor"
              badge="ZORUNLU"
              copied={copiedField === 'memo'}
              onCopy={() => copy('memo', selectedNetwork.depositMemo)}
            />
          ) : null}

          {!selectedNetwork?.configured ? (
            <p className="flex items-start gap-2 text-xs text-amber-200"><Info className="mt-0.5 size-3.5 shrink-0" />Bu ağ henüz yönetici tarafından etkinleştirilmedi.</p>
          ) : (
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-light-cyan" />Yatırımlar ağ onayından sonra ticaret bakiyenize eklenir.</p>
          )}
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
            min={selectedNetwork?.minimumDeposit ?? 100}
            step="0.01"
            placeholder="0.00"
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Minimum yatırım <span className="font-mono text-foreground">{selectedNetwork?.minimumDeposit ?? 100} USDT</span>. Tutar,
            yukarıdaki adrese gönderiminizle eşleştirilir.
          </p>
          <Button
            className="mt-4 w-full velox-gradient text-primary-foreground"
            onClick={createInstruction}
            disabled={creating || !selectedNetwork?.configured || Number(amount) < (selectedNetwork?.minimumDeposit ?? 100)}
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
                    <a href={`/api/receipts/${encodeURIComponent(receipt.receiptNumber)}`} className="inline-flex items-center gap-1.5 rounded-md border border-cyan/40 px-3 py-1.5 text-xs font-medium text-cyan transition-colors hover:bg-cyan/10">
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

function WithdrawTab({ walletNetworks }: { walletNetworks: WalletNetworkConfig[] }) {
  const available = safeNumber(demoBalance.incomeBalance)
  const [networkId, setNetworkId] = useState<WalletNetworkId>(walletNetworks[0]?.id ?? 'TON')
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const selectedNetwork = walletNetworks.find((network) => network.id === networkId) ?? walletNetworks[0]
  const n = safeNumber(amount)
  const fee = n > 0 ? Math.max(1, n * 0.01) : 0
  const receive = Math.max(0, n - fee)
  const overBalance = n > available
  const canSubmit = n > 0 && !overBalance && address.trim().length >= 20

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel>
        <PanelHeader title="Çekim Talebi" right={<StatusPill tone="active">{selectedNetwork?.id ?? 'USDT'}</StatusPill>} />
        <div className="space-y-4 p-4">
          <NetworkSelector networks={walletNetworks} value={networkId} onChange={(nextNetwork) => { setNetworkId(nextNetwork); setAddress(''); setMemo('') }} />
          <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Alıcı {selectedNetwork?.label ?? 'USDT'} adresi
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={selectedNetwork?.addressPlaceholder ?? 'Cüzdan adresi'}
            className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric"
          />
          </div>

          {selectedNetwork?.memoRequired ? <div><label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Memo / Etiket (alıcı istiyorsa)</label><input value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="Memo / Etiket" className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric" /></div> : null}

          <div className="flex items-center justify-between">
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

function AutoWithdrawTab({ walletNetworks }: { walletNetworks: WalletNetworkConfig[] }) {
  const [enabled, setEnabled] = useState(false)
  const [networkId, setNetworkId] = useState<WalletNetworkId>(walletNetworks[0]?.id ?? 'TON')
  const [threshold, setThreshold] = useState('100')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')
  const selectedNetwork = walletNetworks.find((network) => network.id === networkId) ?? walletNetworks[0]

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

        <div className="mt-4"><NetworkSelector networks={walletNetworks} value={networkId} onChange={(nextNetwork) => { setNetworkId(nextNetwork); setAddress(''); setMemo('') }} /></div>

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
              Hedef adres ({selectedNetwork?.id ?? 'USDT'})
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!enabled}
              placeholder={selectedNetwork?.addressPlaceholder ?? 'Cüzdan adresi'}
              className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric disabled:opacity-50"
            />
          </div>
          {selectedNetwork?.memoRequired ? <div><label className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Memo / Etiket (alıcı istiyorsa)</label><input value={memo} onChange={(event) => setMemo(event.target.value)} disabled={!enabled} placeholder="Memo / Etiket" className="mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-electric disabled:opacity-50" /></div> : null}
        </div>

        <Button className="mt-4 velox-gradient text-primary-foreground" disabled={!enabled}>
          <Repeat />
          Kuralı kaydet
        </Button>
      </div>
    </Panel>
  )
}

function NetworkSelector({
  networks,
  value,
  onChange,
}: {
  networks: WalletNetworkConfig[]
  value: WalletNetworkId
  onChange: (network: WalletNetworkId) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = networks.find((network) => network.id === value) ?? networks[0]
  return (
    <div className="relative">
      <label className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Ağ seçin</label>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2.5 text-left text-sm font-medium text-foreground outline-none transition-colors hover:border-cyan/50 focus:border-electric"
      >
        <span>{selected?.label ?? 'Ağ bulunamadı'}</span>
        <ChevronDown className={open ? 'size-4 rotate-180 transition-transform' : 'size-4 transition-transform'} />
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          {networks.map((network) => (
            <button
              key={network.id}
              type="button"
              onClick={() => { onChange(network.id); setOpen(false) }}
              className={network.id === value
                ? 'flex w-full items-center justify-between bg-cyan/10 px-3 py-3 text-left text-sm font-semibold text-light-cyan'
                : 'flex w-full items-center justify-between px-3 py-3 text-left text-sm text-secondary-foreground transition-colors hover:bg-elevated'}
            >
              <span>{network.label}</span>
              {network.id === value ? <Check className="size-4" /> : !network.configured ? <span className="text-[10px] text-amber-300">Yapılandırılmadı</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CopyField({
  label,
  value,
  placeholder,
  badge,
  copied,
  onCopy,
}: {
  label: string
  value: string | null
  placeholder: string
  badge?: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="rounded-lg border border-border bg-elevated p-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
        <span>{label}</span>
        {badge ? <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">{badge}</span> : null}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all font-mono text-sm font-semibold leading-5 text-foreground">{value ?? placeholder}</code>
        <Button variant="outline" size="icon-sm" aria-label={`${label} kopyala`} onClick={onCopy} disabled={!value}>
          {copied ? <Check className="text-light-cyan" /> : <Copy />}
        </Button>
      </div>
    </div>
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
