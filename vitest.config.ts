import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        coverage: {
            provider: "v8",
            reporter: ["text", "text-summary"],
            include: [
                "src/lib/calculations/**/*.ts",
                "src/lib/validators/**/*.ts",
                "src/lib/import/**/*.ts",
                "src/lib/auth/**/*.ts",
                "src/hooks/use-standings.ts",
            ],
            exclude: [
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/types.ts",
            ],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
