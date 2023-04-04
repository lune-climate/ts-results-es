import { defineConfig } from 'tsup';
import { writeFile } from 'fs/promises';

const shared = {
    entry: ['src/index.ts', 'src/rxjs-operators/index.ts'],
    platform: 'node',
    clean: true,
    external: ['rxjs'],
    sourcemap: true,
};
export default defineConfig([
    {
        format: 'esm',
        target: 'node16',
        tsconfig: './tsconfig-esm.json',
        outDir: './dist/esm',
        treeshake: true,
        outExtension() {
            return {
                js: '.mjs',
            };
        },
        async onSuccess() {
            console.log('writing json esm');
            await writeFile('./dist/esm/package.json', JSON.stringify({ type: 'module' }));
        },
        ...shared,
    },
    {
        format: 'cjs',
        splitting: false,
        target: 'node16',
        tsconfig: './tsconfig-cjs.json',
        outDir: './dist/cjs',
        outExtension() {
            return {
                js: '.cjs',
            };
        },
        async onSuccess() {
            console.log('writing json commonjs');
            await writeFile('./dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }));
        },
        ...shared,
    },
]);
