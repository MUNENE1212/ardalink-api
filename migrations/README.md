# ArdaLink API — Database Migrations

SQL migrations applied manually with `psql`. Forward `*.up.sql`, rollback
`*.down.sql`.

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/ardalink

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0001_multitenant.up.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0001_multitenant.down.sql  # rollback
```

## Current

| # | Name | Purpose |
|---|---|---|
| 0001 | multitenant | `tenants` + `tenant_feature_flags` + `tenant_id` on every operational table + RLS |

## Conventions
- `NNNN_short_slug.up.sql` and `NNNN_short_slug.down.sql`.
- Never edit a migration after it has been applied to a shared environment.
- Drizzle schema lives in `src/db/schema/` and is generated/edited alongside
  each migration so the TypeScript model and the SQL model never diverge.