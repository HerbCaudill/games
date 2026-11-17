import { createRecommendedOxlintConfig } from "@herbcaudill/eslint-plugin"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [
    createRecommendedOxlintConfig({
      fileExceptions: {
        // shadcn generates these and owns their shape.
        generatedFilePatterns: ["src/components/ui/**"],
      },
      exportFileExceptions: {
        // Vercel routes by file name, such as `api/[game]/[date].ts`.
        frameworkFilePatterns: ["playwright*.config.ts", "api/**"],
      },
      testStoryFileExceptions: {
        frameworkFilePatterns: ["e2e/**"],
      },
    }),
  ],
  overrides: [
    {
      files: ["src/components/ui/**"],
      rules: {
        "herbcaudill/component-props": "off",
        "herbcaudill/declaration-order": "off",
        "herbcaudill/jsdoc": "off",
      },
    },
  ],
})
