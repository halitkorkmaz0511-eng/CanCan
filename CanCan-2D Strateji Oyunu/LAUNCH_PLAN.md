# CanCan 2D Launch Plan

Bu dosya, oyuncu yokken en mantikli sirayla ilk trafik ve geri bildirim toplamak icin hazirlandi.

## 1. Deploy Sonrasi Kontrol

- Vercel deploy tamamlaninca `https://cancan-ten.vercel.app/` adresini ac.
- Ana sayfanin oyunu direkt actigini kontrol et.
- Online modda host olustur, `Davet Linki Kopyala` ile link al.
- Linki gizli sekmede ac ve join ayarlarinin otomatik doldugunu kontrol et.
- Bir mac bitir ve `Sonucu Paylas` butonunun metni kopyaladigini veya native paylasim penceresini actigini kontrol et.

## 2. Google Search Console

- `https://search.google.com/search-console` uzerinden domain veya URL-prefix mulku ekle.
- Sitemap olarak bunu gonder:

```text
https://cancan-ten.vercel.app/sitemap.xml
```

- URL Inspection ile ana sayfayi test et:

```text
https://cancan-ten.vercel.app/
```

- "Request indexing" ile ilk indeksleme istegini gonder.

## 3. Itch.io Sayfa Metni

Baslik:

```text
CanCan 2D - Free Online Strategy Game
```

Kisa aciklama:

```text
Create a room, share a link, and challenge a friend in a fast browser-based 2D strategy match.
```

Uzun aciklama:

```text
CanCan 2D is a free browser strategy game where two players fight on a tactical grid. Pick a map, choose characters, collect powers, avoid traps, and defeat your opponent by outplaying their movement.

The game supports local play on the same device and online rooms with invite links. No download is required.
```

Etiketler:

```text
strategy, browser, html5, multiplayer, 2d, turn-based, free, online
```

## 4. Reddit / Forum Tanitim Metinleri

Ingilizce:

```text
I made a free browser-based 2D strategy game called CanCan 2D. You can create an online room, share a link with a friend, pick characters, collect powers, and fight on a tactical grid.

I am still improving the game and would love feedback on balance, clarity, and whether the online flow feels easy enough.

Play: https://cancan-ten.vercel.app/
```

Turkce:

```text
Arkadasimla birlikte CanCan 2D adinda ucretsiz bir tarayici strateji oyunu gelistiriyoruz. Oda kurup link paylasabiliyorsunuz, karakter secip 2D taktik haritada gucleri toplayarak rakibi yenmeye calisiyorsunuz.

Oyun henuz erken asamada. Denge, anlasilirlik ve online oda akisi hakkinda geri bildirim almak isteriz.

Oyna: https://cancan-ten.vercel.app/
```

## 5. Ilk Hafta Hedefleri

- 5 farkli yerde tanitim yap.
- En az 20 kisiye oynat ve geri bildirim al.
- En cok karisiklik yaratan 3 noktayi not et.
- Oyun baslama, oda kurma ve mac bitirme akisinda takilanlari onceliklendir.
- Para kazanma adimlarina gecmeden once gunluk en az 50-100 ziyaretci hedefle.

## 6. Tamamlanan Kod Oncelikleri

- Bot'a karsi oynama modu eklendi. Tek gelen oyuncu beklemeden oyun deneyebilir.
- Mac sonu paneli ve `Sonucu Paylas` akisi eklendi.
- Bu cihaz icin basit yerel istatistikler eklendi: ziyaret, baslama, bitis, paylasim.

## 7. Sonraki Kod Oncelikleri

1. Gercek ziyaretci analitigi icin Vercel Analytics veya Plausible ekle.
2. Bot zekasina karakter yeteneklerini kademeli ekle.
3. Skor tablosu ve sezon sistemi icin veri modelini tasarla.
4. 2.5D Three.js prototipini ayri dosyada dene.
5. Kitle olusunca destek/kozmetik sayfasini ekle.
