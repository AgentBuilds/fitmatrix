import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp, projectRoot } from './app.js';

const development = process.argv.includes('--dev');
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535');
if (!development) {
  try {
    await access(resolve(projectRoot, 'dist/index.html'));
  } catch {
    console.error('No frontend build found. Run npm run build before npm start.');
    process.exit(1);
  }
}

const server = createApp({ development }).listen(port, process.env.HOST ?? '127.0.0.1', () => {
  console.log(`FitMatrix ${development ? 'development' : 'production'}: http://${process.env.HOST ?? '127.0.0.1'}:${server.address().port}`);
});
server.on('error', (error) => {
  console.error(`Unable to start FitMatrix: ${error.message}`);
  process.exit(1);
});
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  const timer = setTimeout(() => process.exit(1), 5000).unref();
  server.close(() => { clearTimeout(timer); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
