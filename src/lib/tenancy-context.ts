/**
 * Per-request tenant context binding for Drizzle queries.
 *
 * Every API request must run inside a Postgres transaction where the
 * session variable `app.current_tenant_id` is set. RLS policies on
 * every operational table then filter rows to that tenant only.
 *
 * Usage:
 *
 *   import { withTenantContext } from '../lib/tenancy-context';
 *
 *   app.get('/api/ground-truth/recent', async (req, res) => {
 *     const tenantId = req.tenant!.tenant_id;
 *     const rows = await withTenantContext(tenantId, async (tx) => {
 *       return tx.select().from(groundTruthReportsTable).limit(20);
 *     });
 *     res.json(rows);
 *   });
 *
 * Failure mode: if `tenantId` is empty, the helper throws. A connection
 * that escapes the `withTenantContext` block is released; the next
 * request gets a fresh pool member with no `app.current_tenant_id`
 * set, so unscoped queries on scoped tables return zero rows.
 */

import { sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantContextError';
  }
}

export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  if (!tenantId) {
    throw new TenantContextError('tenantId is required for withTenantContext');
  }
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
    return fn(tx);
  });
}