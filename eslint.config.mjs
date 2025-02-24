import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config} */
export default {
  files: ["**/*.{js,mjs,cjs,ts}"],
  languageOptions: {
    globals: globals.node
  },
  plugins: {
    "@typescript-eslint": tseslint
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  extends: [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended
  ]
};
