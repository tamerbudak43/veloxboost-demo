CREATE TABLE IF NOT EXISTS cashback_tier (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "fromDepth" INTEGER NOT NULL DEFAULT 1,
  "toDepth" INTEGER NOT NULL DEFAULT 1,
  "requiredTeamVolume" NUMERIC NOT NULL DEFAULT '0',
  "requiredDirectPartners" INTEGER NOT NULL DEFAULT 0,
  "cashbackAmount" NUMERIC NOT NULL DEFAULT '0',
  "dailyWithdrawalLimit" NUMERIC NOT NULL DEFAULT '0',
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS cashback_tier_display_order_idx
  ON cashback_tier ("displayOrder");
