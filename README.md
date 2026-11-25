# BUNAYYA — KB–TK Islam Terpadu I & II

Website company profile statis untuk BUNAYYA I & II di Kabupaten Tangerang. Pengalaman dirancang dengan arah visual *Premium Modern Islamic School*: BUNAYYA blue, warm ivory, dan aksen emas yang tertahan.

## Fitur

- Halaman utama dan halaman unit terpisah untuk BUNAYYA I serta BUNAYYA II.
- Antarmuka Bahasa Indonesia–English dengan preferensi tersimpan.
- Hero carousel, editorial gallery, filter, lightbox keyboard, dan reduced-motion fallback.
- Kalkulator PPDB 2027/2028, tabel biaya, ringkasan WhatsApp, dan tiga brosur PDF dari `assets/content.json`.
- Struktur galeri manifest yang siap dikembangkan untuk ratusan foto tanpa menampilkan foto fiktif.
- GitHub Pages workflow dan konfigurasi static hosting Vercel.

## Menjalankan lokal

```bash
npm install
npm run serve
```

Buka `http://127.0.0.1:4173`. Tidak ada CMS, database, autentikasi, server function, atau pengumpulan data anak.

## Pengujian

```bash
npm test
npm run test:e2e
```

Playwright menguji desktop 1440 px, tablet 768 px, mobile 390 px dan 360 px. Untuk membuat ulang bukti visual di `evidence/screenshots/`, jalankan server lokal (`npm run serve`), lalu `node scripts/capture.mjs`. Hasil tangkapan layar bersifat sementara dan tidak disimpan dalam Git.

## Konten resmi

- Logo resmi: `assets/logo-bunayya.png` — jangan diubah warna atau proporsinya.
- Sumber data tunggal: `assets/content.json`.
- Generator PDF: `scripts/generate_brochures.py`.
- Foto resmi belum tersedia; placeholder diberi label jelas dan tidak diposisikan sebagai dokumentasi nyata.

Sebelum mengubah biaya, periode, atau kebijakan PPDB, cocokkan dengan materi resmi sekolah. Lima gambar brosur asli yang dirujuk dalam brief tidak tersedia pada paket maupun repository saat implementasi ini.
