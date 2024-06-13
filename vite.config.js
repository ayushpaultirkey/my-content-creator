import { join } from "path";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";
import H12VitePlugin from "./plugin/vite";

export default defineConfig({
    root: join(__dirname, "/public"),
    plugins: [
        H12VitePlugin()
    ],
    resolve: {
        alias: [
            { find: "@library", replacement: fileURLToPath(new URL("./public/library", import.meta.url)) }
        ]
    }
})