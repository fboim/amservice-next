-- Database Indexes for Performance
-- Run this in Supabase SQL Editor

-- Index untuk servis table (most used queries)
CREATE INDEX IF NOT EXISTS idx_servis_status ON servis(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_servis_tanggal ON servis(tanggal) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_servis_no_servis ON servis(no_servis);
CREATE INDEX IF NOT EXISTS idx_servis_deleted ON servis(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_servis_status_tanggal ON servis(status, tanggal) WHERE deleted_at IS NULL;

-- Index untuk pelanggan
CREATE INDEX IF NOT EXISTS idx_pelanggan_no_hp ON pelanggan(no_hp);
CREATE INDEX IF NOT EXISTS idx_pelanggan_nama ON pelanggan(nama);

-- Index untuk sparepart
CREATE INDEX IF NOT EXISTS idx_sparepart_stok ON sparepart(stok) WHERE deleted_at IS NULL;

-- Index untuk testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active) WHERE is_active = true;

-- Analyze tables to update statistics
ANALYZE servis;
ANALYZE pelanggan;
ANALYZE sparepart;
ANALYZE testimonials;