// @ts-check
const { build } = require("esbuild");

build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  platform: "node",
  format: "cjs",
  bundle: true,
  minify: true,
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
