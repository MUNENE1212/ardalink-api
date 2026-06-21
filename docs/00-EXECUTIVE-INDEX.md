# 00 — Executive Index

**Owner**: CTO  ·  **Audience**: Executive, Board, Engineering Leads  ·  **Read**: 5 min  ·  **Next review**: Q3 2026

---

## Where we are

ArdaLink API is the **request-facing service** — the surface where herders
call in, the operator dashboard reads, and the public Talk app talks.

| Component | Status | Notes |
|---|---|---|
| Express 5 service | ✅ Skeleton | Live routes migrate in Phase 3 |
| Voice bridge (WebSocket) | ⏳ Migrating | Voice stream code (43 KB × 2) |
| Intelligence pipeline | ⏳ Migrating | NDVI delta → call decision |
| Ground truth capture | ⏳ Migrating | Drizzle ORM + PostgreSQL |
| Multi-tenant schema | 🔜 Phase 2 | Required before pilot expansion |
| CI gating | ✅ Configured | ESLint + tsc + vitest enforced |
| Container image | 🔜 Phase 5 | Distroless Node 24 |

## What we ship

One Express service that answers three classes of question: **should we call
this herder now** (intelligence), **what did the herder say** (ground truth),
**how is the system doing** (status + dashboards).

## Top risks

1. **WebSocket auth gap** — `/api/voice-stream` and `/api/browser-voice-stream`
   currently lack enforced auth. *Owner*: Phase 8 (security baseline).
2. **Live migration is large** — voice stream code is 86 KB combined.
   *Owner*: Phase 3, audited PR-by-PR.
3. **Single Postgres for operational + multi-tenant** — must land schema
   changes before pilot expansion. *Owner*: Phase 2.

## Top decisions needed

1. Tenant identity propagation: JWT claim vs. per-request header.
2. Africa's Talking HMAC verification key strategy.
3. Realtime API quota strategy for multi-ward pilot.

## What's next

| When | Milestone | KPI |
|---|---|---|
| Week 1 | Phase 3 code migration (routes + voice bridges) | v0.2.0 released |
| Week 2 | Multi-tenant schema landed | All routes tenant-scoped |
| Week 4 | Contract tests vs ardalink-engine green | No pilot regression |
| Q3 2026 | Multi-ward pilot | 500 households, 3 wards |