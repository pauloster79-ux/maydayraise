-- Create admin user in Supabase
-- Run this in Supabase SQL Editor

INSERT INTO "User" (
  "id",
  "email",
  "name",
  "password",
  "role",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-user-001',
  'admin@maydaysaxonvale.co.uk',
  'Admin User',
  '$2b$10$EoIH5bjh7CrpDUxFw.TVauAYO7jv/U52fLqQty79qf4IEuLEeLa72',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT ("email") 
DO UPDATE SET
  "password" = EXCLUDED."password",
  "role" = 'admin',
  "updatedAt" = NOW();
