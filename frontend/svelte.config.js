// ----------------------------------------------------
// SvelteKit configuration.
// Defines build adapter and preprocessing.
// ----------------------------------------------------

// import adapter from '@sveltejs/adapter-auto';
import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Enables Vite-based preprocessing (TypeScript, etc.)
  preprocess: vitePreprocess(),

  kit: {
    // Deployment target configuration
    // Using Netlify adapter for production build output
    adapter: adapter(),
  },
};

export default config;
