-- Enable RLS on all sensitive tables to block unauthorized public access via Supabase Data API.
-- Access via Prisma (Node.js backend) will continue to work if using the connection string with the 'postgres' user (superuser) or 'service_role' (bypasses RLS by default).

-- 1. App Tables
ALTER TABLE "shareholders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

-- 2. NextAuth Tables (Case-sensitive based on migration file)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Authenticator" ENABLE ROW LEVEL SECURITY;

-- 3. Create permissive policies for 'service_role'
-- Although 'service_role' usually bypasses RLS in Supabase, this ensures explicit access is granted if bypass is disabled.
-- 'postgres' user (superuser) always bypasses RLS.

-- Policy for shareholders
CREATE POLICY "Enable all access for service_role" ON "shareholders"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for applications
CREATE POLICY "Enable all access for service_role" ON "applications"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for payments
CREATE POLICY "Enable all access for service_role" ON "payments"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for messages
CREATE POLICY "Enable all access for service_role" ON "messages"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for certificates
CREATE POLICY "Enable all access for service_role" ON "certificates"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for settings
CREATE POLICY "Enable all access for service_role" ON "settings"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for NextAuth Tables
CREATE POLICY "Enable all access for service_role" ON "User"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for service_role" ON "Account"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for service_role" ON "Session"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for service_role" ON "VerificationToken"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for service_role" ON "Authenticator"
  AS PERMISSIVE FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
