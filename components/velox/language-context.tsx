'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { pageTranslations, type PageDictionary } from './page-translations'

export type LanguageCode = 'tr' | 'en' | 'ru' | 'uk' | 'es' | 'pt' | 'de' | 'it' | 'fr' | 'kk' | 'bg' | 'id' | 'ar' | 'zh' | 'hu' | 'fa'

const storageKey = 'velox-language'

const english = {
  topArbitrage: 'Arbitrage', topTrading: 'Trading', topAutoWithdraw: 'Auto Withdraw',
  deposit: 'Deposit', withdraw: 'Withdraw', buy: 'Buy', management: 'Management', notifications: 'Notifications',
  settings: 'Settings', signOut: 'Sign out', language: 'Language selection', languageHint: 'Your preference is saved on this device.',
  panel: 'NAVIGATION — PANEL', control: 'NAVIGATION — CONTROL', network: 'NETWORK', account: 'ACCOUNT',
  arbitrage: 'Arbitrage', arbitragePro: 'Arbitrage Pro', pools: 'Arbitrage Pools', trade: 'VELOX Trade', liquidity: 'Liquidity', poolPercent: 'Pool Percentage', contract: 'Contract',
  reports: 'Reports', documents: 'Documents', allContracts: 'All Contracts', myContracts: 'My Contracts', investorStats: 'Investor Statistics', marketingStats: 'Marketing Statistics', career: 'Career Plan', products: 'VELOX Group Products',
  partnerProgram: 'Partner Program', partnerChallenge: 'Partner Challenge', partnerBoost: 'Partner Boost', networkProgram: 'Network Program', ranks: 'Ranks & Qualifications',
  accountSettings: 'Account Settings', faq: 'FAQ', help: 'Help', terminal: 'VELOX — USDT arbitrage terminal',
}

const turkish: typeof english = {
  topArbitrage: 'Arbitraj', topTrading: 'İşlemde', topAutoWithdraw: 'Otomatik Çekim',
  deposit: 'Bakiye Yatır', withdraw: 'Bakiye Çek', buy: 'Satın Al', management: 'Yönetim', notifications: 'Bildirimler',
  settings: 'Ayarlar', signOut: 'Çıkış yap', language: 'Dil seçimi', languageHint: 'Tercihin bu cihazda saklanır.',
  panel: 'NAVİGASYON — PANEL', control: 'NAVİGASYON — KONTROL', network: 'AĞ', account: 'HESAP',
  arbitrage: 'Arbitraj', arbitragePro: 'Arbitraj Pro', pools: 'Arbitraj Havuzları', trade: 'VELOX Trade', liquidity: 'Likidite', poolPercent: 'Havuz Yüzdesi', contract: 'Sözleşme',
  reports: 'Rapor', documents: 'Belgeler', allContracts: 'Tüm Sözleşmeler', myContracts: 'Sözleşmelerim', investorStats: 'Yatırımcı İstatistiği', marketingStats: 'Pazarlama İstatistiği', career: 'Gelişim Planı', products: 'VELOX Grup Ürünleri',
  partnerProgram: 'Partner Programı', partnerChallenge: 'Partner Challenge', partnerBoost: 'Partner Boost', networkProgram: 'Ağ Programı', ranks: 'Rütbeler ve Yeterlilik',
  accountSettings: 'Hesap Ayarları', faq: 'SSS', help: 'Yardım', terminal: 'VELOX — USDT arbitraj terminali',
}

type Dictionary = typeof english
const localized = (translations: Partial<Dictionary>): Dictionary => ({ ...english, ...translations })

