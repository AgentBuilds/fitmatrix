import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
// Native browser modules need no transpilation; validate before copying assets.
const result = spawnSync(process.execPath, ['--check', resolve(root, 'src/main.js')], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir(output, { recursive: true });
await cp(resolve(root, 'src'), resolve(output, 'src'), { recursive: true });
await cp(resolve(root, 'public'), output, { recursive: true });
const html = await readFile(resolve(root, 'index.html'), 'utf8');
await writeFile(resolve(output, 'index.html'), html);
console.log('FitMatrix frontend built to dist/ (native HTML, CSS, and ES modules).');
