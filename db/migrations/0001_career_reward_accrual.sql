CREATE TABLE IF NOT EXISTS career_reward_accrual (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "careerCode" TEXT NOT NULL,
  "totalEntitlement" NUMERIC NOT NULL CHECK ("totalEntitlement" >= 0),
  "previouslyAccrued" NUMERIC NOT NULL DEFAULT 0 CHECK ("previouslyAccrued" >= 0),
  "deltaAmount" NUMERIC NOT NULL CHECK ("deltaAmount" >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'reversed')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT career_reward_accrual_user_career_uq UNIQUE ("userId", "careerCode")
);
CREATE INDEX IF NOT EXISTS career_reward_accrual_user_created_idx
  ON career_reward_accrual ("userId", "createdAt");
