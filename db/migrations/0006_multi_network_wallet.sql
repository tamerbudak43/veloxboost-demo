-- VELOX multi-network USDT deposit metadata.
-- Memo/tag is required for networks such as TON when the configured receiving
-- service uses a shared address. Existing TRC20 records remain valid with NULL.

ALTER TABLE investment_receipt
  ADD COLUMN IF NOT EXISTS "depositMemo" TEXT;

CREATE INDEX IF NOT EXISTS investment_receipt_network_status_idx
  ON investment_receipt (network, status, "issuedAt");
