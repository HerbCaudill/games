import { createRecommendedOxlintConfig } from "@herbcaudill/eslint-plugin"
import { defineConfig } from "oxlint"

export default defineConfig({
  extends: [
    createRecommendedOxlintConfig({
      testStoryFileExceptions: {
        frameworkFilePatterns: ["e2e/**"],
      },
    }),
  ],
})
