import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

export function createApp({ development = false } = {}) {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end('Invalid request path');
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
      return;
    }
    if (pathname === '/api/health' || pathname.startsWith('/api/')) {
      const health = pathname === '/api/health';
      response.writeHead(health ? 200 : 404, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      const data = health ? { status: 'ok', service: 'fitmatrix', version: '0.1.0', supportedArchitecture: 'llama' } : { error: 'API endpoint not found' };
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify(data));
      return;
    }
    // Development exposes only frontend assets, never server code or project config.
    let root = resolve(projectRoot, 'dist');
    let relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (development) {
      if (pathname === '/' || pathname === '/index.html') root = resolve(projectRoot);
      else if (pathname.startsWith('/src/')) { root = resolve(projectRoot, 'src'); relative = pathname.slice(5); }
      else root = resolve(projectRoot, 'public');
    }
    const target = resolve(root, relative);
    if (!target.startsWith(root + sep) || relative.includes('\\') || relative.split('/').some((part) => part.startsWith('.'))) {
      response.writeHead(404).end('Page not found');
      return;
    }
    try {
      const file = await readFile(target);
      response.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : file);
    } catch (error) {
      const missing = ['ENOENT', 'EISDIR', 'ENOTDIR'].includes(error.code);
      response.writeHead(missing ? 404 : 500).end(missing ? 'Page not found' : 'Unable to serve page');
    }
  });
}
