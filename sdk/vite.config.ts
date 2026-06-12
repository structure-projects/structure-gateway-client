import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts'],
      cleanVueFileName: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'StructureGatewayClient',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js';
        if (format === 'cjs') return 'index.js';
        return 'index.umd.js';
      },
    },
    rollupOptions: {
      external: ['axios', '@fingerprintjs/fingerprintjs'],
      output: {
        globals: {
          axios: 'axios',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
});
