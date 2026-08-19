'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { type LanguageCode, useLanguage } from './language-context'
import { translateLegacyText } from './legacy-content-translations'
import { priorityScreenTranslationRows, translationLanguageOrder, type TranslationRow } from './priority-screen-translations'

const targetLanguages = translationLanguageOrder
type TargetLanguage = (typeof targetLanguages)[number]

type Row = TranslationRow

// Shared UI vocabulary used by the older VELOX screens. New screens should
// prefer useLanguage(), but this bridge keeps every existing screen connected
// to the same language selection without duplicating page-local state.
const rows: Row[] = [
  ...priorityScreenTranslationRows,
  ['Cüzdan İşlemleri','Wallet Operations','Операции кошелька','Операції гаманця','Operaciones de billetera','Operações da carteira','Wallet-Vorgänge','Operazioni portafoglio','Opérations du portefeuille','Әмиян операциялары','Операции с портфейла','Operasi dompet','عمليات المحفظة','钱包操作','Tárcaműveletek','عملیات کیف پول'],
  ['Ticaret bakiyesi','Trading balance','Торговый баланс','Торговий баланс','Saldo de trading','Saldo de negociação','Handelsguthaben','Saldo di trading','Solde de trading','Сауда балансы','Търговски баланс','Saldo perdagangan','رصيد التداول','交易余额','Kereskedési egyenleg','موجودی معامله'],
  ['Gelir bakiyesi (çekilebilir)','Income balance (withdrawable)','Доходный баланс (доступен)','Баланс доходу (доступний)','Saldo de ingresos (retirable)','Saldo de renda (sacável)','Einkommensguthaben (auszahlbar)','Saldo redditi (prelevabile)','Solde de revenus (retirable)','Кіріс балансы (шығаруға болады)','Доходен баланс (за теглене)','Saldo pendapatan (dapat ditarik)','رصيد الدخل (قابل للسحب)','收益余额（可提现）','Jövedelemegyenleg (kivehető)','موجودی درآمد (قابل برداشت)'],
  ['USDT Yatırma Adresi','USDT Deposit Address','Адрес пополнения USDT','Адреса депозиту USDT','Dirección de depósito USDT','Endereço de depósito USDT','USDT-Einzahlungsadresse','Indirizzo di deposito USDT','Adresse de dépôt USDT','USDT салым мекенжайы','Адрес за депозит USDT','Alamat deposit USDT','عنوان إيداع USDT','USDT 充值地址','USDT befizetési cím','آدرس واریز USDT'],
  ['Yatırım talimatı','Investment instruction','Инструкция по инвестиции','Інструкція інвестиції','Instrucción de inversión','Instrução de investimento','Investitionsanweisung','Istruzione di investimento','Instruction d’investissement','Инвестиция нұсқауы','Инвестиционна инструкция','Instruksi investasi','تعليمات الاستثمار','投资指令','Befektetési utasítás','دستور سرمایه‌گذاری'],
  ['Yatırım talimatı oluştur','Create investment instruction','Создать инструкцию','Створити інструкцію','Crear instrucción','Criar instrução','Anweisung erstellen','Crea istruzione','Créer l’instruction','Нұсқау жасау','Създай инструкция','Buat instruksi','إنشاء تعليمات','创建投资指令','Utasítás létrehozása','ایجاد دستور'],
  ['Yatırım belgelerim','My investment documents','Мои инвестиционные документы','Мої інвестиційні документи','Mis documentos de inversión','Meus documentos de investimento','Meine Investitionsdokumente','I miei documenti di investimento','Mes documents d’investissement','Менің инвестициялық құжаттарым','Моите инвестиционни документи','Dokumen investasi saya','مستندات استثماري','我的投资文件','Befektetési dokumentumaim','اسناد سرمایه‌گذاری من'],
  ['Çekim Talebi','Withdrawal Request','Запрос на вывод','Запит на виведення','Solicitud de retiro','Solicitação de saque','Auszahlungsantrag','Richiesta di prelievo','Demande de retrait','Шығару сұрауы','Заявка за теглене','Permintaan penarikan','طلب سحب','提现申请','Kifizetési kérelem','درخواست برداشت'],
  ['Talep özeti','Request summary','Сводка запроса','Підсумок запиту','Resumen de solicitud','Resumo da solicitação','Antragsübersicht','Riepilogo richiesta','Résumé de la demande','Сұрау қорытындысы','Обобщение на заявката','Ringkasan permintaan','ملخص الطلب','申请摘要','Kérelem összegzése','خلاصه درخواست'],
  ['Otomatik Çekim Kuralı','Automatic Withdrawal Rule','Правило автовывода','Правило автовиведення','Regla de retiro automático','Regra de saque automático','Regel für automatische Auszahlung','Regola di prelievo automatico','Règle de retrait automatique','Автоматты шығару ережесі','Правило за автоматично теглене','Aturan penarikan otomatis','قاعدة السحب التلقائي','自动提现规则','Automatikus kifizetési szabály','قانون برداشت خودکار'],
  ['Kuralı kaydet','Save rule','Сохранить правило','Зберегти правило','Guardar regla','Salvar regra','Regel speichern','Salva regola','Enregistrer la règle','Ережені сақтау','Запази правилото','Simpan aturan','حفظ القاعدة','保存规则','Szabály mentése','ذخیره قانون'],
  ['İşlem geçmişi','Transaction history','История операций','Історія операцій','Historial de operaciones','Histórico de transações','Transaktionsverlauf','Cronologia operazioni','Historique des opérations','Операциялар тарихы','История на операциите','Riwayat transaksi','سجل المعاملات','交易历史','Tranzakciós előzmények','تاریخچه تراکنش‌ها'],
  ['Ticaret bakiyesi / Arbitraj','Trading balance / Arbitrage','Торговый баланс / Арбитраж','Торговий баланс / Арбітраж','Saldo de trading / Arbitraje','Saldo de negociação / Arbitragem','Handelsguthaben / Arbitrage','Saldo di trading / Arbitraggio','Solde de trading / Arbitrage','Сауда балансы / Арбитраж','Търговски баланс / Арбитраж','Saldo perdagangan / Arbitrase','رصيد التداول / المراجحة','交易余额 / 套利','Kereskedési egyenleg / Arbitrázs','موجودی معامله / آربیتراژ'],
  ['Gelir bakiyesi','Income balance','Доходный баланс','Баланс доходу','Saldo de ingresos','Saldo de renda','Einkommensguthaben','Saldo redditi','Solde de revenus','Кіріс балансы','Доходен баланс','Saldo pendapatan','رصيد الدخل','收益余额','Jövedelemegyenleg','موجودی درآمد'],
  ['Faturalar','Invoices','Счета','Рахунки','Facturas','Faturas','Rechnungen','Fatture','Factures','Шоттар','Фактури','Faktur','الفواتير','发票','Számlák','فاکتورها'],
  ['Bilgi','Information','Информация','Інформація','Información','Informação','Information','Informazioni','Informations','Ақпарат','Информация','Informasi','معلومات','信息','Információ','اطلاعات'],
  ['Aşama bitişine:','Stage ends in:','До конца этапа:','До завершення етапу:','Fin de la etapa en:','A etapa termina em:','Phase endet in:','Fine fase tra:','Fin de l’étape dans :','Кезең аяқталуына:','До края на етапа:','Tahap berakhir dalam:','تنتهي المرحلة خلال:','阶段结束倒计时：','A szakasz vége:','پایان مرحله تا:'],
  ['Hesaplanıyor...','Calculating...','Вычисляется...','Обчислення...','Calculando...','Calculando...','Wird berechnet...','Calcolo...','Calcul en cours...','Есептелуде...','Изчислява се...','Menghitung...','جارٍ الحساب...','计算中...','Számítás...','در حال محاسبه...'],
  ['Canlı simülasyon','Live simulation','Симуляция в реальном времени','Симуляція в реальному часі','Simulación en vivo','Simulação ao vivo','Live-Simulation','Simulazione live','Simulation en direct','Тікелей симуляция','Симулация на живо','Simulasi langsung','محاكاة مباشرة','实时模拟','Élő szimuláció','شبیه‌سازی زنده'],
  ['Güncelleme','Update','Обновление','Оновлення','Actualización','Atualização','Aktualisierung','Aggiornamento','Mise à jour','Жаңарту','Актуализация','Pembaruan','تحديث','更新','Frissítés','به‌روزرسانی'],
  ['Satın Al','Buy','Купить','Купити','Comprar','Comprar','Kaufen','Acquista','Acheter','Сатып алу','Купи','Beli','شراء','买入','Vásárlás','خرید'],
  ['Satın al','Buy','Купить','Купити','Comprar','Comprar','Kaufen','Acquista','Acheter','Сатып алу','Купи','Beli','شراء','买入','Vásárlás','خرید'],
  ['Sat','Sell','Продать','Продати','Vender','Vender','Verkaufen','Vendi','Vendre','Сату','Продай','Jual','بيع','卖出','Eladás','فروش'],
  ['Varlığım','My asset','Мой актив','Мій актив','Mi activo','Meu ativo','Mein Vermögen','Il mio asset','Mon actif','Менің активім','Моят актив','Aset saya','أصلي','我的资产','Saját eszközöm','دارایی من'],
  ['Toplam havuz','Total pool','Общий пул','Загальний пул','Pool total','Pool total','Gesamtpool','Pool totale','Pool total','Жалпы пул','Общ пул','Total pool','إجمالي المجمع','资金池总额','Teljes pool','کل استخر'],
  ['Canlı yayın (VELOX)','Live feed (VELOX)','Прямая трансляция (VELOX)','Пряма трансляція (VELOX)','Transmisión en vivo (VELOX)','Transmissão ao vivo (VELOX)','Live-Übertragung (VELOX)','Trasmissione in diretta (VELOX)','Flux en direct (VELOX)','Тікелей эфир (VELOX)','Предаване на живо (VELOX)','Siaran langsung (VELOX)','بث مباشر (VELOX)','实时行情 (VELOX)','Élő közvetítés (VELOX)','پخش زنده (VELOX)'],
  ['Görüntüle →','View →','Открыть →','Відкрити →','Ver →','Ver →','Anzeigen →','Visualizza →','Afficher →','Көру →','Преглед →','Lihat →','عرض →','查看 →','Megtekintés →','مشاهده →'],
  ['Görüntüle','View','Открыть','Відкрити','Ver','Ver','Anzeigen','Visualizza','Afficher','Көру','Преглед','Lihat','عرض','查看','Megtekintés','مشاهده'],
  ['Best Offer','Best Offer','Лучшее предложение','Найкраща пропозиція','Mejor oferta','Melhor oferta','Bestes Angebot','Migliore offerta','Meilleure offre','Үздік ұсыныс','Най-добра оферта','Penawaran terbaik','أفضل عرض','最佳报价','Legjobb ajánlat','بهترین پیشنهاد'],
  ['ETH ALIŞ FİYATI','ETH BUY PRICE','ЦЕНА ПОКУПКИ ETH','ЦІНА КУПІВЛІ ETH','PRECIO DE COMPRA ETH','PREÇO DE COMPRA ETH','ETH-KAUFPREIS','PREZZO DI ACQUISTO ETH','PRIX D’ACHAT ETH','ETH САТЫП АЛУ БАҒАСЫ','ЦЕНА ЗА ПОКУПКА ETH','HARGA BELI ETH','سعر شراء ETH','ETH 买入价','ETH VÉTELI ÁR','قیمت خرید ETH'],
  ['ETH SATIŞ FİYATI','ETH SELL PRICE','ЦЕНА ПРОДАЖИ ETH','ЦІНА ПРОДАЖУ ETH','PRECIO DE VENTA ETH','PREÇO DE VENDA ETH','ETH-VERKAUFSPREIS','PREZZO DI VENDITA ETH','PRIX DE VENTE ETH','ETH САТУ БАҒАСЫ','ЦЕНА ЗА ПРОДАЖБА ETH','HARGA JUAL ETH','سعر بيع ETH','ETH 卖出价','ETH ELADÁSI ÁR','قیمت فروش ETH'],
  ['ETH HACMİ','ETH VOLUME','ОБЪЁМ ETH','ОБСЯГ ETH','VOLUMEN ETH','VOLUME ETH','ETH-VOLUMEN','VOLUME ETH','VOLUME ETH','ETH КӨЛЕМІ','ОБЕМ ETH','VOLUME ETH','حجم ETH','ETH 交易量','ETH VOLUMEN','حجم ETH'],
  ['Aktif İşlem','Active transaction','Активная операция','Активна операція','Operación activa','Operação ativa','Aktive Transaktion','Operazione attiva','Transaction active','Белсенді операция','Активна операция','Transaksi aktif','معاملة نشطة','活跃交易','Aktív tranzakció','تراکنش فعال'],
  ['Simülasyonda eşleştiriliyor','Matching in simulation','Сопоставление в симуляции','Зіставлення в симуляції','Emparejando en la simulación','Correspondência na simulação','Abgleich in der Simulation','Abbinamento nella simulazione','Appariement dans la simulation','Симуляцияда сәйкестендірілуде','Съпоставяне в симулацията','Dicocokkan dalam simulasi','تتم المطابقة في المحاكاة','模拟中匹配','Párosítás a szimulációban','تطبیق در شبیه‌سازی'],
  ['Toplam hacim ETH','Total ETH volume','Общий объём ETH','Загальний обсяг ETH','Volumen total de ETH','Volume total de ETH','Gesamtes ETH-Volumen','Volume ETH totale','Volume ETH total','Жалпы ETH көлемі','Общ обем ETH','Total volume ETH','إجمالي حجم ETH','ETH 总交易量','Teljes ETH-volumen','حجم کل ETH'],
  ['Teklif bekleniyor...','Waiting for offer...','Ожидание предложения...','Очікування пропозиції...','Esperando oferta...','Aguardando oferta...','Angebot wird erwartet...','In attesa di offerta...','En attente d’une offre...','Ұсыныс күтілуде...','Изчаква се оферта...','Menunggu penawaran...','بانتظار العرض...','等待报价...','Ajánlatra vár...','در انتظار پیشنهاد...'],
  ['Tahakkuklar','Accruals','Начисления','Нарахування','Devengos','Provisões','Gutschriften','Ratei','Cumuls','Есептеулер','Начисления','Akrual','المستحقات','应计','Elhatárolások','مطالبات'],
  ['Operasyonlar','Operations','Операции','Операції','Operaciones','Operações','Vorgänge','Operazioni','Opérations','Операциялар','Операции','Operasi','العمليات','操作','Műveletek','عملیات'],
  ['Tarih/Saat','Date/Time','Дата/Время','Дата/Час','Fecha/Hora','Data/Hora','Datum/Uhrzeit','Data/Ora','Date/Heure','Күн/Уақыт','Дата/Час','Tanggal/Waktu','التاريخ/الوقت','日期/时间','Dátum/Idő','تاریخ/زمان'],
  ['Toplam Spread','Total Spread','Общий спред','Загальний спред','Spread total','Spread total','Gesamt-Spread','Spread totale','Spread total','Жалпы спред','Общ спред','Total spread','إجمالي الفارق','总点差','Teljes spread','اسپرد کل'],
  ['Net Spread','Net Spread','Чистый спред','Чистий спред','Spread neto','Spread líquido','Netto-Spread','Spread netto','Spread net','Таза спред','Нетен спред','Spread bersih','صافي الفارق','净点差','Nettó spread','اسپرد خالص'],
  ['piyasa demosunu aç','open market demo','открыть демо рынка','відкрити демо ринку','abrir demo del mercado','abrir demo de mercado','Marktdemo öffnen','apri la demo di mercato','ouvrir la démo du marché','нарық демосын ашу','отвори демо на пазара','buka demo pasar','فتح عرض السوق التجريبي','打开市场演示','piaci demó megnyitása','باز کردن دموی بازار'],
  ['Canlı piyasa simülasyonu','Live market simulation','Симуляция рынка в реальном времени','Симуляція ринку в реальному часі','Simulación del mercado en vivo','Simulação de mercado ao vivo','Live-Marktsimulation','Simulazione del mercato live','Simulation du marché en direct','Нарықтың тікелей симуляциясы','Пазарна симулация на живо','Simulasi pasar langsung','محاكاة السوق المباشرة','实时市场模拟','Élő piaci szimuláció','شبیه‌سازی زنده بازار'],
  ['Sözleşmeler ve Faturalar','Contracts and Invoices','Контракты и счета','Контракти та рахунки','Contratos y facturas','Contratos e faturas','Verträge und Rechnungen','Contratti e fatture','Contrats et factures','Келісімшарттар мен шоттар','Договори и фактури','Kontrak dan faktur','العقود والفواتير','合同与发票','Szerződések és számlák','قراردادها و فاکتورها'],
  ['Sözleşmelerim','My Contracts','Мои контракты','Мої контракти','Mis contratos','Meus contratos','Meine Verträge','I miei contratti','Mes contrats','Менің келісімшарттарым','Моите договори','Kontrak saya','عقودي','我的合同','Szerződéseim','قراردادهای من'],
  ['Sözleşme listesi','Contract list','Список контрактов','Список контрактів','Lista de contratos','Lista de contratos','Vertragsliste','Elenco contratti','Liste des contrats','Келісімшарттар тізімі','Списък с договори','Daftar kontrak','قائمة العقود','合同列表','Szerződéslista','فهرست قراردادها'],
  ['Sözleşme detayı','Contract details','Детали контракта','Деталі контракту','Detalles del contrato','Detalhes do contrato','Vertragsdetails','Dettagli contratto','Détails du contrat','Келісімшарт мәліметі','Детайли за договора','Detail kontrak','تفاصيل العقد','合同详情','Szerződés részletei','جزئیات قرارداد'],
  ['Likidite sağlayıcısı','Liquidity provider','Поставщик ликвидности','Постачальник ліквідності','Proveedor de liquidez','Provedor de liquidez','Liquiditätsanbieter','Fornitore di liquidità','Fournisseur de liquidité','Өтімділік провайдері','Доставчик на ликвидност','Penyedia likuiditas','مزود السيولة','流动性提供方','Likviditásszolgáltató','تأمین‌کننده نقدینگی'],
  ['Borsa bağlantısı','Exchange connection','Подключение к бирже','Підключення до біржі','Conexión con exchange','Conexão com exchange','Börsenverbindung','Connessione exchange','Connexion à la bourse','Биржа байланысы','Връзка с борса','Koneksi bursa','اتصال المنصة','交易所连接','Tőzsdei kapcsolat','اتصال صرافی'],
  ['Gösterilen kapasite','Displayed capacity','Показанная ёмкость','Показана місткість','Capacidad mostrada','Capacidade exibida','Angezeigte Kapazität','Capacità visualizzata','Capacité affichée','Көрсетілген сыйымдылық','Показан капацитет','Kapasitas ditampilkan','السعة المعروضة','显示容量','Megjelenített kapacitás','ظرفیت نمایش‌داده‌شده'],
  ['Kapsanan bölge','Covered region','Охваченный регион','Охоплений регіон','Región cubierta','Região coberta','Abgedeckte Region','Regione coperta','Région couverte','Қамтылған аймақ','Обхванат регион','Wilayah tercakup','المنطقة المغطاة','覆盖区域','Lefedett régió','منطقه تحت پوشش'],
  ['Yatırımcı İstatistikleri','Investor Statistics','Статистика инвестора','Статистика інвестора','Estadísticas del inversor','Estatísticas do investidor','Anlegerstatistik','Statistiche investitore','Statistiques investisseur','Инвестор статистикасы','Статистика на инвеститора','Statistik investor','إحصاءات المستثمر','投资者统计','Befektetői statisztikák','آمار سرمایه‌گذار'],
  ['Kariyer Gelişim Planı','Career Development Plan','План развития карьеры','План розвитку кар’єри','Plan de desarrollo profesional','Plano de desenvolvimento de carreira','Karriereentwicklungsplan','Piano di sviluppo carriera','Plan de développement de carrière','Мансапты дамыту жоспары','План за кариерно развитие','Rencana pengembangan karier','خطة التطور المهني','职业发展计划','Karrierfejlesztési terv','برنامه توسعه مسیر شغلی'],
  ['Kariyer ilerlemesi','Career progress','Карьерный прогресс','Кар’єрний прогрес','Progreso profesional','Progresso de carreira','Karrierefortschritt','Progresso carriera','Progression de carrière','Мансап ілгерілеуі','Кариерен напредък','Kemajuan karier','تقدم المسار','职业进度','Karrierelőrehaladás','پیشرفت شغلی'],
  ['Sponsor ağ gezgini','Sponsor network explorer','Обзор спонсорской сети','Огляд спонсорської мережі','Explorador de red de patrocinio','Explorador da rede de patrocinadores','Sponsor-Netzwerkübersicht','Esplora rete sponsor','Explorateur du réseau sponsor','Демеуші желісін шолу','Преглед на спонсорската мрежа','Penjelajah jaringan sponsor','مستكشف شبكة الراعي','推荐网络浏览器','Szponzorhálózat-böngésző','مرورگر شبکه حامی'],
  ['Rapor çıktıları','Report exports','Экспорт отчётов','Експорт звітів','Exportaciones de informes','Exportações de relatórios','Berichtsexporte','Esportazioni report','Exports de rapports','Есеп экспорттары','Експорт на отчети','Ekspor laporan','تصدير التقارير','报告导出','Jelentésexportok','خروجی گزارش‌ها'],
  ['PDF indir','Download PDF','Скачать PDF','Завантажити PDF','Descargar PDF','Baixar PDF','PDF herunterladen','Scarica PDF','Télécharger le PDF','PDF жүктеу','Изтегли PDF','Unduh PDF','تنزيل PDF','下载 PDF','PDF letöltése','دانلود PDF'],
  ['Excel indir','Download Excel','Скачать Excel','Завантажити Excel','Descargar Excel','Baixar Excel','Excel herunterladen','Scarica Excel','Télécharger Excel','Excel жүктеу','Изтегли Excel','Unduh Excel','تنزيل Excel','下载 Excel','Excel letöltése','دانلود Excel'],
  ['Henüz veri yok','No data yet','Данных пока нет','Даних поки немає','Aún no hay datos','Ainda não há dados','Noch keine Daten','Nessun dato','Aucune donnée','Әзірге дерек жоқ','Все още няма данни','Belum ada data','لا توجد بيانات بعد','暂无数据','Még nincs adat','هنوز داده‌ای نیست'],
  ['Gerçek ödeme yok','No real payments','Нет реальных выплат','Немає реальних виплат','Sin pagos reales','Sem pagamentos reais','Keine echten Zahlungen','Nessun pagamento reale','Aucun paiement réel','Нақты төлем жоқ','Няма реални плащания','Tidak ada pembayaran nyata','لا مدفوعات حقيقية','无真实付款','Nincs valódi kifizetés','بدون پرداخت واقعی'],
  ['Tamamlandı','Completed','Завершено','Завершено','Completado','Concluído','Abgeschlossen','Completato','Terminé','Аяқталды','Завършено','Selesai','مكتمل','已完成','Befejezve','تکمیل شد'],
  ['Bekliyor','Pending','Ожидает','Очікує','Pendiente','Pendente','Ausstehend','In attesa','En attente','Күтуде','Изчаква','Menunggu','قيد الانتظار','等待中','Függőben','در انتظار'],
  ['Aktif','Active','Активно','Активно','Activo','Ativo','Aktiv','Attivo','Actif','Белсенді','Активно','Aktif','نشط','活跃','Aktív','فعال'],
  ['Duraklatıldı','Paused','Приостановлено','Призупинено','Pausado','Pausado','Pausiert','In pausa','En pause','Кідіртілді','На пауза','Dijeda','متوقف مؤقتاً','已暂停','Szüneteltetve','متوقف'],
  ['İptal','Cancelled','Отменено','Скасовано','Cancelado','Cancelado','Storniert','Annullato','Annulé','Бас тартылды','Отказано','Dibatalkan','ملغي','已取消','Törölve','لغو شد'],
  ['İşlemler','Transactions','Операции','Операції','Operaciones','Transações','Transaktionen','Operazioni','Opérations','Операциялар','Операции','Transaksi','المعاملات','交易','Tranzakciók','تراکنش‌ها'],
  ['Alış Fiyatı','Buy Price','Цена покупки','Ціна купівлі','Precio de compra','Preço de compra','Kaufpreis','Prezzo di acquisto','Prix d’achat','Сатып алу бағасы','Цена купува','Harga beli','سعر الشراء','买入价','Vételi ár','قیمت خرید'],
  ['Satış Fiyatı','Sell Price','Цена продажи','Ціна продажу','Precio de venta','Preço de venda','Verkaufspreis','Prezzo di vendita','Prix de vente','Сату бағасы','Цена продава','Harga jual','سعر البيع','卖出价','Eladási ár','قیمت فروش'],
  ['Toplam yatırım','Total investment','Общие инвестиции','Загальні інвестиції','Inversión total','Investimento total','Gesamtinvestition','Investimento totale','Investissement total','Жалпы инвестиция','Обща инвестиция','Total investasi','إجمالي الاستثمار','总投资','Teljes befektetés','کل سرمایه‌گذاری'],
  ['Toplam kazanç','Total earnings','Общий доход','Загальний дохід','Ganancias totales','Ganhos totais','Gesamtertrag','Guadagni totali','Gains totaux','Жалпы табыс','Обща печалба','Total pendapatan','إجمالي الأرباح','总收益','Teljes bevétel','کل درآمد'],
  ['Toplam ağ','Total network','Вся сеть','Уся мережа','Red total','Rede total','Gesamtes Netzwerk','Rete totale','Réseau total','Жалпы желі','Цялата мрежа','Total jaringan','إجمالي الشبكة','总网络','Teljes hálózat','کل شبکه'],
  ['Ağ büyümesi','Network growth','Рост сети','Зростання мережі','Crecimiento de red','Crescimento da rede','Netzwerkwachstum','Crescita rete','Croissance du réseau','Желі өсімі','Ръст на мрежата','Pertumbuhan jaringan','نمو الشبكة','网络增长','Hálózatnövekedés','رشد شبکه'],
  ['Komisyon oranı','Commission rate','Ставка комиссии','Ставка комісії','Tasa de comisión','Taxa de comissão','Provisionssatz','Tasso commissione','Taux de commission','Комиссия мөлшерлемесі','Комисионен процент','Tingkat komisi','نسبة العمولة','佣金率','Jutalékráta','نرخ کمیسیون'],
  ['Kalan süre','Time remaining','Осталось времени','Залишилось часу','Tiempo restante','Tempo restante','Verbleibende Zeit','Tempo rimanente','Temps restant','Қалған уақыт','Оставащо време','Waktu tersisa','الوقت المتبقي','剩余时间','Hátralévő idő','زمان باقی‌مانده'],
  ['İlerleme','Progress','Прогресс','Прогрес','Progreso','Progresso','Fortschritt','Avanzamento','Progression','Ілгерілеу','Напредък','Kemajuan','التقدم','进度','Előrehaladás','پیشرفت'],
  ['Ödül','Reward','Награда','Нагорода','Recompensa','Recompensa','Belohnung','Premio','Récompense','Сыйақы','Награда','Hadiah','المكافأة','奖励','Jutalom','پاداش'],
  ['Tarih','Date','Дата','Дата','Fecha','Data','Datum','Data','Date','Күні','Дата','Tanggal','التاريخ','日期','Dátum','تاریخ'],
  ['Tutar','Amount','Сумма','Сума','Importe','Valor','Betrag','Importo','Montant','Сома','Сума','Jumlah','المبلغ','金额','Összeg','مبلغ'],
  ['Durum','Status','Статус','Статус','Estado','Status','Status','Stato','Statut','Күй','Статус','Status','الحالة','状态','Állapot','وضعیت'],
  ['Toplam','Total','Итого','Разом','Total','Total','Gesamt','Totale','Total','Барлығы','Общо','Total','الإجمالي','总计','Összesen','مجموع'],
  ['Günlük','Daily','Ежедневно','Щодня','Diario','Diário','Täglich','Giornaliero','Quotidien','Күнделікті','Дневно','Harian','يومي','每日','Napi','روزانه'],
  ['Havuz','Pool','Пул','Пул','Pool','Pool','Pool','Pool','Pool','Пул','Пул','Pool','المجمع','资金池','Pool','استخر'],
  ['Sözleşme','Contract','Контракт','Контракт','Contrato','Contrato','Vertrag','Contratto','Contrat','Келісімшарт','Договор','Kontrak','العقد','合同','Szerződés','قرارداد'],
  ['Likidite','Liquidity','Ликвидность','Ліквідність','Liquidez','Liquidez','Liquidität','Liquidità','Liquidité','Өтімділік','Ликвидност','Likuiditas','السيولة','流动性','Likviditás','نقدینگی'],
  ['Kariyer','Career','Карьера','Кар’єра','Carrera','Carreira','Karriere','Carriera','Carrière','Мансап','Кариера','Karier','المسار','职业','Karrier','مسیر شغلی'],
  ['Yatırım','Investment','Инвестиция','Інвестиція','Inversión','Investimento','Investition','Investimento','Investissement','Инвестиция','Инвестиция','Investasi','الاستثمار','投资','Befektetés','سرمایه‌گذاری'],
  ['Kazanç','Earnings','Доход','Дохід','Ganancias','Ganhos','Ertrag','Guadagni','Gains','Табыс','Печалба','Pendapatan','الأرباح','收益','Bevétel','درآمد'],
  ['Bakiye','Balance','Баланс','Баланс','Saldo','Saldo','Guthaben','Saldo','Solde','Баланс','Баланс','Saldo','الرصيد','余额','Egyenleg','موجودی'],
  ['Üye','Member','Участник','Учасник','Miembro','Membro','Mitglied','Membro','Membre','Мүше','Член','Anggota','عضو','成员','Tag','عضو'],
  ['Ortak','Partner','Партнёр','Партнер','Socio','Parceiro','Partner','Partner','Partenaire','Серіктес','Партньор','Mitra','شريك','伙伴','Partner','شریک'],
  ['Komisyon','Commission','Комиссия','Комісія','Comisión','Comissão','Provision','Commissione','Commission','Комиссия','Комисиона','Komisi','العمولة','佣金','Jutalék','کمیسیون'],
  ['Simülasyon','Simulation','Симуляция','Симуляція','Simulación','Simulação','Simulation','Simulazione','Simulation','Симуляция','Симулация','Simulasi','محاكاة','模拟','Szimuláció','شبیه‌سازی'],
  ['Kopyalandı','Copied','Скопировано','Скопійовано','Copiado','Copiado','Kopiert','Copiato','Copié','Көшірілді','Копирано','Disalin','تم النسخ','已复制','Másolva','کپی شد'],
  ['Tüm seviyeler','All levels','Все уровни','Усі рівні','Todos los niveles','Todos os níveis','Alle Ebenen','Tutti i livelli','Tous les niveaux','Барлық деңгейлер','Всички нива','Semua level','كل المستويات','所有级别','Minden szint','همه سطوح'],
  ['Bakiye yatır','Deposit balance','Пополнить баланс','Поповнити баланс','Depositar saldo','Depositar saldo','Guthaben einzahlen','Deposita saldo','Déposer des fonds','Балансты толтыру','Депозирай баланс','Deposit saldo','إيداع الرصيد','充值余额','Egyenleg befizetése','واریز موجودی'],
  ['Ağ seçin','Select network','Выберите сеть','Виберіть мережу','Seleccionar red','Selecionar rede','Netzwerk wählen','Seleziona rete','Sélectionner le réseau','Желіні таңдаңыз','Изберете мрежа','Pilih jaringan','اختر الشبكة','选择网络','Hálózat kiválasztása','شبکه را انتخاب کنید'],
  ['Cüzdan adresi','Wallet address','Адрес кошелька','Адреса гаманця','Dirección de billetera','Endereço da carteira','Wallet-Adresse','Indirizzo del portafoglio','Adresse du portefeuille','Әмиян мекенжайы','Адрес на портфейла','Alamat dompet','عنوان المحفظة','钱包地址','Tárcacím','آدرس کیف پول'],
  ['QR ile yatır','Deposit with QR','Пополнить по QR-коду','Поповнити через QR-код','Depositar con QR','Depositar com QR','Per QR einzahlen','Deposita con QR','Déposer par QR','QR арқылы салу','Депозирай с QR код','Deposit dengan QR','الإيداع عبر رمز QR','扫码充值','Befizetés QR-kóddal','واریز با کد QR'],
  ['Cüzdan uygulamanızla QR kodunu tarayın.','Scan the QR code with your wallet app.','Отсканируйте QR-код в приложении кошелька.','Відскануйте QR-код у застосунку гаманця.','Escanea el código QR con tu aplicación de billetera.','Digitalize o código QR com seu aplicativo de carteira.','Scannen Sie den QR-Code mit Ihrer Wallet-App.','Scansiona il codice QR con la tua app wallet.','Scannez le code QR avec votre application de portefeuille.','QR кодын әмиян қолданбасымен сканерлеңіз.','Сканирайте QR кода с приложението за портфейл.','Pindai kode QR dengan aplikasi dompet Anda.','امسح رمز QR باستخدام تطبيق محفظتك.','使用钱包应用扫描二维码。','Olvassa be a QR-kódot a tárcaalkalmazással.','کد QR را با برنامه کیف پول خود اسکن کنید.'],
  ['Yalnızca seçili ağ üzerinden USDT gönderin.','Send USDT only through the selected network.','Отправляйте USDT только через выбранную сеть.','Надсилайте USDT лише через вибрану мережу.','Envía USDT únicamente por la red seleccionada.','Envie USDT apenas pela rede selecionada.','Senden Sie USDT nur über das ausgewählte Netzwerk.','Invia USDT solo tramite la rete selezionata.','Envoyez des USDT uniquement via le réseau sélectionné.','USDT-ті тек таңдалған желі арқылы жіберіңіз.','Изпращайте USDT само през избраната мрежа.','Kirim USDT hanya melalui jaringan yang dipilih.','أرسل USDT عبر الشبكة المحددة فقط.','仅通过所选网络发送 USDT。','USDT-t csak a kiválasztott hálózaton küldjön.','USDT را فقط از طریق شبکه انتخاب‌شده ارسال کنید.'],
  ['Memo / Etiket','Memo / Tag','Мемо / Метка','Мемо / Мітка','Memo / Etiqueta','Memo / Etiqueta','Memo / Tag','Memo / Etichetta','Mémo / Étiquette','Мемо / Белгі','Мемо / Етикет','Memo / Tag','مذكرة / وسم','备注 / 标签','Megjegyzés / Címke','یادداشت / برچسب'],
  ['ZORUNLU','REQUIRED','ОБЯЗАТЕЛЬНО','ОБОВ’ЯЗКОВО','OBLIGATORIO','OBRIGATÓRIO','ERFORDERLICH','OBBLIGATORIO','OBLIGATOIRE','МІНДЕТТІ','ЗАДЪЛЖИТЕЛНО','WAJIB','مطلوب','必填','KÖTELEZŐ','الزامی'],
  ['Yapılandırılmadı','Not configured','Не настроено','Не налаштовано','No configurado','Não configurado','Nicht konfiguriert','Non configurato','Non configuré','Бапталмаған','Не е конфигурирано','Belum dikonfigurasi','غير مهيأ','未配置','Nincs beállítva','پیکربندی نشده'],
  ['Tutar (USDT)','Amount (USDT)','Сумма (USDT)','Сума (USDT)','Importe (USDT)','Valor (USDT)','Betrag (USDT)','Importo (USDT)','Montant (USDT)','Сома (USDT)','Сума (USDT)','Jumlah (USDT)','المبلغ (USDT)','金额 (USDT)','Összeg (USDT)','مبلغ (USDT)'],
  ['Minimum yatırım','Minimum deposit','Минимальный депозит','Мінімальний депозит','Depósito mínimo','Depósito mínimo','Mindesteinzahlung','Deposito minimo','Dépôt minimum','Ең төменгі салым','Минимален депозит','Deposit minimum','الحد الأدنى للإيداع','最低充值','Minimális befizetés','حداقل واریز'],
  ['USDT varlığında çalışmanın minimum tutarı','The minimum USDT amount is','Минимальная сумма USDT','Мінімальна сума USDT','El importe mínimo de USDT es','O valor mínimo de USDT é','Der Mindestbetrag für USDT beträgt','L’importo minimo USDT è','Le montant minimum en USDT est','USDT ең төменгі сомасы','Минималната сума за USDT е','Jumlah minimum USDT adalah','الحد الأدنى لمبلغ USDT هو','USDT 最低金额为','A minimális USDT összeg','حداقل مبلغ USDT برابر است با'],
  ['Yönetici tarafından yapılandırılmayı bekliyor','Waiting for administrator configuration','Ожидает настройки администратором','Очікує налаштування адміністратором','Esperando configuración del administrador','Aguardando configuração do administrador','Wartet auf Administratorkonfiguration','In attesa della configurazione amministratore','En attente de la configuration administrateur','Әкімші баптауын күтуде','Очаква конфигурация от администратор','Menunggu konfigurasi administrator','بانتظار إعداد المسؤول','等待管理员配置','Rendszergazdai beállításra vár','در انتظار پیکربندی مدیر'],
  ['Bu ağ henüz yönetici tarafından etkinleştirilmedi.','This network has not yet been enabled by the administrator.','Эта сеть ещё не включена администратором.','Цю мережу ще не ввімкнув адміністратор.','Esta red aún no ha sido habilitada por el administrador.','Esta rede ainda não foi ativada pelo administrador.','Dieses Netzwerk wurde vom Administrator noch nicht aktiviert.','Questa rete non è ancora stata attivata dall’amministratore.','Ce réseau n’a pas encore été activé par l’administrateur.','Бұл желіні әкімші әлі қоспаған.','Тази мрежа все още не е активирана от администратора.','Jaringan ini belum diaktifkan oleh administrator.','لم يتم تفعيل هذه الشبكة من قبل المسؤول بعد.','管理员尚未启用此网络。','Ezt a hálózatot a rendszergazda még nem engedélyezte.','این شبکه هنوز توسط مدیر فعال نشده است.'],
  ['Yatırımlar ağ onayından sonra ticaret bakiyenize eklenir.','Deposits are added to your trading balance after network confirmation.','Депозиты добавляются к торговому балансу после подтверждения сетью.','Депозити додаються до торгового балансу після підтвердження мережею.','Los depósitos se añaden a tu saldo de trading tras la confirmación de la red.','Os depósitos são adicionados ao saldo de negociação após confirmação da rede.','Einzahlungen werden nach Netzwerkbestätigung Ihrem Handelsguthaben gutgeschrieben.','I depositi vengono aggiunti al saldo di trading dopo la conferma della rete.','Les dépôts sont ajoutés à votre solde de trading après confirmation du réseau.','Салымдар желі растағаннан кейін сауда балансына қосылады.','Депозитите се добавят към търговския баланс след мрежово потвърждение.','Deposit ditambahkan ke saldo perdagangan setelah konfirmasi jaringan.','تُضاف الإيداعات إلى رصيد التداول بعد تأكيد الشبكة.','网络确认后，充值将计入交易余额。','A befizetés a hálózati megerősítés után kerül a kereskedési egyenlegre.','واریزها پس از تأیید شبکه به موجودی معاملاتی افزوده می‌شوند.'],
  ['Cüzdan bakiyenizi USDT kripto para ile gönderin. Yanlış ağ veya eksik Memo/Etiket kullanılması durumunda transfer geri alınamayabilir.','Send funds only as USDT. A transfer made on the wrong network or without the required Memo/Tag may be unrecoverable.','Отправляйте средства только в USDT. Перевод через неверную сеть или без обязательного мемо/метки может быть безвозвратным.','Надсилайте кошти лише в USDT. Переказ через неправильну мережу або без обов’язкового мемо/мітки може бути безповоротним.','Envía fondos únicamente como USDT. Una transferencia por la red incorrecta o sin el Memo/Etiqueta requerido puede ser irrecuperable.','Envie fundos apenas em USDT. Uma transferência pela rede errada ou sem o Memo/Etiqueta obrigatório pode ser irrecuperável.','Senden Sie ausschließlich USDT. Eine Übertragung über das falsche Netzwerk oder ohne erforderliches Memo/Tag kann unwiederbringlich sein.','Invia fondi solo in USDT. Un trasferimento sulla rete errata o senza il Memo/Etichetta richiesto potrebbe non essere recuperabile.','Envoyez uniquement des USDT. Un transfert sur le mauvais réseau ou sans le Mémo/Étiquette requis peut être irrécupérable.','Қаражатты тек USDT түрінде жіберіңіз. Қате желі немесе міндетті мемосыз аударым қайтарылмауы мүмкін.','Изпращайте средства само в USDT. Превод по грешна мрежа или без задължителното мемо/етикет може да е невъзстановим.','Kirim dana hanya dalam USDT. Transfer melalui jaringan yang salah atau tanpa Memo/Tag wajib mungkin tidak dapat dipulihkan.','أرسل الأموال بعملة USDT فقط. قد يتعذر استرداد التحويل عبر شبكة خاطئة أو من دون المذكرة/الوسم المطلوب.','仅发送 USDT。使用错误网络或缺少必填备注/标签的转账可能无法找回。','Csak USDT-t küldjön. A rossz hálózaton vagy a szükséges megjegyzés/címke nélkül indított átutalás elveszhet.','وجوه را فقط به صورت USDT ارسال کنید. انتقال در شبکه اشتباه یا بدون یادداشت/برچسب الزامی ممکن است قابل بازیابی نباشد.'],
  ['Doğrulandı','Confirmed','Подтверждено','Підтверджено','Confirmado','Confirmado','Bestätigt','Confermato','Confirmé','Расталды','Потвърдено','Terkonfirmasi','تم التأكيد','已确认','Megerősítve','تأیید شد'],
  ['Ağ doğrulaması bekliyor','Awaiting network confirmation','Ожидает подтверждения сети','Очікує підтвердження мережі','Esperando confirmación de red','Aguardando confirmação da rede','Wartet auf Netzwerkbestätigung','In attesa della conferma della rete','En attente de confirmation du réseau','Желі растауын күтуде','Очаква мрежово потвърждение','Menunggu konfirmasi jaringan','بانتظار تأكيد الشبكة','等待网络确认','Hálózati megerősítésre vár','در انتظار تأیید شبکه'],
  ['Doğrulama sonrası indirilebilir','Available after confirmation','Доступно после подтверждения','Доступно після підтвердження','Disponible tras la confirmación','Disponível após confirmação','Nach Bestätigung verfügbar','Disponibile dopo la conferma','Disponible après confirmation','Растаудан кейін қолжетімді','Достъпно след потвърждение','Tersedia setelah konfirmasi','متاح بعد التأكيد','确认后可下载','Megerősítés után érhető el','پس از تأیید در دسترس است'],
  ['Ağ bulunamadı','Network not found','Сеть не найдена','Мережу не знайдено','Red no encontrada','Rede não encontrada','Netzwerk nicht gefunden','Rete non trovata','Réseau introuvable','Желі табылмады','Мрежата не е намерена','Jaringan tidak ditemukan','لم يتم العثور على الشبكة','未找到网络','A hálózat nem található','شبکه پیدا نشد'],
  ['alıcı istiyorsa','if required by recipient','если требует получатель','якщо вимагає одержувач','si lo exige el destinatario','se exigido pelo destinatário','falls vom Empfänger verlangt','se richiesto dal destinatario','si le destinataire l’exige','алушы талап етсе','ако получателят изисква','jika diminta penerima','إذا طلبه المستلم','如收款方要求','ha a címzett kéri','در صورت درخواست گیرنده'],
  ['Hedef adres','Destination address','Адрес назначения','Адреса призначення','Dirección de destino','Endereço de destino','Zieladresse','Indirizzo di destinazione','Adresse de destination','Мақсатты мекенжай','Адрес на местоназначение','Alamat tujuan','عنوان الوجهة','目标地址','Célcím','آدرس مقصد'],
  ['Desteklenen USDT ağlarında bakiye yatırma, çekim talebi ve otomatik çekim kurallarını yönetin.','Manage deposits, withdrawal requests and automatic withdrawal rules across supported USDT networks.','Управляйте пополнениями, запросами на вывод и правилами автовывода в поддерживаемых сетях USDT.','Керуйте поповненнями, запитами на виведення та правилами автовиведення в підтримуваних мережах USDT.','Gestiona depósitos, solicitudes de retiro y reglas de retiro automático en las redes USDT compatibles.','Gerencie depósitos, solicitações de saque e regras de saque automático nas redes USDT compatíveis.','Verwalten Sie Einzahlungen, Auszahlungsanträge und Regeln für automatische Auszahlungen in unterstützten USDT-Netzwerken.','Gestisci depositi, richieste di prelievo e regole di prelievo automatico sulle reti USDT supportate.','Gérez les dépôts, les demandes de retrait et les règles de retrait automatique sur les réseaux USDT pris en charge.','Қолдау көрсетілетін USDT желілеріндегі салымдарды, шығару сұрауларын және автоматты шығару ережелерін басқарыңыз.','Управлявайте депозитите, заявките за теглене и правилата за автоматично теглене в поддържаните USDT мрежи.','Kelola deposit, permintaan penarikan, dan aturan penarikan otomatis di jaringan USDT yang didukung.','أدر الإيداعات وطلبات السحب وقواعد السحب التلقائي عبر شبكات USDT المدعومة.','管理受支持 USDT 网络中的充值、提现申请和自动提现规则。','Kezelje a befizetéseket, a kifizetési kérelmeket és az automatikus kifizetési szabályokat a támogatott USDT-hálózatokon.','واریزها، درخواست‌های برداشت و قوانین برداشت خودکار را در شبکه‌های پشتیبانی‌شده USDT مدیریت کنید.'],
  ['Tutar, yukarıdaki adrese gönderiminizle eşleştirilir.','The amount is matched with your transfer to the address above.','Сумма сопоставляется с вашим переводом на указанный выше адрес.','Сума зіставляється з вашим переказом на вказану вище адресу.','El importe se vincula con tu envío a la dirección anterior.','O valor é associado à sua transferência para o endereço acima.','Der Betrag wird Ihrer Überweisung an die oben angegebene Adresse zugeordnet.','L’importo viene associato al trasferimento verso l’indirizzo indicato sopra.','Le montant est associé à votre transfert vers l’adresse ci-dessus.','Сома жоғарыдағы мекенжайға жіберген аударымыңызбен сәйкестендіріледі.','Сумата се свързва с превода ви към посочения по-горе адрес.','Jumlah dicocokkan dengan transfer Anda ke alamat di atas.','تتم مطابقة المبلغ مع تحويلك إلى العنوان أعلاه.','金额将与您向上述地址发起的转账匹配。','Az összeget a fenti címre indított átutalásával párosítjuk.','مبلغ با انتقال شما به آدرس بالا تطبیق داده می‌شود.'],
  ['Oluşturuluyor…','Creating…','Создание…','Створення…','Creando…','Criando…','Wird erstellt…','Creazione…','Création…','Жасалуда…','Създаване…','Membuat…','جارٍ الإنشاء…','正在创建…','Létrehozás…','در حال ایجاد…'],
  ['ile oluşturuldu. Ağ doğrulamasından sonra PDF indirilebilir.','was created. The PDF can be downloaded after network confirmation.','создана. PDF можно скачать после подтверждения сетью.','створено. PDF можна завантажити після підтвердження мережею.','se creó. El PDF se puede descargar tras la confirmación de la red.','foi criada. O PDF pode ser baixado após a confirmação da rede.','wurde erstellt. Das PDF kann nach der Netzwerkbestätigung heruntergeladen werden.','è stata creata. Il PDF può essere scaricato dopo la conferma della rete.','a été créée. Le PDF peut être téléchargé après confirmation du réseau.','жасалды. PDF желі растағаннан кейін жүктеп алынады.','е създадена. PDF файлът може да се изтегли след потвърждение от мрежата.','telah dibuat. PDF dapat diunduh setelah konfirmasi jaringan.','تم إنشاؤها. يمكن تنزيل ملف PDF بعد تأكيد الشبكة.','已创建。网络确认后可下载 PDF。','létrejött. A PDF a hálózati megerősítés után tölthető le.','ایجاد شد. فایل PDF پس از تأیید شبکه قابل دانلود است.'],
  ['Yatırım talimatı oluşturulamadı.','The deposit instruction could not be created.','Не удалось создать инструкцию по пополнению.','Не вдалося створити інструкцію з поповнення.','No se pudo crear la instrucción de depósito.','Não foi possível criar a instrução de depósito.','Die Einzahlungsanweisung konnte nicht erstellt werden.','Impossibile creare l’istruzione di deposito.','L’instruction de dépôt n’a pas pu être créée.','Салым нұсқауын жасау мүмкін болмады.','Инструкцията за депозит не можа да бъде създадена.','Instruksi deposit tidak dapat dibuat.','تعذر إنشاء تعليمات الإيداع.','无法创建充值指令。','A befizetési utasítás nem hozható létre.','دستور واریز ایجاد نشد.'],
  ['Zorunlu Memo/Etiket yapılandırılmayı bekliyor','Required Memo/Tag is awaiting configuration','Обязательное мемо/метка ожидает настройки','Обов’язкове мемо/мітка очікує налаштування','El Memo/Etiqueta obligatorio está pendiente de configuración','O Memo/Etiqueta obrigatório aguarda configuração','Erforderliches Memo/Tag wartet auf Konfiguration','Il Memo/Etichetta obbligatorio è in attesa di configurazione','Le Mémo/Étiquette obligatoire attend sa configuration','Міндетті мемо/белгі баптауды күтуде','Задължителното мемо/етикет очаква конфигурация','Memo/Tag wajib menunggu konfigurasi','المذكرة/الوسم المطلوب بانتظار الإعداد','必填备注/标签正在等待配置','A kötelező megjegyzés/címke beállításra vár','یادداشت/برچسب الزامی در انتظار پیکربندی است'],
  ['Çekim talebi oluştur','Create withdrawal request','Создать запрос на вывод','Створити запит на виведення','Crear solicitud de retiro','Criar solicitação de saque','Auszahlungsantrag erstellen','Crea richiesta di prelievo','Créer une demande de retrait','Шығару сұрауын жасау','Създай заявка за теглене','Buat permintaan penarikan','إنشاء طلب سحب','创建提现申请','Kifizetési kérelem létrehozása','ایجاد درخواست برداشت'],
  ['Çekim tutarı','Withdrawal amount','Сумма вывода','Сума виведення','Importe del retiro','Valor do saque','Auszahlungsbetrag','Importo del prelievo','Montant du retrait','Шығару сомасы','Сума за теглене','Jumlah penarikan','مبلغ السحب','提现金额','Kifizetési összeg','مبلغ برداشت'],
  ['Ağ ücreti (%1)','Network fee (1%)','Комиссия сети (1%)','Комісія мережі (1%)','Comisión de red (1%)','Taxa de rede (1%)','Netzwerkgebühr (1 %)','Commissione di rete (1%)','Frais de réseau (1 %)','Желі комиссиясы (1%)','Мрежова такса (1%)','Biaya jaringan (1%)','رسوم الشبكة (1٪)','网络手续费（1%）','Hálózati díj (1%)','کارمزد شبکه (۱٪)'],
  ['Hesabınıza geçecek','Amount to be credited','Будет зачислено','Буде зараховано','Importe que recibirás','Valor a creditar','Gutschrift auf Ihrem Konto','Importo accreditato','Montant crédité','Шотыңызға түсетін сома','Сума за получаване','Jumlah yang dikreditkan','المبلغ الذي سيُضاف إلى حسابك','到账金额','Jóváírandó összeg','مبلغ واریزی به حساب'],
  ['Çekimler manuel güvenlik onayından sonra 24 saat içinde işlenir. Yalnızca gelir bakiyesi çekilebilir; ticaret bakiyesi aktif arbitrajda kullanılır.','Withdrawals are processed within 24 hours after manual security approval. Only the income balance can be withdrawn; the trading balance is used in active arbitrage.','Выводы обрабатываются в течение 24 часов после ручной проверки безопасности. Вывести можно только доходный баланс; торговый баланс используется в активном арбитраже.','Виведення обробляються протягом 24 годин після ручного підтвердження безпеки. Вивести можна лише баланс доходу; торговий баланс використовується в активному арбітражі.','Los retiros se procesan en un plazo de 24 horas tras la aprobación manual de seguridad. Solo se puede retirar el saldo de ingresos; el saldo de trading se usa en el arbitraje activo.','Os saques são processados em até 24 horas após a aprovação manual de segurança. Apenas o saldo de renda pode ser sacado; o saldo de negociação é usado na arbitragem ativa.','Auszahlungen werden innerhalb von 24 Stunden nach manueller Sicherheitsfreigabe bearbeitet. Nur das Einkommensguthaben kann ausgezahlt werden; das Handelsguthaben wird für aktive Arbitrage verwendet.','I prelievi vengono elaborati entro 24 ore dall’approvazione manuale di sicurezza. È possibile prelevare solo il saldo redditi; il saldo di trading viene usato nell’arbitraggio attivo.','Les retraits sont traités sous 24 heures après validation manuelle de sécurité. Seul le solde de revenus peut être retiré ; le solde de trading est utilisé pour l’arbitrage actif.','Шығарулар қолмен қауіпсіздік растауынан кейін 24 сағат ішінде өңделеді. Тек кіріс балансын шығаруға болады; сауда балансы белсенді арбитражда қолданылады.','Тегленията се обработват до 24 часа след ръчно одобрение за сигурност. Може да се тегли само доходният баланс; търговският баланс се използва в активен арбитраж.','Penarikan diproses dalam 24 jam setelah persetujuan keamanan manual. Hanya saldo pendapatan yang dapat ditarik; saldo perdagangan digunakan dalam arbitrase aktif.','تُعالج عمليات السحب خلال 24 ساعة بعد الموافقة الأمنية اليدوية. يمكن سحب رصيد الدخل فقط؛ ويُستخدم رصيد التداول في المراجحة النشطة.','提现将在人工安全审核后的 24 小时内处理。只有收益余额可以提现；交易余额用于进行中的套利。','A kifizetéseket a kézi biztonsági jóváhagyás után 24 órán belül feldolgozzuk. Csak a jövedelemegyenleg vehető ki; a kereskedési egyenleg aktív arbitrázsra szolgál.','برداشت‌ها پس از تأیید دستی امنیتی ظرف ۲۴ ساعت پردازش می‌شوند. فقط موجودی درآمد قابل برداشت است؛ موجودی معامله در آربیتراژ فعال استفاده می‌شود.'],
  ['Otomatik çekimi etkinleştir','Enable automatic withdrawal','Включить автоматический вывод','Увімкнути автоматичне виведення','Activar retiro automático','Ativar saque automático','Automatische Auszahlung aktivieren','Attiva il prelievo automatico','Activer le retrait automatique','Автоматты шығаруды қосу','Активирай автоматичното теглене','Aktifkan penarikan otomatis','تفعيل السحب التلقائي','启用自动提现','Automatikus kifizetés engedélyezése','فعال‌کردن برداشت خودکار'],
  ['Gelir bakiyeniz eşiğe ulaştığında otomatik çekim talebi oluşturulur.','An automatic withdrawal request is created when your income balance reaches the threshold.','Когда доходный баланс достигает порога, автоматически создаётся запрос на вывод.','Коли баланс доходу досягає порога, автоматично створюється запит на виведення.','Se crea una solicitud de retiro automática cuando tu saldo de ingresos alcanza el umbral.','Uma solicitação de saque automática é criada quando seu saldo de renda atinge o limite.','Sobald Ihr Einkommensguthaben den Schwellenwert erreicht, wird automatisch ein Auszahlungsantrag erstellt.','Quando il saldo redditi raggiunge la soglia, viene creata una richiesta di prelievo automatica.','Une demande de retrait automatique est créée lorsque votre solde de revenus atteint le seuil.','Кіріс балансы шекке жеткенде автоматты шығару сұрауы жасалады.','Когато доходният ви баланс достигне прага, автоматично се създава заявка за теглене.','Permintaan penarikan otomatis dibuat saat saldo pendapatan Anda mencapai ambang batas.','يُنشأ طلب سحب تلقائي عندما يصل رصيد الدخل إلى الحد المحدد.','当收益余额达到阈值时，系统会自动创建提现申请。','Amikor a jövedelemegyenlege eléri a küszöböt, automatikus kifizetési kérelem készül.','وقتی موجودی درآمد به آستانه برسد، درخواست برداشت خودکار ایجاد می‌شود.'],
  ['Çekim eşiği (USDT)','Withdrawal threshold (USDT)','Порог вывода (USDT)','Поріг виведення (USDT)','Umbral de retiro (USDT)','Limite de saque (USDT)','Auszahlungsschwelle (USDT)','Soglia di prelievo (USDT)','Seuil de retrait (USDT)','Шығару шегі (USDT)','Праг за теглене (USDT)','Ambang penarikan (USDT)','حد السحب (USDT)','提现阈值（USDT）','Kifizetési küszöb (USDT)','آستانه برداشت (USDT)'],
  ['Pasif','Inactive','Неактивно','Неактивно','Inactivo','Inativo','Inaktiv','Inattivo','Inactif','Белсенді емес','Неактивно','Tidak aktif','غير نشط','未启用','Inaktív','غیرفعال'],
  ['Maks:','Max:','Макс.:','Макс.:','Máx.:','Máx.:','Max.:','Max:','Max :','Макс.:','Макс.:','Maks:','الحد الأقصى:','最大值：','Max.:','حداکثر:'],
  ['Alıcı','Recipient','Получатель','Одержувач','Destinatario','Destinatário','Empfänger','Destinatario','Destinataire','Алушы','Получател','Penerima','المستلم','收款方','Címzett','گیرنده'],
  ['kopyala','copy','копировать','копіювати','copiar','copiar','kopieren','copia','copier','көшіру','копирай','salin','نسخ','复制','másolás','کپی'],
]

