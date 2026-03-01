// ----------------------------------------------------
// Vite configuration for SvelteKit.
// Registers SvelteKit plugin with Vite build system.
// ----------------------------------------------------
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Enables SvelteKit integration within Vite
  plugins: [sveltekit()],
});
