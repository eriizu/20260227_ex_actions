import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
  resolve: {
    // Permet d'importer les fichiers .ts avec l'extension .js (convention ESM TypeScript)
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
});
