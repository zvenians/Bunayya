# Verifikasi Konten dan Biaya

Lima gambar brosur asli yang disebut brief tidak tersedia. Verifikasi ini menguji konsistensi internal paket dan angka yang diwajibkan pengguna, bukan kecocokan visual terhadap gambar sumber yang hilang.

## Biaya 2027/2028

| Jenjang | Penjumlahan item | Total resmi | Status |
|---|---:|---:|---|
| KB | Rp6.525.000 | Rp6.525.000 | cocok |
| TK A | Rp7.005.000 | Rp7.005.000 | cocok |
| TK B | Rp6.555.000 | Rp6.555.000 | cocok |

| Periode pelunasan | Potongan | Status |
|---|---:|---|
| November 2026 | Rp750.000 | cocok |
| Desember 2026 | Rp500.000 | cocok |
| Januari–Februari 2027 | Rp250.000 | cocok |
| Maret–Juni 2027 | Rp0 | cocok |

Sumber tunggal `assets/content.json` memasok kalkulator, tabel, ringkasan WhatsApp, dan generator PDF. Tes `tests/data.test.mjs` memblokir drift total dan diskon.

## Kebijakan

Empat paragraf kebijakan potongan/pengembalian dipertahankan verbatim dari paket v3 dalam Bahasa Indonesia. Pada mode English, teks Indonesia tetap ditampilkan sebagai otoritatif dan diberi catatan bahwa terjemahan hanya bersifat informasional.

## PDF

- Profil: 2 halaman, teks dapat diekstrak.
- Biaya: 3 halaman, teks dapat diekstrak.
- Paket lengkap: 4 halaman, teks dapat diekstrak.
- Ketiga file dirender ke PNG dan diperiksa untuk clipping, overlap, keterbacaan, logo, header/footer, dan nomor halaman.
