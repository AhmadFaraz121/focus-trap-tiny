import { build, initialize } from 'esbuild-wasm';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });

// esbuild-wasm has no native binary, so it builds identically on Windows,
// macOS, Linux, and WSL — no platform-specific install step required.
await initialize({ worker: false });

await build({
  entryPoints: ['src/index.js'],
  outfile: 'dist/index.js',
  format: 'esm',
  bundle: true,
  minify: true,
  target: ['es2019'],
  legalComments: 'none',
});

// Types are hand-written; ship them alongside the bundle.
await copyFile('src/index.d.ts', 'dist/index.d.ts');

console.log('Build complete → dist/');
