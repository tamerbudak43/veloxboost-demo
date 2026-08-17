'use client'

import { useState } from 'react'
import { Waves, Save, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel, StatTile, ProgressBar, StatusPill } from '@/components/velox/primitives'
import { demoAdminKpi } from '@/lib/demo-data'
import { formatUSDT, formatNumber, percentOf } from '@/lib/format'

const pools = [
  { id: 'p1', name: 'Ana Arbitraj Havuzu', balance: 312500, allocation: 58, apy: 1.2 },
  { id: 'p2', name: 'Likidite Rezervi', balance: 148200, allocation: 27, apy: 0.6 },
  { id: 'p3', name: 'Sigorta Fonu', balance: 81620, allocation: 15, apy: 0 },
]

export function AdminPools() {
  const kpi = demoAdminKpi
  const [phaseActive, setPhaseActive] = useState(true)
  const [phaseMinutes, setPhaseMinutes] = useState('60')
  const [dailyRate, setDailyRate] = useState('1.20')
  const [minTrade, setMinTrade] = useState('10')
  const [maxTrade, setMaxTrade] = useState('50000')
  const totalPool = pools.reduce((s, p) => s + p.balance, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Havuz & Faz Yönetimi</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Arbitraj fazını, havuz dağılımını ve işlem parametrelerini yapılandırın.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Toplam havuz" value={formatUSDT(totalPool, 0)} accent />
        <StatTile label="Aktif kontrat" value={formatNumber(kpi.activeContracts, 0)} />
        <StatTile
          label="Faz durumu"
          value={phaseActive ? 'Aktif' : 'Duraklatıldı'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pool allocation */}
        <Panel>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="size-4 text-primary" />
              <h2 className="font-semibold">Havuz dağılımı</h2>
            </div>
            <StatusPill tone="success">Dengeli</StatusPill>
          </div>
          <div className="mt-5 space-y-5">
            {pools.map((p) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-mono tabular-nums">{formatUSDT(p.balance, 0)}</span>
                </div>
                <ProgressBar value={percentOf(p.balance, totalPool)} />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{formatNumber(percentOf(p.balance, totalPool), 1)}% dağılım</span>
                  <span>Günlük {formatNumber(p.apy, 2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Phase control */}
        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Faz kontrolü</h2>
            {phaseActive ? (
              <StatusPill tone="active">Çalışıyor</StatusPill>
            ) : (
              <StatusPill tone="warning">Duraklatıldı</StatusPill>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Faz süresi (dakika)
              </span>
              <input
                type="number"
                value={phaseMinutes}
                onChange={(e) => setPhaseMinutes(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Günlük tahakkuk oranı (%)
              </span>
              <input
                type="number"
                step="0.01"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPhaseActive((v) => !v)}
            >
              {phaseActive ? <Pause /> : <Play />}
              {phaseActive ? 'Fazı duraklat' : 'Fazı başlat'}
            </Button>
          </div>
        </Panel>
      </div>

      {/* Trade limits */}
      <Panel>
        <h2 className="font-semibold">İşlem limitleri</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Minimum işlem (USDT)
            </span>
            <input
              type="number"
              value={minTrade}
              onChange={(e) => setMinTrade(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Maksimum işlem (USDT)
            </span>
            <input
              type="number"
              value={maxTrade}
              onChange={(e) => setMaxTrade(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <Button className="velox-gradient text-primary-foreground">
            <Save />
            Değişiklikleri kaydet
          </Button>
        </div>
      </Panel>
    </div>
  )
}
