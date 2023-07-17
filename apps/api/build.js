// @ts-check
const { build } = require('esbuild')

const isProduction = process.env.NODE_ENV === 'production'

build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  platform: 'node',
  format: 'cjs',
  minify: isProduction,
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
