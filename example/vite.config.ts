import { defineConfig } from "vite";
import vitePluginSecureNow from "vite-plugin-secure-now";

export default defineConfig({
    build: {
        outDir: "dist",
    },
    server: {
        // port: 3000,
    },
    plugins: [
        vitePluginSecureNow({
            dev: true,
            preview: true,
            prefix: "booom",
        }),
    ],
})