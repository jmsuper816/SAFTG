import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const root = resolve(process.argv.at(-1) ?? 'dist');
const forbiddenNames = [/^\.env/, /cookie/i, /espn.*raw/i, /\.map$/i, /cache/i];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[=:]\s*['"][^'"]+/i,
  /espn_s2/i,
  /SWID/i,
];
const failures: string[] = [];
async function walk(directory: string): Promise<void> {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    const metadata = await stat(path);
    if (metadata.isDirectory()) await walk(path);
    else {
      if (forbiddenNames.some((pattern) => pattern.test(basename(path))))
        failures.push(`Forbidden artifact: ${path}`);
      if (metadata.size < 2_000_000) {
        const text = await readFile(path, 'utf8').catch(() => '');
        if (secretPatterns.some((pattern) => pattern.test(text)))
          failures.push(`Possible secret: ${path}`);
      }
    }
  }
}
await walk(root);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`No secrets or forbidden files found in ${root}.`);
