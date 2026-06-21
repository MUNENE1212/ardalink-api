import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createHmac } from 'node:crypto';

import { createApp } from '../src/app.js';

const SECRET = 'middleware-test-secret';

function mintJwt(claims: object, secret = SECRET): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (o: object): string =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const headerB64 = enc(header);
  const payloadB64 = enc(claims);
  const sig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
  return `${headerB64}.${payloadB64}.${sig}`;
}

describe('tenantMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
  });
  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('lets /api/healthz through without a token', async () => {
    const res = await request(createApp()).get('/api/healthz');
    expect(res.status).toBe(200);
  });

  it('rejects /api/whoami without a token', async () => {
    const res = await request(createApp()).get('/api/whoami');
    expect(res.status).toBe(401);
  });

  it('rejects /api/whoami with a malformed token', async () => {
    const res = await request(createApp())
      .get('/api/whoami')
      .set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(401);
  });

  it('returns the tenant_id claim on a valid token', async () => {
    const token = mintJwt({ sub: 'op-1', tenant_id: 'bula-pesa' });
    const res = await request(createApp())
      .get('/api/whoami')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.tenant_id).toBe('bula-pesa');
  });
});