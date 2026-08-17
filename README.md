# VELOX local development

This repository is a development prototype. Do not connect real customer funds,
private keys, or exchange credentials to it until the ledger, withdrawal,
KYC, audit, and security phases have been independently reviewed.

## Start locally

1. Install PostgreSQL 16+ and create an empty `velox` database.
2. Copy `.env.example` to `.env.local` and set a local `DATABASE_URL`.
3. Install dependencies with `pnpm install --frozen-lockfile`.
4. Create the existing auth/application tables through the project's DB setup,
   then run `pnpm db:migrate` for VELOX foundation constraints.
5. Run `pnpm dev` and open `http://localhost:3000`.

## What is safe to demo today

UI flows, account signup, sponsor network, career configuration, and admin
screen interactions can be developed locally. The displayed financial and
arbitrage values remain demo-only until the ledger phase replaces every
`demo-data.ts` source.

## Next development order

1. Replace demo network reads with `member` + `network_closure` queries.
2. Add immutable wallet/ledger tables and transaction tests.
3. Bind withdrawals to ledger reservations, KYC, 2FA, and audit events.
4. Add controlled/testnet deposit processing before any live blockchain use.
