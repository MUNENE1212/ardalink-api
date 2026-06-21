import { sql } from 'drizzle-orm';
import { boolean, pgSchema, text, timestamp } from 'drizzle-orm/pg-core';

export const publicSchema = pgSchema('public');

export const tenants = publicSchema.table('tenants', {
  tenantId: text('tenant_id').primaryKey(),
  displayName: text('display_name').notNull(),
  region: text('region').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tenantFeatureFlags = publicSchema.table(
  'tenant_feature_flags',
  {
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.tenantId, { onDelete: 'cascade' }),
    flagKey: text('flag_key').notNull(),
    enabled: boolean('enabled').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: sql`PRIMARY KEY (${t.tenantId}, ${t.flagKey})`,
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type TenantFeatureFlag = typeof tenantFeatureFlags.$inferSelect;