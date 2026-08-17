-- Persisted but fully isolated test records for the VELOX phase-1 simulator.
-- These rows never trigger a wallet, chain, payment, or authentication action.
CREATE TABLE IF NOT EXISTS demo_ledger_entry (
  id SERIAL PRIMARY KEY,
  run_key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  velox_id TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'demo_recorded',
  reference TEXT NOT NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_ledger_entry_run_idx
  ON demo_ledger_entry (run_key, occurred_at DESC);
CREATE INDEX IF NOT EXISTS demo_ledger_entry_user_idx
  ON demo_ledger_entry (user_id, occurred_at DESC);
