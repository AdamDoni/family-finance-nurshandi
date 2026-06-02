# Setup Guide — Family Finance App

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Google Sheets

### Buat Google Spreadsheet Baru
1. Buka [sheets.google.com](https://sheets.google.com) → buat spreadsheet baru
2. Rename Sheet1 menjadi `transactions`
3. Copy **Spreadsheet ID** dari URL:  
   `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`

### Buat Google Service Account
1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat project baru (atau pakai yang existing)
3. Enable **Google Sheets API** di Library
4. Menu **IAM & Admin → Service Accounts → Create Service Account**
5. Isi nama → Create → Skip optional steps
6. Klik service account yang baru dibuat → tab **Keys → Add Key → JSON**
7. Download file JSON — catat `client_email` dan `private_key`

### Share Spreadsheet ke Service Account
1. Buka spreadsheet Google Sheets
2. Share → masukkan email service account (dari JSON) → Editor

## 3. Setup Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Atau pakai: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### Generate Password Hash
```bash
npm run gen-password
```
Masukkan password untuk Adam dan Rifda → copy hash ke `.env.local`

### Isi .env.local
```env
NEXTAUTH_URL=https://family.integratedfarming.id
NEXTAUTH_SECRET=hasil-dari-openssl

ADAM_PASSWORD_HASH=hasil-dari-gen-password
RIFDA_PASSWORD_HASH=hasil-dari-gen-password

GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nisi-private-key\n-----END RSA PRIVATE KEY-----"

GOOGLE_SPREADSHEET_ID=id-spreadsheet-dari-url
```

> **Penting:** `GOOGLE_PRIVATE_KEY` — salin seluruh private key dari JSON,  
> ganti newline `\n` yang ada di JSON dengan literal `\n` (backslash-n) dalam satu baris string.

## 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 5. Deploy ke Server

### Build
```bash
npm run build
npm start
```

### Nginx Config (contoh)
```nginx
server {
    server_name family.integratedfarming.id;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 (recommended)
```bash
npm install -g pm2
pm2 start npm --name "family-finance" -- start
pm2 save
pm2 startup
```

## Struktur Google Sheets

Sheet `transactions` akan otomatis terisi dengan kolom:

| id | date | type | category | description | amount | who | notes | createdAt |
|----|------|------|----------|-------------|--------|-----|-------|-----------|
| abc123 | 2026-05-17 | expense | kebutuhan-anak | Beli susu Heizen | 250000 | Adam | | 2026-05-17T... |

Kolom bisa ditambah formula/pivot di sheet lain untuk analisis tambahan.

## Kategori yang Tersedia

**Pengeluaran:** Angsuran Bulanan, Transportasi, Makan, Rumah Tangga, Kebutuhan Anak, Lain-lain

**Pemasukan:** Gaji, Bisnis/Usaha, Investasi, Lain-lain
