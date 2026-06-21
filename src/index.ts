/**
 * ArdaLink API — Express entrypoint.
 *
 * Skeleton v0.1.0 — full source migrates in Phase 3 from
 * `MUNENE1212/ardalink-ai/artifacts/api-server/`.
 */

import { createApp } from './app.js';
import { logger } from './lib/logger.js';

const port = Number(process.env.PORT ?? 3000);

const app = createApp();

const server = app.listen(port, () => {
  logger.info({ port }, 'ardalink-api listening');
});

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'shutting down');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));