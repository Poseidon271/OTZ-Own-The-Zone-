-- ==============================================================================
-- OWN THE ZONE (OTZ) — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Table: vendor_submissions ("Join the OTZ Media Network")
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create vendor_submissions table
CREATE TABLE IF NOT EXISTS public.vendor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Media Owner / Vendor Information
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'OOH',
  
  -- Status & Administrative Management
  status TEXT NOT NULL DEFAULT 'New' 
    CHECK (status IN ('New', 'Contacted', 'In Review', 'Approved', 'Archived')),
  notes TEXT
);

-- 3. Indexes for high-performance searching & filtering
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_status ON public.vendor_submissions (status);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_media_type ON public.vendor_submissions (media_type);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_created_at ON public.vendor_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_email ON public.vendor_submissions (email);

-- 4. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_vendor_submissions_updated_at ON public.vendor_submissions;
CREATE TRIGGER set_vendor_submissions_updated_at
BEFORE UPDATE ON public.vendor_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.vendor_submissions ENABLE ROW LEVEL SECURITY;

-- 1. Public / Anon Insert: Anyone can submit the "Join the OTZ Media Network" vendor form
DROP POLICY IF EXISTS "Public can submit vendor applications" ON public.vendor_submissions;
CREATE POLICY "Public can submit vendor applications"
ON public.vendor_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Authenticated Admin Full Access (SELECT, UPDATE, DELETE)
-- Non-admin users cannot SELECT or modify vendor submissions
DROP POLICY IF EXISTS "Authenticated admin full access" ON public.vendor_submissions;
DROP POLICY IF EXISTS "Admin full access to vendor submissions" ON public.vendor_submissions;
CREATE POLICY "Admin full access to vendor submissions"
ON public.vendor_submissions
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com' 
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'ops')
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com' 
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'ops')
);

-- ==============================================================================
-- 5. REALTIME SUBSCRIPTIONS
-- ==============================================================================

-- Enable full row replication identity for comprehensive Realtime payloads
ALTER TABLE public.vendor_submissions REPLICA IDENTITY FULL;

-- Add vendor_submissions to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'vendor_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_submissions;
  END IF;
END $$;

