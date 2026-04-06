import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
      "@ui": `${import.meta.dirname}/src/components/ui`,
      "@layout": `${import.meta.dirname}/src/components/layout`,
      "@features": `${import.meta.dirname}/src/features`,
      "@components": `${import.meta.dirname}/src/components`,
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 5173, // Explicitly set HMR port
      protocol: "ws", // Use WebSocket for HMR
    },
    watch: {
      usePolling: true, // Enable polling for file changes
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"], // Pre-bundle these dependencies
    exclude: ["@clerk/react", "@clerk/shared"],
  },
  build: {
    sourcemap: true, // Enable source maps for better debugging
    rollupOptions: {
      output: {
        // Use the function syntax instead of the object syntax
        manualChunks(id) {
          if (id.includes("@clerk/clerk-react")) {
            return "clerk";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
