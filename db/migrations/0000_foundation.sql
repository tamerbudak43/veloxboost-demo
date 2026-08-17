-- VELOX foundation migration - run once against an empty PostgreSQL database.
-- Financial tables deliberately use NUMERIC. This migration does not contain
-- wallet keys, seed passwords, or any production secrets.

CREATE TABLE IF NOT EXISTS network_closure (
  id SERIAL PRIMARY KEY,
  "ancestorUserId" TEXT NOT NULL,
  "descendantUserId" TEXT NOT NULL,
  depth INTEGER NOT NULL CHECK (depth BETWEEN 1 AND 33),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT network_closure_ancestor_descendant_uq UNIQUE ("ancestorUserId", "descendantUserId")
);

CREATE INDEX IF NOT EXISTS network_closure_ancestor_depth_idx
  ON network_closure ("ancestorUserId", depth);
CREATE INDEX IF NOT EXISTS network_closure_descendant_idx
  ON network_closure ("descendantUserId");

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  "actorUserId" TEXT,
  action TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log ("entityType", "entityId");
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON audit_log ("actorUserId", "createdAt");
