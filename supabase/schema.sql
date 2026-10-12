-- ==============================================================================
-- OWN THE ZONE (OTZ) — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES TABLE (Linked to auth.users.id)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- User Information
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'brand' 
    CHECK (role IN ('brand', 'host', 'admin', 'ops', 'user')),
  avatar_url TEXT,
  
  -- Brand / Media Preferences
  niche TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  primary_goal TEXT,
  budget_band TEXT,
  geography TEXT,
  timeline TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Helper trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Automatic trigger to create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    phone, 
    company, 
    role,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'company', NEW.raw_user_meta_data->>'company_name', 'Personal Account'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'brand'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    avatar_url = COALESCE(NULLIF(public.profiles.avatar_url, ''), EXCLUDED.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. BRAND MEDIA REQUESTS TABLE (Campaign & Channel Requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.brand_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  media_channel TEXT NOT NULL,
  request_details JSONB DEFAULT '{}'::jsonb,
  
  status TEXT NOT NULL DEFAULT 'New' 
    CHECK (status IN ('New', 'Contacted', 'Proposal Shared', 'In Review', 'Confirmed', 'Archived')),
  admin_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_brand_requests_user_id ON public.brand_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_brand_requests_email ON public.brand_requests (email);
CREATE INDEX IF NOT EXISTS idx_brand_requests_status ON public.brand_requests (status);
CREATE INDEX IF NOT EXISTS idx_brand_requests_created_at ON public.brand_requests (created_at DESC);

DROP TRIGGER IF EXISTS set_brand_requests_updated_at ON public.brand_requests;
CREATE TRIGGER set_brand_requests_updated_at
BEFORE UPDATE ON public.brand_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ENQUIRIES TABLE (Direct Marketplace & Service Enquiries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  type TEXT NOT NULL DEFAULT 'listing',
  source TEXT DEFAULT 'marketplace',
  referenced_listing_id TEXT,
  listing_title TEXT,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  user_company TEXT,
  message TEXT NOT NULL,
  budget_band TEXT,
  timeline TEXT,
  sponsorship_tier TEXT,
  stage TEXT NOT NULL DEFAULT 'Enquiry received',
  assignee TEXT DEFAULT 'ops-unassigned',
  notes JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_email ON public.enquiries (user_email);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);

DROP TRIGGER IF EXISTS set_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER set_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. VENDOR SUBMISSIONS TABLE ("Join the OTZ Media Network")
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'OOH',
  
  status TEXT NOT NULL DEFAULT 'New' 
    CHECK (status IN ('New', 'Contacted', 'In Review', 'Approved', 'Archived')),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_vendor_submissions_user_id ON public.vendor_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_status ON public.vendor_submissions (status);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_media_type ON public.vendor_submissions (media_type);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_created_at ON public.vendor_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_email ON public.vendor_submissions (email);

DROP TRIGGER IF EXISTS set_vendor_submissions_updated_at ON public.vendor_submissions;
CREATE TRIGGER set_vendor_submissions_updated_at
BEFORE UPDATE ON public.vendor_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. SAVED LISTINGS TABLE (User Bookmarks / Saved Bag Items)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL,
  listing_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON public.saved_listings (user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Helper admin check expression
-- (auth.jwt() ->> 'email' = 'adminotz@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops'))

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
)
WITH CHECK (
  auth.uid() = id
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- BRAND REQUESTS POLICIES
DROP POLICY IF EXISTS "Public can submit brand requests" ON public.brand_requests;
CREATE POLICY "Public can submit brand requests"
ON public.brand_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own brand requests" ON public.brand_requests;
CREATE POLICY "Users can view their own brand requests"
ON public.brand_requests FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR email = auth.jwt() ->> 'email'
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

DROP POLICY IF EXISTS "Admin full access to brand requests" ON public.brand_requests;
CREATE POLICY "Admin full access to brand requests"
ON public.brand_requests FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

-- ENQUIRIES POLICIES
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
ON public.enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own enquiries" ON public.enquiries;
CREATE POLICY "Users can view their own enquiries"
ON public.enquiries FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR user_email = auth.jwt() ->> 'email'
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

DROP POLICY IF EXISTS "Admin full access to enquiries" ON public.enquiries;
CREATE POLICY "Admin full access to enquiries"
ON public.enquiries FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

-- VENDOR SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Public can submit vendor applications" ON public.vendor_submissions;
CREATE POLICY "Public can submit vendor applications"
ON public.vendor_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own vendor submissions" ON public.vendor_submissions;
CREATE POLICY "Users can view their own vendor submissions"
ON public.vendor_submissions FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR email = auth.jwt() ->> 'email'
  OR auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

DROP POLICY IF EXISTS "Admin full access to vendor submissions" ON public.vendor_submissions;
CREATE POLICY "Admin full access to vendor submissions"
ON public.vendor_submissions FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'adminotz@gmail.com'
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'ops')
);

-- SAVED LISTINGS POLICIES
DROP POLICY IF EXISTS "Users manage their own saved listings" ON public.saved_listings;
CREATE POLICY "Users manage their own saved listings"
ON public.saved_listings FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
ALTER TABLE public.vendor_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.brand_requests REPLICA IDENTITY FULL;
ALTER TABLE public.enquiries REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'vendor_submissions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_submissions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'brand_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_requests;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'enquiries') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  END IF;
END $$;