const dictionaries: Record<LanguageCode, Dictionary> = {
  tr: turkish,
  en: english,
  ru: localized({
    topArbitrage: 'Арбитраж', topTrading: 'Торговля', topAutoWithdraw: 'Автовывод', deposit: 'Пополнить', buy: 'Купить', management: 'Управление', notifications: 'Уведомления', settings: 'Настройки', signOut: 'Выйти', language: 'Выбор языка', languageHint: 'Выбор сохранён на этом устройстве.',
    panel: 'НАВИГАЦИЯ — ПАНЕЛЬ', control: 'НАВИГАЦИЯ — КОНТРОЛЬ', network: 'СЕТЬ', account: 'АККАУНТ', arbitrage: 'Арбитраж', arbitragePro: 'Арбитраж Pro', pools: 'Пулы арбитража', trade: 'VELOX Trade', liquidity: 'Ликвидность', poolPercent: 'Доля пула', contract: 'Контракт', reports: 'Отчёты', documents: 'Документы', allContracts: 'Все контракты', myContracts: 'Мои контракты', investorStats: 'Статистика инвестора', marketingStats: 'Маркетинговая статистика', career: 'Карьерный план', products: 'Продукты VELOX', partnerProgram: 'Партнёрская программа', partnerChallenge: 'Партнёрский Challenge', partnerBoost: 'Партнёрский Boost', networkProgram: 'Сетевая программа', ranks: 'Ранги и квалификации', accountSettings: 'Настройки аккаунта', faq: 'FAQ', help: 'Помощь', terminal: 'VELOX — терминал USDT-арбитража',
  }),
  uk: localized({
    topArbitrage: 'Арбітраж', topTrading: 'Торгівля', topAutoWithdraw: 'Автовиведення', deposit: 'Поповнити', buy: 'Купити', management: 'Керування', notifications: 'Сповіщення', settings: 'Налаштування', signOut: 'Вийти', language: 'Вибір мови', languageHint: 'Ваш вибір збережено на цьому пристрої.',
    panel: 'НАВІГАЦІЯ — ПАНЕЛЬ', control: 'НАВІГАЦІЯ — КОНТРОЛЬ', network: 'МЕРЕЖА', account: 'ОБЛІКОВИЙ ЗАПИС', arbitrage: 'Арбітраж', arbitragePro: 'Арбітраж Pro', pools: 'Пули арбітражу', trade: 'VELOX Trade', liquidity: 'Ліквідність', poolPercent: 'Відсоток пулу', contract: 'Контракт', reports: 'Звіти', documents: 'Документи', allContracts: 'Усі контракти', myContracts: 'Мої контракти', investorStats: 'Статистика інвестора', marketingStats: 'Маркетингова статистика', career: 'Кар’єрний план', products: 'Продукти VELOX', partnerProgram: 'Партнерська програма', partnerChallenge: 'Партнерський Challenge', partnerBoost: 'Партнерський Boost', networkProgram: 'Мережева програма', ranks: 'Ранги та кваліфікації', accountSettings: 'Налаштування облікового запису', faq: 'FAQ', help: 'Допомога', terminal: 'VELOX — USDT арбітражний термінал',
  }),
  es: localized({
    topArbitrage: 'Arbitraje', topTrading: 'Operando', topAutoWithdraw: 'Retiro automático', deposit: 'Depositar', buy: 'Comprar', management: 'Administración', notifications: 'Notificaciones', settings: 'Configuración', signOut: 'Cerrar sesión', language: 'Selección de idioma', languageHint: 'Tu preferencia se guarda en este dispositivo.',
    panel: 'NAVEGACIÓN — PANEL', control: 'NAVEGACIÓN — CONTROL', network: 'RED', account: 'CUENTA', arbitrage: 'Arbitraje', arbitragePro: 'Arbitraje Pro', pools: 'Pools de arbitraje', trade: 'VELOX Trade', liquidity: 'Liquidez', poolPercent: 'Porcentaje del pool', contract: 'Contrato', reports: 'Informes', documents: 'Documentos', allContracts: 'Todos los contratos', myContracts: 'Mis contratos', investorStats: 'Estadísticas del inversor', marketingStats: 'Estadísticas de marketing', career: 'Plan de carrera', products: 'Productos VELOX', partnerProgram: 'Programa de socios', partnerChallenge: 'Desafío de socios', partnerBoost: 'Impulso de socios', networkProgram: 'Programa de red', ranks: 'Rangos y requisitos', accountSettings: 'Configuración de cuenta', faq: 'Preguntas frecuentes', help: 'Ayuda', terminal: 'VELOX — terminal de arbitraje USDT',
  }),
  pt: localized({
    topArbitrage: 'Arbitragem', topTrading: 'Negociação', topAutoWithdraw: 'Saque automático', deposit: 'Depositar', buy: 'Comprar', management: 'Gestão', notifications: 'Notificações', settings: 'Configurações', signOut: 'Sair', language: 'Seleção de idioma', languageHint: 'Sua preferência é salva neste dispositivo.',
    panel: 'NAVEGAÇÃO — PAINEL', control: 'NAVEGAÇÃO — CONTROLE', network: 'REDE', account: 'CONTA', arbitrage: 'Arbitragem', arbitragePro: 'Arbitragem Pro', pools: 'Pools de arbitragem', trade: 'VELOX Trade', liquidity: 'Liquidez', poolPercent: 'Percentual do pool', contract: 'Contrato', reports: 'Relatórios', documents: 'Documentos', allContracts: 'Todos os contratos', myContracts: 'Meus contratos', investorStats: 'Estatísticas do investidor', marketingStats: 'Estatísticas de marketing', career: 'Plano de carreira', products: 'Produtos VELOX', partnerProgram: 'Programa de parceiros', partnerChallenge: 'Desafio de parceiros', partnerBoost: 'Impulso de parceiros', networkProgram: 'Programa de rede', ranks: 'Níveis e qualificações', accountSettings: 'Configurações da conta', faq: 'Perguntas frequentes', help: 'Ajuda', terminal: 'VELOX — terminal de arbitragem USDT',
  }),
  de: localized({
    topArbitrage: 'Arbitrage', topTrading: 'Handel', topAutoWithdraw: 'Automatische Auszahlung', deposit: 'Einzahlen', buy: 'Kaufen', management: 'Verwaltung', notifications: 'Benachrichtigungen', settings: 'Einstellungen', signOut: 'Abmelden', language: 'Sprachauswahl', languageHint: 'Deine Auswahl wird auf diesem Gerät gespeichert.',
    panel: 'NAVIGATION — PANEL', control: 'NAVIGATION — KONTROLLE', network: 'NETZWERK', account: 'KONTO', arbitrage: 'Arbitrage', arbitragePro: 'Arbitrage Pro', pools: 'Arbitrage-Pools', trade: 'VELOX Trade', liquidity: 'Liquidität', poolPercent: 'Pool-Anteil', contract: 'Vertrag', reports: 'Berichte', documents: 'Dokumente', allContracts: 'Alle Verträge', myContracts: 'Meine Verträge', investorStats: 'Anlegerstatistik', marketingStats: 'Marketingstatistik', career: 'Karriereplan', products: 'VELOX-Produkte', partnerProgram: 'Partnerprogramm', partnerChallenge: 'Partner-Challenge', partnerBoost: 'Partner-Boost', networkProgram: 'Netzwerkprogramm', ranks: 'Ränge & Qualifikationen', accountSettings: 'Kontoeinstellungen', faq: 'FAQ', help: 'Hilfe', terminal: 'VELOX — USDT-Arbitrage-Terminal',
  }),
  it: localized({
    topArbitrage: 'Arbitraggio', topTrading: 'Trading', topAutoWithdraw: 'Prelievo automatico', deposit: 'Deposita', buy: 'Acquista', management: 'Gestione', notifications: 'Notifiche', settings: 'Impostazioni', signOut: 'Esci', language: 'Selezione lingua', languageHint: 'La preferenza è salvata su questo dispositivo.',
    panel: 'NAVIGAZIONE — PANNELLO', control: 'NAVIGAZIONE — CONTROLLO', network: 'RETE', account: 'ACCOUNT', arbitrage: 'Arbitraggio', arbitragePro: 'Arbitraggio Pro', pools: 'Pool di arbitraggio', trade: 'VELOX Trade', liquidity: 'Liquidità', poolPercent: 'Percentuale pool', contract: 'Contratto', reports: 'Report', documents: 'Documenti', allContracts: 'Tutti i contratti', myContracts: 'I miei contratti', investorStats: 'Statistiche investitore', marketingStats: 'Statistiche marketing', career: 'Piano carriera', products: 'Prodotti VELOX', partnerProgram: 'Programma partner', partnerChallenge: 'Sfida partner', partnerBoost: 'Boost partner', networkProgram: 'Programma rete', ranks: 'Livelli e qualifiche', accountSettings: 'Impostazioni account', faq: 'FAQ', help: 'Aiuto', terminal: 'VELOX — terminale arbitraggio USDT',
  }),
  fr: localized({
    topArbitrage: 'Arbitrage', topTrading: 'Trading', topAutoWithdraw: 'Retrait automatique', deposit: 'Déposer', buy: 'Acheter', management: 'Administration', notifications: 'Notifications', settings: 'Paramètres', signOut: 'Déconnexion', language: 'Choix de la langue', languageHint: 'Votre choix est enregistré sur cet appareil.',
    panel: 'NAVIGATION — PANNEAU', control: 'NAVIGATION — CONTRÔLE', network: 'RÉSEAU', account: 'COMPTE', arbitrage: 'Arbitrage', arbitragePro: 'Arbitrage Pro', pools: 'Pools d’arbitrage', trade: 'VELOX Trade', liquidity: 'Liquidité', poolPercent: 'Pourcentage du pool', contract: 'Contrat', reports: 'Rapports', documents: 'Documents', allContracts: 'Tous les contrats', myContracts: 'Mes contrats', investorStats: 'Statistiques investisseur', marketingStats: 'Statistiques marketing', career: 'Plan de carrière', products: 'Produits VELOX', partnerProgram: 'Programme partenaire', partnerChallenge: 'Défi partenaire', partnerBoost: 'Boost partenaire', networkProgram: 'Programme réseau', ranks: 'Rangs et qualifications', accountSettings: 'Paramètres du compte', faq: 'FAQ', help: 'Aide', terminal: 'VELOX — terminal d’arbitrage USDT',
  }),
  kk: localized({
    topArbitrage: 'Арбитраж', topTrading: 'Сауда', topAutoWithdraw: 'Автоматты шығару', deposit: 'Толықтыру', buy: 'Сатып алу', management: 'Басқару', notifications: 'Хабарландырулар', settings: 'Баптаулар', signOut: 'Шығу', language: 'Тілді таңдау', languageHint: 'Таңдауыңыз осы құрылғыда сақталады.',
    panel: 'НАВИГАЦИЯ — ПАНЕЛЬ', control: 'НАВИГАЦИЯ — БАСҚАРУ', network: 'ЖЕЛІ', account: 'ШОТ', arbitrage: 'Арбитраж', arbitragePro: 'Арбитраж Pro', pools: 'Арбитраж пулдары', trade: 'VELOX Trade', liquidity: 'Өтімділік', poolPercent: 'Пул пайызы', contract: 'Келісімшарт', reports: 'Есептер', documents: 'Құжаттар', allContracts: 'Барлық келісімшарттар', myContracts: 'Менің келісімшарттарым', investorStats: 'Инвестор статистикасы', marketingStats: 'Маркетинг статистикасы', career: 'Мансап жоспары', products: 'VELOX өнімдері', partnerProgram: 'Серіктестік бағдарлама', partnerChallenge: 'Серіктес Challenge', partnerBoost: 'Серіктес Boost', networkProgram: 'Желі бағдарламасы', ranks: 'Деңгейлер мен талаптар', accountSettings: 'Шот баптаулары', faq: 'Жиі қойылатын сұрақтар', help: 'Көмек', terminal: 'VELOX — USDT арбитраж терминалы',
  }),
  bg: localized({
    topArbitrage: 'Арбитраж', topTrading: 'Търговия', topAutoWithdraw: 'Автоматично теглене', deposit: 'Депозит', buy: 'Купи', management: 'Управление', notifications: 'Известия', settings: 'Настройки', signOut: 'Изход', language: 'Избор на език', languageHint: 'Предпочитанието се запазва на това устройство.',
    panel: 'НАВИГАЦИЯ — ПАНЕЛ', control: 'НАВИГАЦИЯ — КОНТРОЛ', network: 'МРЕЖА', account: 'СМЕТКА', arbitrage: 'Арбитраж', arbitragePro: 'Арбитраж Pro', pools: 'Арбитражни пулове', trade: 'VELOX Trade', liquidity: 'Ликвидност', poolPercent: 'Процент на пула', contract: 'Договор', reports: 'Отчети', documents: 'Документи', allContracts: 'Всички договори', myContracts: 'Моите договори', investorStats: 'Статистика на инвеститора', marketingStats: 'Маркетингова статистика', career: 'Кариерен план', products: 'Продукти VELOX', partnerProgram: 'Партньорска програма', partnerChallenge: 'Партньорско предизвикателство', partnerBoost: 'Партньорски Boost', networkProgram: 'Мрежова програма', ranks: 'Нива и квалификации', accountSettings: 'Настройки на сметката', faq: 'ЧЗВ', help: 'Помощ', terminal: 'VELOX — USDT арбитражен терминал',
  }),
  id: localized({
    topArbitrage: 'Arbitrase', topTrading: 'Perdagangan', topAutoWithdraw: 'Penarikan otomatis', deposit: 'Setor saldo', buy: 'Beli', management: 'Manajemen', notifications: 'Notifikasi', settings: 'Pengaturan', signOut: 'Keluar', language: 'Pilih bahasa', languageHint: 'Pilihan Anda disimpan di perangkat ini.',
    panel: 'NAVIGASI — PANEL', control: 'NAVIGASI — KONTROL', network: 'JARINGAN', account: 'AKUN', arbitrage: 'Arbitrase', arbitragePro: 'Arbitrase Pro', pools: 'Pool arbitrase', trade: 'VELOX Trade', liquidity: 'Likuiditas', poolPercent: 'Persentase pool', contract: 'Kontrak', reports: 'Laporan', documents: 'Dokumen', allContracts: 'Semua kontrak', myContracts: 'Kontrak saya', investorStats: 'Statistik investor', marketingStats: 'Statistik pemasaran', career: 'Rencana karier', products: 'Produk VELOX', partnerProgram: 'Program mitra', partnerChallenge: 'Tantangan mitra', partnerBoost: 'Dorongan mitra', networkProgram: 'Program jaringan', ranks: 'Peringkat & kualifikasi', accountSettings: 'Pengaturan akun', faq: 'FAQ', help: 'Bantuan', terminal: 'VELOX — terminal arbitrase USDT',
  }),
  ar: localized({
    topArbitrage: 'المراجحة', topTrading: 'التداول', topAutoWithdraw: 'سحب تلقائي', deposit: 'إيداع رصيد', buy: 'شراء', management: 'الإدارة', notifications: 'الإشعارات', settings: 'الإعدادات', signOut: 'تسجيل الخروج', language: 'اختيار اللغة', languageHint: 'يتم حفظ اختيارك على هذا الجهاز.',
    panel: 'التنقل — اللوحة', control: 'التنقل — التحكم', network: 'الشبكة', account: 'الحساب', arbitrage: 'المراجحة', arbitragePro: 'المراجحة Pro', pools: 'مجمعات المراجحة', trade: 'VELOX Trade', liquidity: 'السيولة', poolPercent: 'نسبة المجمع', contract: 'العقد', reports: 'التقارير', documents: 'المستندات', allContracts: 'كل العقود', myContracts: 'عقودي', investorStats: 'إحصاءات المستثمر', marketingStats: 'إحصاءات التسويق', career: 'خطة المسار', products: 'منتجات VELOX', partnerProgram: 'برنامج الشركاء', partnerChallenge: 'تحدي الشركاء', partnerBoost: 'تعزيز الشركاء', networkProgram: 'برنامج الشبكة', ranks: 'الرتب والمؤهلات', accountSettings: 'إعدادات الحساب', faq: 'الأسئلة الشائعة', help: 'المساعدة', terminal: 'VELOX — منصة مراجحة USDT',
  }),
  zh: localized({
    topArbitrage: '套利', topTrading: '交易中', topAutoWithdraw: '自动提现', deposit: '充值', buy: '购买', management: '管理', notifications: '通知', settings: '设置', signOut: '退出登录', language: '语言选择', languageHint: '您的偏好会保存在此设备上。',
    panel: '导航 — 面板', control: '导航 — 控制', network: '网络', account: '账户', arbitrage: '套利', arbitragePro: '套利 Pro', pools: '套利池', trade: 'VELOX Trade', liquidity: '流动性', poolPercent: '资金池比例', contract: '合约', reports: '报告', documents: '文件', allContracts: '所有合约', myContracts: '我的合约', investorStats: '投资者统计', marketingStats: '营销统计', career: '职业发展计划', products: 'VELOX 产品', partnerProgram: '合作伙伴计划', partnerChallenge: '合作伙伴挑战', partnerBoost: '合作伙伴加速', networkProgram: '网络计划', ranks: '等级与资格', accountSettings: '账户设置', faq: '常见问题', help: '帮助', terminal: 'VELOX — USDT 套利终端',
  }),
  hu: localized({
    topArbitrage: 'Arbitrázs', topTrading: 'Kereskedés', topAutoWithdraw: 'Automatikus kifizetés', deposit: 'Befizetés', buy: 'Vásárlás', management: 'Kezelés', notifications: 'Értesítések', settings: 'Beállítások', signOut: 'Kijelentkezés', language: 'Nyelvválasztás', languageHint: 'A választás ezen az eszközön marad mentve.',
    panel: 'NAVIGÁCIÓ — PANEL', control: 'NAVIGÁCIÓ — VEZÉRLÉS', network: 'HÁLÓZAT', account: 'FIÓK', arbitrage: 'Arbitrázs', arbitragePro: 'Arbitrázs Pro', pools: 'Arbitrázspoolok', trade: 'VELOX Trade', liquidity: 'Likviditás', poolPercent: 'Pool százalék', contract: 'Szerződés', reports: 'Jelentések', documents: 'Dokumentumok', allContracts: 'Összes szerződés', myContracts: 'Szerződéseim', investorStats: 'Befektetői statisztika', marketingStats: 'Marketingstatisztika', career: 'Karrierterv', products: 'VELOX termékek', partnerProgram: 'Partnerprogram', partnerChallenge: 'Partner kihívás', partnerBoost: 'Partner Boost', networkProgram: 'Hálózati program', ranks: 'Rangok és minősítések', accountSettings: 'Fiókbeállítások', faq: 'GYIK', help: 'Súgó', terminal: 'VELOX — USDT arbitrázs terminál',
  }),
  fa: localized({
    topArbitrage: 'آربیتراژ', topTrading: 'معامله', topAutoWithdraw: 'برداشت خودکار', deposit: 'واریز موجودی', buy: 'خرید', management: 'مدیریت', notifications: 'اعلان‌ها', settings: 'تنظیمات', signOut: 'خروج', language: 'انتخاب زبان', languageHint: 'انتخاب شما در این دستگاه ذخیره می‌شود.',
    panel: 'ناوبری — پنل', control: 'ناوبری — کنترل', network: 'شبکه', account: 'حساب', arbitrage: 'آربیتراژ', arbitragePro: 'آربیتراژ Pro', pools: 'استخرهای آربیتراژ', trade: 'VELOX Trade', liquidity: 'نقدینگی', poolPercent: 'درصد استخر', contract: 'قرارداد', reports: 'گزارش‌ها', documents: 'اسناد', allContracts: 'همه قراردادها', myContracts: 'قراردادهای من', investorStats: 'آمار سرمایه‌گذار', marketingStats: 'آمار بازاریابی', career: 'برنامه مسیر', products: 'محصولات VELOX', partnerProgram: 'برنامه شریک', partnerChallenge: 'چالش شریک', partnerBoost: 'تقویت شریک', networkProgram: 'برنامه شبکه', ranks: 'رتبه‌ها و شرایط', accountSettings: 'تنظیمات حساب', faq: 'پرسش‌های متداول', help: 'راهنما', terminal: 'VELOX — پایانه آربیتراژ USDT',
  }),
}

type LanguageContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: Dictionary & PageDictionary
  locale: string
  direction: 'ltr' | 'rtl'
}

const locales: Record<LanguageCode, string> = {
  tr: 'tr-TR', en: 'en-US', ru: 'ru-RU', uk: 'uk-UA', es: 'es-ES', pt: 'pt-PT', de: 'de-DE', it: 'it-IT',
  fr: 'fr-FR', kk: 'kk-KZ', bg: 'bg-BG', id: 'id-ID', ar: 'ar-SA', zh: 'zh-CN', hu: 'hu-HU', fa: 'fa-IR',
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is the product default. A returning visitor's explicit choice is
  // restored from localStorage as soon as the provider mounts.
  const [language, setLanguageState] = useState<LanguageCode>('en')

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as LanguageCode | null
    applyLanguage(saved && dictionaries[saved] ? saved : 'en')
  }, [])

  function applyLanguage(nextLanguage: LanguageCode) {
    setLanguageState(nextLanguage)
    window.localStorage.setItem(storageKey, nextLanguage)
    document.cookie = `${storageKey}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`
    document.documentElement.lang = nextLanguage
    document.documentElement.dir = nextLanguage === 'ar' || nextLanguage === 'fa' ? 'rtl' : 'ltr'
  }

  const value = useMemo(() => ({
    language,
    setLanguage: applyLanguage,
    t: { ...dictionaries[language], ...pageTranslations[language] },
    locale: locales[language],
    direction: language === 'ar' || language === 'fa' ? 'rtl' as const : 'ltr' as const,
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
