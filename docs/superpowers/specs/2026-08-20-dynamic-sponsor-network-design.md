# Sponsor Ağacını Dinamikleştirme — Tasarım

Tarih: 2026-08-20

> NOT (sonradan eklendi): Bu spec, yerel klasörün GitHub'daki güncel repodan
> ~10 gün geride kalmış eski bir snapshot olduğu fark edilmeden önce
> yazıldı. Yerel klasör sonradan `github.com/tamerbudak43/veloxboost-demo`
> (main, 61 commit) ile eşitlendi. Bu dosyanın aşağıdaki içeriği, o eski
> snapshot'a göre yazılmış orijinal tasarımdır — güncel koddaki gerçek durum
> ayrıca doğrulanıp raporlanacaktır.

## Problem

`/partners` (network explorer) ve `/career` sayfaları şu an tamamen sahte
veriden besleniyor: `lib/network/demo-network.ts`, seeded bir PRNG ile
üretilmiş 182 kişilik sabit bir demo ağaç döndürüyor. Gerçek üyeler sign-up
olurken `member` tablosuna ve `networkClosure` closure-table'a doğru şekilde
yazılıyor (`app/actions/member.ts`), ama bu gerçek veri hiçbir yerde
okunmuyor. Amaç: ağaç *yapısını* (kim kimin sponsoru, kim kimin altında)
gerçek DB verisinden okumaya geçirmek.

## Kapsam

**Kapsamda:** sponsor ağacı topolojisi (üye, `sponsorId`, derinlik, hangi ana
dal altında olduğu) gerçek `member` + `networkClosure` tablolarından
okunacak.

**Kapsam dışı (bilinçli karar):** `personalVolume` / `teamVolume` hâlâ DB'de
gerçek kolonlar olarak kalacak ama hiçbir action onlara yazmıyor — bu, ayrı
bir iş olan arbitraj/yatırım akışının gerçek DB'ye bağlanmasına bağlı.
Bu turda hacimler gerçek üyeler için 0 görünecek, bu beklenen bir durumdur.
`personalInvestment` (career metriklerinde kullanılan) DB'de hiç karşılığı
olmayan bir alan olduğu için bu turda `0` olarak sabitlenir.

## Mimari

Servis katmanı (`lib/network/network.service.ts`, `volume.service.ts`,
`commission.service.ts`, `career.service.ts`) zaten `NetworkMember[]` üzerinde
çalışan saf fonksiyonlardan oluşuyor — veri kaynağından bağımsız. Bu yüzden
tek yapılması gereken, `getDemoNetwork()`'ün ürettiği `{rootId, members}`
şeklini üreten gerçek bir DB-backed eşdeğerini yazmak ve çağrı noktasında
değiştirmek. Servis katmanına dokunulmuyor.

### Yeni dosya: `lib/network/real-network.ts`

```ts
export async function getRealNetwork(rootUserId: string): Promise<{ rootId: string; members: NetworkMember[] }>
```

Adımlar:

1. `networkClosure` tablosundan `ancestorUserId = rootUserId` olan tüm
   satırları çek → `{descendantUserId, depth}` listesi. Bu, root'un tüm
   downline'ını tek sorguda verir (closure table tam bunun için tasarlanmış).
2. `member` tablosundan `userId IN [rootUserId, ...descendantIds]` olan
   satırları çek.
3. Bellekte `id → member` map kur.
4. Her downline üyesi için `legRootId`'i, `sponsorId` zincirinde yukarı
   yürüyerek hesapla (root'un direkt altına düşen ilk ata = `legRootId`,
   max 33 hop, bellekte zaten yüklü map üzerinden). Root'un direkt
   ortakları ve root'un kendisi için `legRootId = kendi id'si`
   (`demo-network.ts` ile aynı sözleşme).
5. Her DB satırını `NetworkMember` şekline eşle:
   - `personalVolume`/`teamVolume`: DB'deki gerçek değer (`safeNumber`)
   - `personalInvestment`: `0` (bu tur kapsam dışı)
   - `joinedAt`: `createdAt`
6. `{ rootId: rootUserId, members }` döndür.

### Çağrı noktası değişikliği: `app/actions/network.ts`

```ts
// önce:
const { rootId, members } = getDemoNetwork()

