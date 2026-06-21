# 04 — Security

[← Deployment](03-DEPLOYMENT.md) · [Next: Observability →](05-OBSERVABILITY.md)

## Threat model (summary)

| Surface | Threat | Control |
|---|---|---|
| Every API request | Token theft, replay | JWT (HS256) verified per request (v0.2.0) |
| Downstream `ardalink-engine` | Tenant id spoofing | HMAC-SHA256 attestation header (v0.2.0) |
| WebSocket upgrades | Hijack, denial-of-wallet | JWT auth on upgrade (Phase 8) |
| Africa's Talking callback | Forged call events | HMAC verify (Phase 8) |
| Azure OpenAI key | Token theft | Cloud secret manager (Phase 8) |
| Ground truth DB | Cross-tenant leak | Row-Level Security (v0.2.0) |

## Multi-tenant isolation (v0.2.0)

JWTs carry a `tenant_id` claim. The middleware (`src/middlewares/tenant.ts`)
verifies and attaches it to the request. Every operational table in the
`public` schema carries a `tenant_id` column with RLS enabled
(see `migrations/0001_multitenant.up.sql`). A connection used without setting
`app.current_tenant_id` returns zero rows from every scoped table.

The shared `TENANT_ATTESTATION_SECRET` is the trust bridge between this
service and `ardalink-engine` — never run production with an empty value.

## Secrets

- `.env.example` only in git
- `gitleaks` pre-commit
- Production secrets in cloud secret manager (Phase 8)

Full threat model migrates from legacy in Phase 7.