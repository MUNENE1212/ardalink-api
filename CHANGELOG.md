# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Phase 2: Multi-tenant data model
  - `migrations/0001_multitenant.{up,down}.sql` — `tenants` + `tenant_feature_flags` + `tenant_id` on every operational table + RLS
  - `src/db/schema/tenants.ts` — Drizzle schemas for `tenants` and `tenant_feature_flags`
  - `src/lib/tenancy.ts` — `verifyJwt`, `attestTenant`, `tenantForwardHeaders`
  - `src/middlewares/tenant.ts` — Express middleware enforcing JWT on every non-public route
  - `tests/tenancy.test.ts` + `tests/middleware.test.ts` — unit + integration tests
  - `JWT_SECRET` and `TENANT_ATTESTATION_SECRET` added to `.env.example`
  - `pg` and `@types/pg` added to dependencies for Postgres access

## [0.1.0] - 2026-06-21

### Added
- Express 5 + TypeScript skeleton
- `/api/healthz` endpoint
- Vitest smoke test
- Canonical OpenAPI stub at `lib/api-spec/openapi.yaml`
- 8-doc CTO navigation under `docs/`
- ESLint + Prettier + tsc CI gating
- Dependabot, PR/issue templates, SECURITY.md

### Notes
- Live source migrates from `MUNENE1212/ardalink-ai` in Phase 3.
- Voice bridges (`voiceStream.ts`, `voiceStreamBrowser.ts`), intelligence
  pipeline, and ground-truth schema land in v0.2.0.