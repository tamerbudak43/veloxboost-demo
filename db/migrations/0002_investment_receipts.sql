-- VELOX member investment receipt records.
-- These documents are operational transaction summaries, not tax invoices.

CREATE TABLE IF NOT EXISTS investment_receipt (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  asset TEXT NOT NULL DEFAULT 'USDT',
  network TEXT NOT NULL DEFAULT 'TRC20',
  "receivingAddress" TEXT NOT NULL,
  "transactionHash" TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  "issuedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "confirmedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_receipt_user_issued_idx
  ON investment_receipt ("userId", "issuedAt");
CREATE INDEX IF NOT EXISTS investment_receipt_status_idx
  ON investment_receipt (status, "issuedAt");
