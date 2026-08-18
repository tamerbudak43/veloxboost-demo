'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { type LanguageCode, useLanguage } from './language-context'

const targetLanguages = ['en', 'ru', 'uk', 'es', 'pt', 'de', 'it', 'fr', 'kk', 'bg', 'id', 'ar', 'zh', 'hu', 'fa'] as const
type TargetLanguage = (typeof targetLanguages)[number]

type Row = readonly [source: string, ...translations: string[]]

// Shared UI vocabulary used by the older VELOX screens. New screens should
// prefer useLanguage(), but this bridge keeps every existing screen connected
// to the same language selection without duplicating page-local state.
const rows: Row[] = [
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

export function translateUiText(value: string, language: LanguageCode): string {
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
  return translated === source ? value : `${leading}${translated}${trailing}`
}

const translatedAttributes = ['placeholder', 'aria-label', 'title'] as const
const excludedSelector = '[data-no-auto-translate],script,style,code,pre'

export function AutoTranslate({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
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
      const rendered = translateUiText(source, language)
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
        const rendered = translateUiText(source, language)
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
  }, [language])

  return <div ref={rootRef} className="contents">{children}</div>
}
