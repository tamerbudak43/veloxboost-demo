CREATE TABLE IF NOT EXISTS kyc_profile (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "fullName" TEXT NOT NULL,
  "birthDate" TEXT NOT NULL,
  nationality TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  "addressLine" TEXT NOT NULL,
  "postalCode" TEXT,
  phone TEXT NOT NULL,
  "documentType" TEXT NOT NULL DEFAULT 'national_id',
  "documentNumber" TEXT NOT NULL,
  "documentExpiry" TEXT,
  "walletAsset" TEXT NOT NULL DEFAULT 'USDT',
  "walletNetwork" TEXT NOT NULL DEFAULT 'BEP20',
  "walletAddress" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  "consentAccepted" BOOLEAN NOT NULL DEFAULT FALSE,
  "submittedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kyc_profile_status_idx
  ON kyc_profile (status, "updatedAt" DESC);