// sonra:
const profile = await getMyProfile()   // (app)/layout.tsx zaten garanti ediyor
const { rootId, members } = await getRealNetwork(profile.userId)
```

`getMyProfile()` çağrısı fonksiyonda zaten vardı, sadece sırası öne
alınıyor. `getDemoNetwork` importu ve `lib/network/demo-network.ts` dosyası
bu değişiklikten sonra kullanılmaz hale gelir — silinir (ölü kod
bırakılmaz).

### Root seçimi

Her üye `/partners`'ı açtığında **kendi userId'si root olur**, sadece kendi
downline'ını görür. Mevcut demo davranışındaki sabit "Tamer Budak" root'u
kaldırılır.

### Performans: index eksikliği

`networkClosure` tablosunda şu an `ancestorUserId` veya `descendantUserId`
üzerinde index yok. Bu sorgu her sayfa yüklemesinde çalışacağı için migration
adımına `ancestorUserId` üzerinde bir index eklenecek.

## Migration Araçları

Projede şu an hiç migration aracı kurulu değil (`drizzle-kit` yok,
`drizzle.config.*` yok, `migrations/` yok).

- `drizzle-kit` devDependency olarak eklenir.
- `drizzle.config.ts` oluşturulur (`schema: lib/db/schema.ts`,
  `dialect: postgresql`, `dbCredentials.url: process.env.DATABASE_URL`).
- Yöntem: **`drizzle-kit push`** — migration dosyası biriktirmek yerine
  şemayı doğrudan DB'ye senkronlamak. Gerekçe: `schema.ts`'teki mevcut yorum
  ("no FK constraints... schema stays easy to iterate on") zaten hızlı
  iterasyon felsefesini işaret ediyor; proje henüz git'e bağlı bile değil.
  İleride prod'a geçerken `generate` + `migrate` akışına geçilebilir — bu
  bir sonraki karardır, bu spec'in kapsamı değildir.
- Bu adım aynı zamanda `networkClosure(ancestorUserId)` index'ini de DB'ye
  uygular.

`.env.local` proje kökünde kullanıcının sağlayacağı gerçek `DATABASE_URL` /
`BETTER_AUTH_URL` değerleriyle oluşturulur (gerçek kimlik bilgileri bu spec
dosyasına yazılmaz).

## Seed Script

`scripts/seed-network.ts` (çalıştırma: `npm run seed`, `package.json`'a
`"seed": "tsx scripts/seed-network.ts"` eklenecek; `tsx` devDependency
olarak eklenir).

- Better Auth `auth.api.signUpEmail` ile 5-6 gerçek `user` kaydı oluşturur.
- Her biri için `createMemberProfile`'ı, önceki üyenin `referralCode`'unu
  sponsor kodu olarak vererek sırayla çağırır → gerçek `sponsorId` +
  `networkClosure` zinciri, gerçek sign-up kod yolundan geçerek oluşur (ayrı
  bir SQL insert script'i değil).
- 2-3 seviyeli, birkaç dallı küçük bir ağaç kurar (kök → 2 direkt ortak →
  her birinin altında 1-2 kişi).
- Başında `if (process.env.NODE_ENV === 'production') throw ...` guard'ı
  olur (`admin-setup.ts`'deki desenle tutarlı).

## Hata Yönetimi & Kenar Durumları

- `getMyProfile()` zaten `(app)/layout.tsx` tarafından garanti ediliyor
  (profil yoksa otomatik oluşturuluyor) → `getRealNetwork` içinde "root
  bulunamadı" senaryosu normal akışta oluşmaz, ekstra guard eklenmez.
- Sponsoru olmayan (`sponsorId: null`) bir üye kendi başına roottur —
  mevcut `createMemberProfile` mantığıyla tutarlı.
- `networkClosure`'da hiç satır yoksa (yeni üye, henüz kimse altına
  katılmamış) → `members = [root]`, boş downline — `buildSponsorTree` bunu
  zaten `children: []` olarak doğru işliyor, ek kod gerekmiyor.

## Test Planı

1. Migration (`drizzle-kit push`) gerçek DB'ye uygulanır, index doğrulanır.
2. Seed script çalıştırılıp gerçek DB'ye 5-6 kişilik ağaç yazılır.
3. Dev server başlatılıp `/partners` tarayıcıda **canlı** kontrol edilir:
   - doğru üye root olarak görünüyor mu
   - alt dallar doğru `sponsorId` zincirini yansıtıyor mu
   - `/career` sayfası aynı gerçek veriyle patlamadan render oluyor mu
4. Admin tarafı (`searchMembers`, zaten gerçek DB kullanıyor) seed'den gelen
   üyeleri de gösteriyor mu diye regresyon olarak kontrol edilir.
5. Otomatik test eklenmez — proje şu an hiç test altyapısına sahip değil,
   kapsam dışı.

## Bu Turun Dışında Bırakılanlar (bilinçli, ileride ayrı iş)

- `personalVolume` / `teamVolume` alanlarının gerçek yatırım/arbitraj
  akışından beslenmesi.
- Admin panelden manuel hacim girişi.
- Formal migration dosyaları (`generate`/`migrate` akışına geçiş).
