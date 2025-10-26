import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*", "**/mockData", "**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web/src"),
      "@opencode/openrouter-sdk": path.resolve(__dirname, "./packages/openrouter-sdk/src"),
      "@opencode/ai-hooks": path.resolve(__dirname, "./packages/ai-hooks/src"),
      "@opencode/ui-components": path.resolve(__dirname, "./packages/ui-components/src"),
    },
  },
})
