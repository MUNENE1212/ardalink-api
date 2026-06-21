import express, { type Express } from 'express';

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'ardalink-api', version: '0.1.0' });
  });

  return app;
}