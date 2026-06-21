import express, { type Express } from 'express';

import { tenantMiddleware } from './middlewares/tenant.js';

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.use(tenantMiddleware);

  app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'ardalink-api', version: '0.1.0' });
  });

  app.get('/api/whoami', (req, res) => {
    if (!req.tenant) {
      res.status(401).json({ error: 'No tenant context' });
      return;
    }
    res.json({ tenant_id: req.tenant.tenant_id, sub: req.tenant.sub });
  });

  return app;
}