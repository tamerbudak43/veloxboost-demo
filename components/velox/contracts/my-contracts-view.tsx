'use client'

import { useState, type ReactNode } from 'react'
import { BadgeCheck, ClipboardList, Download, FileText, Landmark, PenLine, ShieldCheck, Stamp, UserRound } from 'lucide-react'
import { Panel, StatusPill } from '@/components/velox/primitives'

type DemoContract = {
  title: string
  code: string
  description: string
  sections: Array<{ title: string; body: string }>
}

const contracts: DemoContract[] = [
  {
    title: 'Arbitraj Standart Demo Özeti',
    code: 'VLX-DEMO-ARB-STANDARD',
    description: 'Platform içi ekran akışını ve bilgi düzenini göstermek için hazırlanmış örnek özet.',
    sections: [
      { title: '1. Amaç', body: 'Bu ekran, VELOX kullanıcı panelinde sözleşme görünümü, kayıt bilgileri ve demo senaryo özetinin nasıl sunulacağını gösterir.' },
      { title: '2. Demo kapsamı', body: 'Bu sürümde gerçek para, cüzdan hareketi, alım-satım emri veya blok zinciri aktarımı yapılmaz.' },
      { title: '3. Bilgilendirme', body: 'Gösterilen tüm metinler ürün taslağıdır. Hukuki belge, yatırım tavsiyesi veya getiri taahhüdü değildir.' },
    ],
  },
  {
    title: 'Arbitraj Pro Demo Özeti',
    code: 'VLX-DEMO-ARB-PRO',
    description: 'Gelişmiş panel bileşenleri için örnek sözleşme görünümü.',
    sections: [
      { title: '1. Görünüm amacı', body: 'Pro görünümü; işlem simülasyonları, raporlama alanları ve kullanıcı bilgilendirme bileşenleri için arayüz örneğidir.' },
      { title: '2. Kullanıcı kontrolü', body: 'Kullanıcı; profil, tercih ve demo kayıtlarını yalnızca kendi hesabı kapsamında görüntüler.' },
      { title: '3. Onay durumu', body: 'Bu ekran “demo taslak” durumundadır ve taraflar arasında bağlayıcı bir sözleşme oluşturmaz.' },
    ],
  },
]

export function MyContractsView({ memberName, memberEmail, veloxId }: { memberName: string; memberEmail: string; veloxId: string }) {
  const [selected, setSelected] = useState(0)
  const contract = contracts[selected]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground"><ClipboardList className="size-5 text-cyan" /> Sözleşmelerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hesabınıza ait demo sözleşme özetleri ve kayıt görünümü.</p>
        </div>
        <StatusPill tone="warning"><ShieldCheck className="size-3.5" /> Demo taslak · Bağlayıcı sözleşme değildir</StatusPill>
      </div>

      <div className="grid grid-cols-2 rounded-lg border border-border bg-card p-1">
        {contracts.map((item, index) => (
          <button key={item.code} type="button" onClick={() => setSelected(index)} className={index === selected ? 'rounded-md velox-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground' : 'rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-elevated hover:text-foreground'}>
            {index === 0 ? 'Arbitraj Standart' : 'Arbitraj Pro'}
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <a href="/api/contracts/demo" className="inline-flex items-center gap-2 rounded-md border border-cyan/40 px-3.5 py-2 text-sm font-medium text-cyan transition-colors hover:bg-cyan/10"><Download className="size-4" /> Demo PDF indir</a>
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-border bg-surface/50 px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><FileText className="size-5" /></div><div><p className="font-semibold tracking-[0.16em] text-foreground">VELOX</p><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Demo sözleşme özeti</p></div></div>
            <div className="text-right"><p className="font-mono text-sm font-semibold text-cyan">{contract.code}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Referans numarası</p></div>
          </div>
          <div className="mt-8 text-center"><h2 className="text-2xl font-semibold tracking-tight text-foreground">{contract.title}</h2><p className="mx-auto mt-2 max-w-2xl text-sm text-secondary-foreground">{contract.description}</p></div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-2 lg:p-6">
          <InfoPanel title="Platform bilgileri" icon={<Landmark className="size-4" />} rows={[
            ['Platform', 'VELOX demo ortamı'],
            ['Belge türü', 'Arayüz ve eğitim özeti'],
            ['Durum', 'Demo taslak'],
          ]} />
          <InfoPanel title="Hesap bilgileri" icon={<UserRound className="size-4" />} rows={[
            ['Ad soyad', memberName],
            ['E-posta', memberEmail],
            ['VELOX kullanıcı kodu', veloxId],
          ]} />
        </div>

        <div className="space-y-3 px-4 pb-6 lg:px-6">
          {contract.sections.map((section) => <section key={section.title} className="rounded-lg border border-border bg-elevated/30 p-4"><h3 className="font-semibold text-foreground">{section.title}</h3><p className="mt-2 text-sm leading-6 text-secondary-foreground">{section.body}</p></section>)}
        </div>

        <div className="border-t border-border px-4 py-5 lg:px-6">
          <div className="rounded-lg border border-border bg-elevated/30 p-4">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Demo onay kaydı</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">Bu alan, tasarımda kaşe ve elektronik onay yerleşimini göstermek içindir. Aynı görünüm, “Demo PDF indir” bağlantısındaki kişiye özel PDF çıktısında da yer alır. Gerçek elektronik imza, yetkilendirme veya hukuki onay niteliği taşımaz.</p>
              </div>
              <div className="flex items-end gap-5 self-end sm:self-auto">
                <div className="flex size-[72px] rotate-[-8deg] flex-col items-center justify-center rounded-full border-2 border-dashed border-cyan/70 text-center text-[9px] font-bold leading-3 tracking-[0.12em] text-cyan">
                  <Stamp className="mb-1 size-4" />VELOX<br />DEMO KAŞE
                </div>
                <div className="min-w-40 border-b border-border pb-1 text-right">
                  <p className="flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><PenLine className="size-3" /> Elektronik demo onayı</p>
                  <p className="mt-1 font-serif text-xl italic text-foreground">VELOX Demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-surface/30 px-5 py-4 text-center text-xs text-muted-foreground"><BadgeCheck className="mr-1 inline size-3.5 text-cyan" /> Bu kayıt yalnızca VELOX demo arayüzünde görüntülenir.</div>
      </Panel>
    </div>
  )
}

function InfoPanel({ title, icon, rows }: { title: string; icon: ReactNode; rows: Array<[string, string]> }) {
  return <section className="rounded-lg border border-border bg-card p-4"><h3 className="flex items-center gap-2 font-semibold text-foreground">{icon}{title}</h3><dl className="mt-3 divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="break-all text-right font-medium text-foreground">{value}</dd></div>)}</dl></section>
}
