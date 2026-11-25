import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { copyFile, cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const assetRoot = path.resolve(root, '../../crafter/assets');
const licenseRoot = path.resolve(root, '../../crafter/licenses');
const output = path.join(root, 'dist');
const vendor = path.join(output, 'vendor');

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function prepareAssets() {
  const pyodide = path.join(root, 'node_modules', 'pyodide');
  const runtime = JSON.parse(await readFile(path.join(pyodide, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(path.join(pyodide, 'pyodide-lock.json'), 'utf8'));
  const target = path.join(vendor, 'pyodide');
  await mkdir(target, { recursive: true });
  await copyFile(path.join(pyodide, 'package.json'), path.join(target, 'package.json'));
  // Keep the runtime and standard library together; runtime imports are relative.
  for (const name of await readdir(pyodide)) {
    if (/^(pyodide(?:\.asm)?\.(?:mjs|js|wasm)|python_stdlib\.zip|pyodide-lock\.json)$/.test(name)) {
      await copyFile(path.join(pyodide, name), path.join(target, name));
    }
  }
  const requested = ['numpy', 'pillow', 'scipy'];
  const packages = new Set();
  function include(name) {
    if (packages.has(name)) return;
    const entry = lock.packages[name];
    if (!entry) throw new Error(`Missing Pyodide package in runtime lock: ${name}`);
    packages.add(name);
    for (const dependency of entry.depends) include(dependency);
  }
  requested.forEach(include);
  const base = `https://cdn.jsdelivr.net/pyodide/v${runtime.version}/full/`;
  const metadata = [];
  for (const name of packages) {
    const entry = lock.packages[name];
    const file = path.join(target, entry.file_name);
    let valid = false;
    try { valid = await sha256(file) === entry.sha256; } catch {}
    if (!valid) {
      console.log(`Downloading Pyodide ${name} ${entry.version}`);
      const response = await fetch(base + entry.file_name);
      if (!response.ok) throw new Error(`Download failed ${response.status}: ${response.url}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const actual = createHash('sha256').update(bytes).digest('hex');
      if (actual !== entry.sha256) throw new Error(`Checksum mismatch for ${name}`);
      await writeFile(`${file}.partial`, bytes);
      await rename(`${file}.partial`, file);
    }
    metadata.push({ name, version: entry.version, file: entry.file_name, sha256: entry.sha256, source: base + entry.file_name });
  }
  const ort = path.join(root, 'node_modules', 'onnxruntime-web', 'dist');
  const ortTarget = path.join(vendor, 'ort');
  await mkdir(ortTarget, { recursive: true });
  for (const extension of ['mjs', 'wasm']) {
    const name = `ort-wasm-simd-threaded.${extension}`;
    await copyFile(path.join(ort, name), path.join(ortTarget, name));
  }
  const inter = path.join(root, 'node_modules', '@fontsource-variable', 'inter');
  const fontTarget = path.join(vendor, 'fonts');
  await mkdir(fontTarget, { recursive: true });
  await copyFile(path.join(inter, 'files', 'inter-latin-wght-normal.woff2'), path.join(fontTarget, 'inter-latin-wght-normal.woff2'));
  await copyFile(path.join(inter, 'LICENSE'), path.join(fontTarget, 'INTER-LICENSE.txt'));
  await writeFile(path.join(vendor, 'manifest.json'), JSON.stringify({
    pyodide: runtime.version,
    python: lock.info.python,
    onnxruntime: JSON.parse(await readFile(path.join(root, 'node_modules', 'onnxruntime-web', 'package.json'), 'utf8')).version,
    inter: JSON.parse(await readFile(path.join(inter, 'package.json'), 'utf8')).version,
    packages: metadata,
  }, null, 2) + '\n');
  console.log('Local WASM runtime assets ready. Runtime needs no CDN connection.');
}

await prepareAssets();
if (!process.argv.includes('--assets-only')) {
  for (const directory of await readdir(path.join(assetRoot, 'models'))) {
  const modelRoot = path.join(assetRoot, 'models', directory);
  const model = JSON.parse(await readFile(path.join(modelRoot, 'manifest.json'), 'utf8'));
  for (const name of model.vision_sha256 ? ['vision', 'decoder'] : ['decoder']) {
    if (await sha256(path.join(modelRoot, name + '.onnx')) !== (model[name + '_sha256'] || model.onnx_sha256)) {
      throw new Error(name + '.onnx differs from the release manifest');
    }
  }
  }
  // An incremental build must retire obsolete weights and worker bundles too.
  await rm(path.join(output, 'assets/models'), { recursive: true, force: true });
  await rm(path.join(output, 'built'), { recursive: true, force: true });
  const world = JSON.parse(await readFile(path.join(assetRoot, 'world-provenance.json'), 'utf8'));
  if (await sha256(path.join(root, 'world.py')) !== world.files['world.py']) {
    throw new Error('world.py differs from the bundled world source; rebuild assets/world.zip before deploying');
  }
  await build({
    absWorkingDir: root,
    entryPoints: ['src/app.js', 'src/vision-worker.js', 'src/text-worker.js', 'src/world-worker.js'],
    outdir: 'dist/built',
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    external: ['/vendor/*'],
    sourcemap: false,
    logLevel: 'info',
  });
  for (const name of ['index.html', 'text.html', 'vision.html', 'vision-memory.html', 'styles.css', 'THIRD_PARTY_NOTICES.md']) {
    await copyFile(path.join(root, name), path.join(output, name));
  }
  await cp(assetRoot, path.join(output, 'assets'), { recursive: true });
  await cp(licenseRoot, path.join(output, 'licenses'), { recursive: true });
  await writeFile(path.join(output, '.nojekyll'), '');
  console.log('Static site ready in dist/. The default model loads alongside the game.');
}
