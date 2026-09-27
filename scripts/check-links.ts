import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const base = (process.env.SITE_BASE ?? '/SAFTG').replace(/\/$/, '');
async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory);
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry);
        return (await stat(path)).isDirectory() ? files(path) : [path];
      }),
    )
  ).flat();
}
const paths = await files(root);
const failures: string[] = [];
for (const path of paths.filter((item) => extname(item) === '.html')) {
  const html = await readFile(path, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1]!;
    if (/^(?:https?:|mailto:|#|data:)/.test(target)) continue;
    if (target.startsWith('/') && !target.startsWith(`${base}/`) && target !== `${base}`)
      failures.push(`${path}: base path missing in ${target}`);
    const relative = target.startsWith(base) ? target.slice(base.length) : target;
    const clean = relative.split(/[?#]/)[0] || '/';
    const disk = clean.endsWith('/') ? join(root, clean, 'index.html') : join(root, clean);
    try {
      await stat(disk);
    } catch {
      failures.push(`${path}: missing ${target}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Validated links in ${paths.length} generated files.`);
