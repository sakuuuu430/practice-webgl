import { defineConfig } from "vite";
import path from "path";
import glsl from "vite-plugin-glsl";

// GitHub Pagesにデモをデプロイするため、ビルド先を標準のdistディレクトリから変更
const dist = path.join(__dirname, "..", "dist", path.basename(__dirname));

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: dist,
  },
  plugins: [
    glsl({
      include: [
        "**/*.glsl",
        "**/*.wgsl",
        "**/*.vert",
        "**/*.frag",
        "**/*.vs",
        "**/*.fs",
      ],
      defaultExtension: "glsl",
      minify: true,
      watch: true,
    }),
  ],
});
