<div align="center">

# ArdaLink API

### Voice, intelligence pipeline, ground-truth capture

ArdaLink API is the request-facing service: it composes voice calls, runs the
drought intelligence pipeline, captures herder ground truth, and serves data
APIs to the operator dashboard and public Talk app.

[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](#license)

</div>

---

## Quickstart

```bash
# Requires Node 24 and pnpm 9
pnpm install
cp .env.example .env       # edit with your credentials
pnpm run dev               # starts Express on :3000

curl http://localhost:3000/api/healthz
```

Open `http://localhost:3000/api/docs` for the interactive API.

---

## What this service does

| Capability                                         | Endpoint                       |
| -------------------------------------------------- | ------------------------------ | ---- | ------------------------- |
| Intelligence pipeline (NDVI delta → call decision) | `POST /api/trigger-check`      |
| Current drought status snapshot                    | `GET /api/status`              |
| Voice call bridge (phone)                          | `WS /api/voice-stream`         |
| Voice call bridge (browser)                        | `WS /api/browser-voice-stream` |
| Africa's Talking callback (returns `<Stream>`)     | `POST /api/voice-callback`     |
| One-shot call token                                | `POST /api/call-tokens`        |
| Ground truth reports                               | `GET /api/ground-truth/recent` |
| Pastoralist directory CRUD                         | `GET                           | POST | DELETE /api/pastoralists` |
| Health probe                                       | `GET /api/healthz`             |

Full route list: [`docs/02-API.md`](docs/02-API.md).

---

## Repository layout

```
ardalink-api/
├── src/
│   ├── index.ts            # Express bootstrap
│   ├── app.ts              # middleware chain
│   ├── routes/             # intelligence, voice, ground-truth, …
│   ├── lib/                # openai, satellite, climate, memory, …
│   └── middlewares/        # auth, rate limit, origin guard
├── lib/
│   ├── api-spec/           # canonical OpenAPI (single source of truth)
│   ├── api-zod/            # generated Zod schemas
│   ├── api-client-react/   # generated React Query hooks (consumed by ardalink-web)
│   └── db/                 # Drizzle ORM (PostgreSQL public schema)
├── tests/                  # vitest (unit + integration + contract)
├── docs/                   # 8-doc CTO navigation
├── Dockerfile
└── package.json
```

---

## Documentation

Start with [`docs/00-EXECUTIVE-INDEX.md`](docs/00-EXECUTIVE-INDEX.md) (5 min).

---

## Sister repos

- [`MUNENE1212/ardalink-engine`](https://github.com/MUNENE1212/ardalink-engine) — biophysical brain
- [`MUNENE1212/ardalink-web`](https://github.com/MUNENE1212/ardalink-web) — operator dashboard and Talk app

---

## License

Proprietary — all rights reserved. Contact the maintainer before any reuse or distribution.
