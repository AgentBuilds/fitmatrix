// Optional maintainer utility. Builds and runtime never require network access.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const output = fileURLToPath(new URL('../public/fonts/', import.meta.url));
await mkdir(output, { recursive: true });
for (const [name, weights] of [['space-grotesk', [400, 500, 600]], ['ibm-plex-mono', [400]]]) {
  const response = await fetch(`https://registry.npmjs.org/@fontsource%2f${name}/latest`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Font metadata failed: ${response.status}`);
  const metadata = await response.json();
  const archiveUrl = new URL(metadata.dist.tarball);
  if (archiveUrl.origin !== 'https://registry.npmjs.org') throw new Error('Unexpected font source');
  const archive = await fetch(archiveUrl, { signal: AbortSignal.timeout(15000) });
  if (!archive.ok) throw new Error(`Font download failed: ${archive.status}`);
  const tar = gunzipSync(Buffer.from(await archive.arrayBuffer()));
  const wanted = new Map(weights.map((weight) => [`package/files/${name}-latin-${weight}-normal.woff2`, `${name}-${weight}.woff2`]));
  wanted.set('package/LICENSE', `${name}-LICENSE.txt`);
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    const entry = header.subarray(0, 100).toString().replace(/\0.*$/, '');
    if (!entry) break;
    const size = parseInt(header.subarray(124, 136).toString().replace(/\0.*$/, '').trim(), 8);
    if (!Number.isFinite(size)) throw new Error('Invalid archive entry');
    if (wanted.has(entry)) {
      await writeFile(`${output}${wanted.get(entry)}`, tar.subarray(offset + 512, offset + 512 + size));
      wanted.delete(entry);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  if (wanted.size) throw new Error(`Missing font assets: ${[...wanted.keys()].join(', ')}`);
  console.log(`Vendored ${name} ${metadata.version} with license`);
}
