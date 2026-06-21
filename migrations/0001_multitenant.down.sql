-- =============================================================================
-- Migration 0001 — Multi-tenant data model (rollback)
-- =============================================================================

BEGIN;

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
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', rec.tbl);
        EXECUTE format('ALTER TABLE public.%I NO FORCE ROW LEVEL SECURITY', rec.tbl);
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', rec.tbl);
        EXECUTE format('DROP INDEX IF EXISTS public.%I', rec.tbl || '_tenant_id_idx');
        EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS tenant_id', rec.tbl);
    END LOOP;
END
$$;

DROP TABLE IF EXISTS public.tenant_feature_flags CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

COMMIT;