// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
  plugins: [
    react(),
    eslintPlugin({
      cache: false,
      include: ["./src/**/*.{js,jsx,ts,tsx}"],
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
});
