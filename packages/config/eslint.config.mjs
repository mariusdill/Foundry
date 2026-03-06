/**
 * Shared ESLint configuration for Foundry packages.
 * Extends ESLint recommended rules and TypeScript strict type-checked rules.
 * Note: Each package must configure its own parserOptions.project
 */
export default tseslint.config(
	js.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		rules: {
			// Consistency and readability
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-import-type-side-effects": "error",

			// Safety
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error",

			// Style - disabled in favor of Prettier
			"@typescript-eslint/no-empty-function": "off",
		},
	},
	{
		// Test files can have relaxed rules
		files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
	{
		ignores: ["dist/**", "node_modules/**", "*.config.*", "**/*.d.ts"],
	},
);
import tseslint from "typescript-eslint";

/**
 * Shared ESLint configuration for Foundry packages.
 * Extends ESLint recommended rules and TypeScript strict type-checked rules.
 */
export default tseslint.config(
	js.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Consistency and readability
			"@typescript-eslint/consistent-type-definitions": ["error", "type"],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{ prefer: "type-imports", fixStyle: "inline-type-imports" },
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-import-type-side-effects": "error",

			// Safety
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error",

			// Style - disabled in favor of Prettier
			"@typescript-eslint/no-empty-function": "off",
		},
	},
	{
		// Test files can have relaxed rules
		files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
	{
		ignores: ["dist/**", "node_modules/**", "*.config.*", "**/*.d.ts"],
	},
);
