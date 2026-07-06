import { build } from 'esbuild';

// Plugin: khi gặp import có đuôi .js (kiểu TS NodeNext), tự tìm file .ts tương ứng
const resolveTsExtensionPlugin = {
    name: 'resolve-ts-extension',
    setup(build) {
        build.onResolve({ filter: /\.js$/ }, async (args) => {
            // Chỉ xử lý import tương đối (./ hoặc ../), bỏ qua package từ node_modules
            if (!args.path.startsWith('.')) return;

            const tsPath = args.path.replace(/\.js$/, '.ts');

            const result = await build.resolve(tsPath, {
                kind: args.kind,
                resolveDir: args.resolveDir,
            });

            if (result.errors.length > 0) {
                // Không tìm được .ts thì để esbuild tự báo lỗi như cũ
                return;
            }

            return { path: result.path };
        });
    },
};

build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
    outfile: 'dist/server.cjs',
    plugins: [resolveTsExtensionPlugin],
}).catch(() => process.exit(1));
