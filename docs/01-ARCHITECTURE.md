# 01 — Architecture

[← Executive Index](00-EXECUTIVE-INDEX.md) · [Next: API →](02-API.md)

## At a glance

```
Africa's Talking / browser ──► Express ──┬──► ardalink-engine (X-Tenant-ID + Sig)
                                        ├──► PostgreSQL public schema (RLS on)
                                        ├──► Azure Cosmos DB (baselines)
                                        ├──► Azure OpenAI (GPT-4o + Realtime)
                                        └──► Google Earth Engine (via engine)
```

## Multi-tenant model (v0.2.0)

Every request must carry a JWT in `Authorization: Bearer <token>`. The middleware
in `src/middlewares/tenant.ts` verifies the signature and attaches the
`tenant_id` claim to `req.tenant`. Downstream calls to `ardalink-engine`
forward `X-Tenant-ID` and `X-Tenant-Sig` headers (HMAC-SHA256 with the shared
`TENANT_ATTESTATION_SECRET`).

Postgres RLS policies on the `public` schema enforce isolation. The session
variable `app.current_tenant_id` is bound per-request via Drizzle middleware
(lands in Phase 3).

## Routes (planned v0.2.0)

- `POST /api/trigger-check` — run the intelligence pipeline
- `GET /api/status` — drought snapshot
- `POST /api/voice-callback` — Africa's Talking XML stream
- `WS /api/voice-stream` — phone ↔ Realtime bridge
- `WS /api/browser-voice-stream` — browser ↔ Realtime bridge
- `POST /api/call-tokens` — mint one-shot call tokens
- `GET /api/ground-truth/recent`
- `GET|POST|DELETE /api/pastoralists`
- `GET /api/healthz`
- `GET /api/whoami` — returns the verified tenant_id claim (debug)