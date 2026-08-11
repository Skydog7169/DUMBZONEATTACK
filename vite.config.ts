import { defineConfig } from "vite";

export default defineConfig({
  base: "./",   // relative asset paths — works at any URL (GitHub Pages subpath, Vercel, local file)
  server: { port: 5173, strictPort: true },
  build: { target: "es2022" }
});
