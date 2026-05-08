import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  outDir: 'build',
  sourcemap: true,
  clean: true,
  dts: false,
});
