// SPDX-License-Identifier: AGPL-3.0-or-later
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { createVueConfig } from './vite.config';
import { getSelfDirectoryAbsolutePath } from './vite-config-helper';

const MOBILE_DIRECTORY = resolve(getSelfDirectoryAbsolutePath(), 'src/presentation/mobile');

export default defineConfig({
  ...createVueConfig({ supportLegacyBrowsers: false }),
  base: process.env.PAGES_BASE ?? '/',
  root: MOBILE_DIRECTORY,
  build: {
    outDir: resolve(getSelfDirectoryAbsolutePath(), 'dist-mobile'),
    emptyOutDir: true,
  },
});
