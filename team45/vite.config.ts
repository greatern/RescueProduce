import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg"],

	publicDir: "public",

	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				
			},
		},
		// Copy service worker as-is without processing
		copyPublicDir: true,
	},
	server: {
    headers: {
      'Service-Worker-Allowed': '/',
    }
  }
});
