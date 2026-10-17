import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/jspdf")) {
            return "vendor-pdf";
          }
          if (
            id.includes("node_modules/chart.js") ||
            id.includes("node_modules/react-chartjs-2")
          ) {
            return "vendor-chart";
          }
          if (id.includes("node_modules/@firebase/firestore")) {
            return "vendor-firestore";
          }
          if (id.includes("node_modules/@firebase/auth")) {
            return "vendor-auth";
          }
          if (id.includes("node_modules/@firebase") || id.includes("node_modules/firebase")) {
            return "vendor-firebase";
          }
          if (id.includes("node_modules/react")) {
            return "vendor-react";
          }
          return undefined;
        },
      },
    },
  },
});
