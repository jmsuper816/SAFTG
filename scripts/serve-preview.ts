import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const host = process.env.PREVIEW_HOST ?? '127.0.0.1';
const port = Number(process.env.PREVIEW_PORT ?? 4321);
const base = (process.env.SITE_BASE ?? '/SAFTG').replace(/\/$/, '');
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', `http://${host}`).pathname;
  if (base && !pathname.startsWith(`${base}/`) && pathname !== base) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const relative = normalize(decodeURIComponent(pathname.slice(base.length))).replace(
    /^(?:\.\.[/\\])+/,
    '',
  );
  let path = join('dist', relative);
  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
  } catch {
    path = join('dist', '404.html');
    response.statusCode = 404;
  }
  try {
    const body = await readFile(path);
    response.setHeader('content-type', types[extname(path)] ?? 'application/octet-stream');
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(port, host, () => console.log(`Preview listening on http://${host}:${port}${base}/`));
