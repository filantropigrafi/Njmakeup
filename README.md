## NJ Makeup – Admin & Catalog App

Aplikasi ini adalah **dashboard admin + katalog publik** untuk NJ Makeup, dibangun dengan **React (Vite)** dan **Firebase (Auth, Firestore, Storage)**.

### 1. Prasyarat

- **Node.js** (disarankan versi LTS terbaru)
- Akses ke **Firebase project** yang sudah dikonfigurasi (Auth + Firestore + Storage)

### 2. Konfigurasi Environment

Semua konfigurasi utama ada di file `.env.local` (tidak boleh di-commit ke git).

Minimal variabel yang perlu diisi:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Opsional (untuk analytics / integrasi lain):

- `VITE_FIREBASE_MEASUREMENT_ID`

Google Drive (untuk pemilihan gambar katalog via picker):

- `VITE_GOOGLE_DRIVE_API_KEY`
- `VITE_GOOGLE_DRIVE_FOLDER_ID`

> Catatan: di file `.env.local` saat ini juga ada prefix alternatif `NEXT_PUBLIC_...` agar kompatibel apabila config dipakai ulang di environment lain. Untuk Vite, yang utama adalah prefix `VITE_`.

### 3. Menjalankan Secara Lokal

1. Install dependencies:

   ```bash
   npm install
   ```

2. Pastikan `.env.local` sudah terisi dengan konfigurasi Firebase dan Google Drive yang benar.

3. Jalankan dev server:

   ```bash
   npm run dev
   ```

4. Buka browser ke:

   - `http://localhost:3000/`

### 4. Akun Admin & Role

Aplikasi ini menggunakan **Firebase Auth (Email/Password)**. Role admin ditentukan berdasarkan email dan disinkronkan dengan **Firestore Security Rules**.

- `admin@njmakeup.com` → `ADMIN_MASTER`
- `admin2@njmakeup.com` → `ADMIN_FITTING`

