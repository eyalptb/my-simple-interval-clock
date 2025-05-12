
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Make sure we preserve favicon files in the output
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info.pop();
          // If it's a favicon asset, preserve its name
          if (['ico', 'png'].includes(ext) && assetInfo.name.includes('favicon')) {
            return `[name].[ext]`;
          }
          // Default Vite behavior
          return `assets/[name]-[hash].[ext]`;
        },
      },
    },
  },
}));
