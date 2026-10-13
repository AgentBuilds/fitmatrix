import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

test('connection check covers loading, success, failure, and retry', async () => {
  const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  const status = { textContent: '', classList: { add() {}, remove() {} } };
  const attributes = {};
  let click;
  const button = { disabled: false, textContent: '', setAttribute(key, value) { attributes[key] = value; }, addEventListener(_event, callback) { click = callback; } };
  let complete;
  let request = () => new Promise((resolve) => { complete = resolve; });
  runInNewContext(source, {
    document: { querySelector: (selector) => selector === '#api-status' ? status : button },
    fetch: (...args) => request(...args), AbortSignal,
  });
  assert.equal(button.disabled, true);
  assert.equal(attributes['aria-busy'], 'true');
  assert.match(status.textContent, /Checking/);
  complete({ ok: true, json: async () => ({ status: 'ok', service: 'fitmatrix' }) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.match(status.textContent, /Connected/);
  assert.equal(button.disabled, false);
  assert.equal(attributes['aria-busy'], 'false');
  request = async () => { throw new Error('Network unavailable'); };
  await click();
  assert.match(status.textContent, /Connection unavailable/);
  assert.equal(button.textContent, 'Retry connection');
  assert.equal(button.disabled, false);
  request = async () => ({ ok: true, json: async () => ({ status: 'ok', service: 'fitmatrix' }) });
  await click();
  assert.match(status.textContent, /Connected/);
  request = async () => ({ ok: true, json: async () => ({ status: 'wrong-service' }) });
  await click();
  assert.match(status.textContent, /Connection unavailable/);
});
