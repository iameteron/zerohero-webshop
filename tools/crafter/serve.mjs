import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist'));
const port = Number(process.env.PORT || 8787);
const base = process.env.BASE_PATH || '/';
if (!base.startsWith('/') || !base.endsWith('/') || base.includes('..')) throw new Error('BASE_PATH must start and end with /');
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between1 and65535');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.zip': 'application/zip',
  '.whl': 'application/zip',
  '.onnx': 'application/octet-stream',
};

const server = http.createServer(async (request, response) => {
  // Match plain GitHub Pages, which does not supply isolation headers.
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-cache');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Static files only');
    return;
  }
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (base !== '/' && url.pathname === base.slice(0, -1)) {
      response.writeHead(302, { Location: base }).end();
      return;
    }
    if (!url.pathname.startsWith(base)) { response.writeHead(404).end('Not found'); return; }
    const relative = decodeURIComponent(url.pathname.slice(base.length)) || 'index.html';
    // Realpath also prevents a symlink inside the static tree exposing other files.
    const file = await realpath(path.join(root, relative));
    if (!file.startsWith(root + path.sep) || path.relative(root, file).split(path.sep).some(part => part.startsWith('.')) || path.relative(root, file).startsWith('node_modules' + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const info = await stat(file);
    if (!info.isFile()) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Content-Length': info.size,
    });
    if (process.env.REQUEST_LOG === '1') console.log(`${request.method} ${url.pathname}`);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).on('error', () => response.destroy()).pipe(response);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 400).end('Not found');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => {
  console.log(`Zero WASM: http://127.0.0.1:${port}${base}`);
  console.log('Static files only. Crafter and model inference execute in browser WASM workers.');
});
