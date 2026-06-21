-- =============================================================================
-- Migration 0001 — Multi-tenant data model (forward)
-- =============================================================================
--
-- Targets the `public` schema used by ardalink-api. Mirrors the engine's
-- `gis_engine` migration: adds `tenant_id` to every operational table, creates
-- the `tenants` registry (authoritative, owned by this service), creates
-- `tenant_feature_flags`, and enables Row-Level Security.
--
-- Apply with:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0001_multitenant.up.sql
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Tenants registry (authoritative — also read by ardalink-engine).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
    tenant_id     TEXT PRIMARY KEY,
    display_name  TEXT NOT NULL,
    region        TEXT NOT NULL,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.tenants (tenant_id, display_name, region)
VALUES
    ('bula-pesa',  'Bula Pesa Ward',  'Isiolo County'),
    ('garbatulla', 'Garbatulla Ward', 'Isiolo County'),
    ('merti',      'Merti Ward',      'Isiolo County')
ON CONFLICT (tenant_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Tenant feature flags.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_feature_flags (
    tenant_id     TEXT NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
    flag_key      TEXT NOT NULL,
    enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, flag_key)
);

INSERT INTO public.tenant_feature_flags (tenant_id, flag_key, enabled)
VALUES
    ('bula-pesa',  'voice_outbound', TRUE),
    ('bula-pesa',  'public_talk',    TRUE),
    ('bula-pesa',  'ground_truth',   TRUE),
    ('garbatulla', 'voice_outbound', TRUE),
    ('garbatulla', 'ground_truth',   TRUE),
    ('merti',      'voice_outbound', FALSE),
    ('merti',      'ground_truth',   TRUE)
ON CONFLICT (tenant_id, flag_key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Add tenant_id to every existing operational table.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT c.relname AS tbl
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relname NOT IN ('tenants', 'tenant_feature_flags')
    LOOP
        EXECUTE format(
            'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id TEXT',
            rec.tbl
        );
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)',
            rec.tbl || '_tenant_id_idx',
            rec.tbl
        );
    END LOOP;
END
$$;

-- -----------------------------------------------------------------------------
-- 4. Row-Level Security on operational tables.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT c.relname AS tbl
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relname NOT IN ('tenants', 'tenant_feature_flags')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.tbl);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', rec.tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', rec.tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON public.%I '
            'USING (tenant_id = current_setting(''app.current_tenant_id'', TRUE)) '
            'WITH CHECK (tenant_id = current_setting(''app.current_tenant_id'', TRUE))',
            rec.tbl
        );
    END LOOP;
END
$$;

COMMIT;