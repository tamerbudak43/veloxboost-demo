# VELOX yatırım işlem belgesi kurulumu

Bu özellik resmî vergi faturası değil, doğrulanmış USDT yatırım işleminin üyeye ait özet belgesidir.

1. Proje paketini ana VELOX klasörüne çıkarın ve dosya değiştirme sorusunda **Değiştir** seçin.
2. Terminalde bağımlılığı kurun:

   ```bash
   pnpm install
   ```

3. Neon SQL Editor'de `db/migrations/0002_investment_receipts.sql` dosyasının tamamını çalıştırın.
4. Yerel `.env.local` dosyanıza yalnızca kendi kamuya açık TRC20 alıcı adresinizi ekleyin:

   ```env
   VELOX_USDT_TRC20_ADDRESS=BURAYA_KENDI_TRC20_ADRESINIZ
   ```

   Özel anahtar, seed phrase veya borsa API sırrı kesinlikle eklenmez.
5. Uygulamayı yeniden başlatın:

   ```bash
   pnpm dev
   ```

## İşleyiş

- Üye yatırım ekranından tutar girerek bir **yatırım talimatı** oluşturur.
- Bu adım yatırımın gerçekleştiğini kanıtlamaz ve PDF indirme açılmaz.
- Yönetici, **Yatırım Belgeleri** ekranında blok zinciri işlem hash'ini kontrol eder.
- Geçerli 64 karakterlik hash ile doğrulama yapıldığında belge kullanıcıya açılır.
- Kullanıcı aynı ekrandaki **PDF indir** düğmesiyle kendi belgesini indirir.