const dictionaries = Object.fromEntries(targetLanguages.map((language, languageIndex) => [
  language,
  Object.fromEntries(rows.map((row) => [row[0], row[languageIndex + 1] ?? row[1]])),
])) as Record<TargetLanguage, Record<string, string>>

const orderedSources = rows.map((row) => row[0]).sort((a, b) => b.length - a.length)
const escapedSources = orderedSources.map((source) => source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const phrasePattern = new RegExp(
  `(^|[^\\p{L}\\p{N}_])(${escapedSources.join('|')})(?=$|[^\\p{L}\\p{N}_])`,
  'gu',
)

export function translateUiText(value: string, language: LanguageCode, shared: Record<string, string> = {}): string {
  if (language === 'tr' || !value.trim()) return value
  const dictionary = dictionaries[language]
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  const source = value.trim()
  const exact = dictionary[source]
  if (exact) return `${leading}${exact}${trailing}`

  phrasePattern.lastIndex = 0
  const translated = source.replace(
    phrasePattern,
    (_match, prefix: string, term: string) => `${prefix}${dictionary[term] ?? term}`,
  )
  if (translated !== source) return `${leading}${translated}${trailing}`

  return translateLegacyText(value, language, shared)
}

const translatedAttributes = ['placeholder', 'aria-label', 'title'] as const
const excludedSelector = '[data-no-auto-translate],script,style,code,pre'

export function AutoTranslate({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const textState = useRef(new WeakMap<Text, { source: string; rendered: string }>())
  const attributeState = useRef(new WeakMap<Element, Map<string, { source: string; rendered: string }>>())

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const isExcluded = (node: Node) => {
      const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
      return Boolean(element?.closest(excludedSelector))
    }

    const translateTextNode = (node: Text) => {
      if (isExcluded(node)) return
      const current = node.nodeValue ?? ''
      const previous = textState.current.get(node)
      const source = previous && current === previous.rendered ? previous.source : current
      const rendered = translateUiText(source, language, t as unknown as Record<string, string>)
      textState.current.set(node, { source, rendered })
      if (current !== rendered) node.nodeValue = rendered
    }

    const translateElement = (element: Element) => {
      if (isExcluded(element)) return
      let state = attributeState.current.get(element)
      if (!state) {
        state = new Map()
        attributeState.current.set(element, state)
      }
      for (const name of translatedAttributes) {
        const current = element.getAttribute(name)
        if (!current) continue
        const previous = state.get(name)
        const source = previous && current === previous.rendered ? previous.source : current
        const rendered = translateUiText(source, language, t as unknown as Record<string, string>)
        state.set(name, { source, rendered })
        if (current !== rendered) element.setAttribute(name, rendered)
      }
    }

    const walk = (start: Node) => {
      if (start.nodeType === Node.TEXT_NODE) {
        translateTextNode(start as Text)
        return
      }
      if (start.nodeType !== Node.ELEMENT_NODE) return
      const element = start as Element
      if (isExcluded(element)) return
      translateElement(element)
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        { acceptNode: (node) => isExcluded(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT },
      )
      let node = walker.nextNode()
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text)
        else translateElement(node as Element)
        node = walker.nextNode()
      }
    }

    const pending = new Set<Node>()
    let frameId: number | null = null

    const observe = () => observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    })

    const flush = () => {
      frameId = null
      observer.disconnect()
      const nodes = [...pending]
      pending.clear()
      const roots = nodes.filter((node) =>
        (node === root || root.contains(node))
        && !nodes.some((other) => other !== node && other.contains(node)),
      )
      roots.forEach(walk)
      observe()
    }

    const schedule = (node: Node) => {
      pending.add(node)
      if (frameId === null) frameId = window.requestAnimationFrame(flush)
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.type === 'attributes') schedule(mutation.target)
        mutation.addedNodes.forEach(schedule)
      }
    })
    observe()
    schedule(root)
    return () => {
      observer.disconnect()
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      pending.clear()
    }
  }, [language, t])

  return <div ref={rootRef} className="contents">{children}</div>
}
