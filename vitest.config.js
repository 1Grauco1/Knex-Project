import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    fileParallelism: false,
    env: {
      DB_PATH: path.join(__dirname, "tests", "test.db"),
    },
  },
});
