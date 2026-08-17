'use client'

import { Check, ChevronDown, Languages } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { type LanguageCode, useLanguage } from './language-context'

type Language = {
  code: string
  nativeName: string
  englishName: string
  direction?: 'rtl'
}

const languages: Language[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'kk', nativeName: 'Қазақша', englishName: 'Kazakh' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', direction: 'rtl' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese' },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian' },
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', direction: 'rtl' },
]

export function LanguageSwitcher() {
  const { language: selectedCode, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = languages.find((language) => language.code === selectedCode) ?? languages[9]

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function chooseLanguage(language: Language) {
    setLanguage(language.code as LanguageCode)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t.language}
        className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-elevated"
      >
        <Languages className="size-3.5 text-cyan" />
        {selected.code.toUpperCase()}
        <ChevronDown className={cn('size-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-2xl shadow-black/60">
          <div className="px-2 pb-2 pt-1">
            <p className="text-sm font-semibold text-foreground">{t.language}</p>
            <p className="text-xs text-muted-foreground">{t.languageHint}</p>
          </div>
          <div role="listbox" aria-label="Diller" className="max-h-[min(70vh,480px)] space-y-1 overflow-y-auto pr-1">
            {languages.map((language) => {
              const active = language.code === selectedCode
              return (
                <button
                  key={language.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => chooseLanguage(language)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'border-cyan/50 bg-cyan/10 text-cyan'
                      : 'border-border bg-card text-foreground hover:border-cyan/30 hover:bg-elevated',
                  )}
                >
                  <span className="min-w-0">
                    <span dir={language.direction} className="block text-sm font-semibold">{language.nativeName}</span>
                    <span className="block text-xs text-muted-foreground">{language.englishName}</span>
                  </span>
                  {active && <Check className="size-4 shrink-0 text-cyan" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
