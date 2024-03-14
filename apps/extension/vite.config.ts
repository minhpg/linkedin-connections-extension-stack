import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

const crxManifest = manifest as any;
export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [react(), crx({ manifest: crxManifest })],
});
