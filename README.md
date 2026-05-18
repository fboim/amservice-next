# AM Service - Next.js + Supabase

Sistem manajemen servis smartphone berbasis Next.js dengan database Supabase PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14 (React)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth / Custom JWT
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Fitur

- [x] Login / Authentication
- [x] Dashboard dengan statistik
- [x] Data Servis (CRUD)
- [x] Cek Status Servis publik
- [x] Data Sparepart
- [x] WhatsApp integration
- [x] Nota PDF generation
- [ ] Laporan
- [ ] Pengaturan toko

## Setup

### 1. Clone Repository
```bash
git clone https://github.com/fboim/amservice-next.git
cd amservice-next
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-min-32-chars
```

### 4. Get Supabase Keys

1. Buka [supabase.com](https://supabase.com)
2. Buka project AM Service
3. Settings → API
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Database Setup

Jalankan SQL berikut di Supabase SQL Editor untuk membuat tabel:

```sql
-- Admin table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admin (username, password, role) VALUES (
    'admin',
    '$2a$10$...', -- bcrypt hash of 'admin123'
    'admin'
);

-- Servis table
CREATE TABLE servis (
    id SERIAL PRIMARY KEY,
    no_servis VARCHAR(20) UNIQUE NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    nama_pelanggan VARCHAR(200),
    no_hp VARCHAR(20),
    merk_hp VARCHAR(100),
    tipe_hp VARCHAR(100),
    keluhan TEXT,
    status VARCHAR(20) DEFAULT 'Antrean',
    estimasi_biaya VARCHAR(50),
    garansi VARCHAR(50),
    modal_sparepart INTEGER DEFAULT 0,
    foto_hp VARCHAR(255),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sparepart table
CREATE TABLE sparepart (
    id SERIAL PRIMARY KEY,
    nama_sparepart VARCHAR(200) NOT NULL,
    stok INTEGER DEFAULT 0,
    harga INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pengaturan table
CREATE TABLE pengaturan (
    id SERIAL PRIMARY KEY,
    nama_toko VARCHAR(200) DEFAULT 'AM SERVICE',
    no_wa VARCHAR(20),
    alamat TEXT,
    link_maps TEXT,
    snk_penerimaan TEXT,
    snk_garansi TEXT
);

-- Row Level Security (RLS)
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE servis ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;

-- Policy untuk servis
CREATE POLICY "Allow all" ON servis FOR ALL USING (true);
CREATE POLICY "Allow all" ON admin FOR ALL USING (true);
CREATE POLICY "Allow all" ON sparepart FOR ALL USING (true);
CREATE POLICY "Allow all" ON pengaturan FOR ALL USING (true);
```

### 6. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/fboim/amservice-next.git
git push -u origin main
```

### 2. Connect ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Import project dari GitHub
3. Tambahkan environment variables di Vercel dashboard
4. Deploy!

### 3. Setup Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Tambahkan `amservice.web.id`
3. Update DNS di Cloudflare

## Project Structure

```
amservice-next/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/
│   │   │   ├── servis/
│   │   │   ├── sparepart/
│   │   │   └── dashboard/
│   │   ├── dashboard/
│   │   ├── servis/
│   │   ├── sparepart/
│   │   └── login/
│   ├── components/
│   └── lib/               # Utility functions
├── public/
├── package.json
└── vercel.json
```

## License

MIT