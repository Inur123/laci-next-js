# Ringkasan Proyek

**Laci Digital** adalah sistem informasi manajemen terintegrasi untuk PC IPNU IPPNU Kabupaten Magetan. Fokusnya mendigitalisasi administrasi organisasi, memusatkan data anggota, mempercepat alur surat-menyurat, dan menyediakan monitoring keaktifan organisasi secara real-time.

## Fitur Utama

- Dashboard monitoring cabang, statistik, leaderboard PAC, dan visualisasi data
- Manajemen anggota, profil, verifikasi email, dan status keaktifan
- Arsip surat masuk/keluar, berkas pimpinan, dan berkas SP
- Pengajuan dokumen PAC dengan alur verifikasi ke Cabang
- Manajemen periode kepengurusan dan kalender kegiatan
- Log aktivitas (audit trail) dengan filter dan monitoring live
- Manajemen user PAC untuk peran sekretaris cabang

## Arsitektur & Teknologi

- Next.js 16 App Router dengan React 19 dan Tailwind CSS v4
- Prisma ORM dan PostgreSQL sebagai basis data
- Auth.js v5 dengan role-based access control
- Sinkronisasi data lewat refresh berkala di client
- Recharts untuk grafik dan React Day Picker untuk kalender
- Google Recaptcha v3 untuk proteksi form autentikasi
- Resend/Nodemailer untuk email verifikasi dan notifikasi
- Penyimpanan berkas terenkripsi dan integrasi Cloudflare R2

## Struktur Direktori Kunci

- `src/app` untuk routing, layout, dan server actions
- `src/components/features` untuk komponen fitur domain
- `src/components/ui` untuk komponen UI berbasis shadcn
- `src/lib` untuk utilitas: auth, email, enkripsi, storage, prisma
- `prisma` untuk skema database, migrasi, dan seed
- `scripts` untuk skrip pemeriksaan data

## Model Data Utama

- User, Periode, Anggota
- ArsipSurat, BerkasPimpinan, BerkasSP
- PengajuanPAC, Kegiatan
- LogActivity, EmailVerificationToken, AllowedOrigin
- Enum: Role, JenisSurat, Organisasi, StatusPengajuan, LogAction, LogModule

## Alur Otentikasi & Akses

- Role utama: SEKRETARIS_CABANG dan SEKRETARIS_PAC
- Akses fitur diproteksi berdasarkan role dan status verifikasi email
- Event login/logout tercatat pada log aktivitas

## Skrip & Otomasi

- `npm run dev` untuk pengembangan
- `npm run build` dan `npm run start` untuk produksi
- `npm run lint` untuk linting
- Prisma seed dengan `tsx prisma/seed.ts`

## Catatan Privasi

Proyek ini bersifat internal milik PC IPNU IPPNU Kabupaten Magetan dan tidak untuk didistribusikan tanpa izin resmi.
