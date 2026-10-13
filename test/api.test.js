import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server/app.js';

test('health endpoint and unknown API routes return their documented contracts', async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await health.json(), { status: 'ok', service: 'fitmatrix', version: '0.1.0', supportedArchitecture: 'llama' });
  const missing = await fetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'API endpoint not found' });
});

test('development serves frontend assets and keeps source/configuration private', async (t) => {
  const server = createApp({ development: true }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Model workspace/);
  for (const path of ['/src/main.js', '/src/styles.css', '/fonts/space-grotesk-400.woff2', '/favicon.svg']) {
    const asset = await fetch(`${base}${path}`);
    assert.equal(asset.status, 200, path);
    assert.ok((await asset.arrayBuffer()).byteLength > 0, path);
  }
  for (const path of ['/server/app.js', '/package.json', '/.env', '/src/%2e%2e%2fserver/app.js']) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 404, path);
  }
  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const post = await fetch(`${base}/api/health`, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
