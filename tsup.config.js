import { defineConfig } from 'tsup'
import dotenv from 'dotenv';

export default defineConfig({
  entry: ['src/index.ts'],
  env: dotenv.config().parsed,
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
})