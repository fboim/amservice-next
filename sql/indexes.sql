-- Database Indexes for Performance
-- Run this in Supabase SQL Editor (use Service Role key for full access)

-- First, let's see all tables and their schemas
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE';

DO $$
DECLARE
  v_schema TEXT;
  v_table TEXT;
BEGIN
  -- Get current search path to find correct schema
  SELECT current_setting('search_path', true) INTO v_schema;
  RAISE NOTICE 'Current schema: %', v_schema;

  -- Loop through common table names and create indexes
  FOR v_table IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    RAISE NOTICE 'Found table: %', v_table;

    -- Create indexes based on table structure
    IF v_table = 'servis' THEN
      -- Check if columns exist before creating indexes
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servis' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_servis_status ON public.servis(status) WHERE deleted_at IS NULL;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servis' AND column_name = 'tanggal') THEN
        CREATE INDEX IF NOT EXISTS idx_servis_tanggal ON public.servis(tanggal) WHERE deleted_at IS NULL;
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servis' AND column_name = 'no_servis') THEN
        CREATE INDEX IF NOT EXISTS idx_servis_no_servis ON public.servis(no_servis);
      END IF;

      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servis' AND column_name = 'deleted_at') THEN
        CREATE INDEX IF NOT EXISTS idx_servis_deleted ON public.servis(deleted_at) WHERE deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_servis_status_tanggal ON public.servis(status, tanggal) WHERE deleted_at IS NULL;
      END IF;

    ELSIF v_table = 'pelanggan' THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pelanggan' AND column_name = 'no_hp') THEN
        CREATE INDEX IF NOT EXISTS idx_pelanggan_no_hp ON public.pelanggan(no_hp);
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pelanggan' AND column_name = 'nama') THEN
        CREATE INDEX IF NOT EXISTS idx_pelanggan_nama ON public.pelanggan(nama);
      END IF;

    ELSIF v_table = 'sparepart' THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sparepart' AND column_name = 'stok') THEN
        CREATE INDEX IF NOT EXISTS idx_sparepart_stok ON public.sparepart(stok) WHERE deleted_at IS NULL;
      END IF;

    ELSIF v_table = 'testimonials' THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active) WHERE is_active = true;
      END IF;

    END IF;
  END LOOP;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Verify indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;