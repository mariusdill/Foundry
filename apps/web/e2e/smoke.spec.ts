import { expect, test } from "@playwright/test";

const TEST_CREDENTIALS = {
	email: "admin@foundry.local",
	password: "admin123",
};

async function login(page) {
	await page.goto("/login");
	await page.fill('input[type="email"]', TEST_CREDENTIALS.email);
	await page.fill('input[type="password"]', TEST_CREDENTIALS.password);
	await page.click('button:has-text("Enter workspace")');
	await page.waitForURL("/");
}

test.describe("Authentication", () => {
	test("should redirect unauthenticated users to login", async ({ page }) => {
		await page.goto("/spaces");
		await expect(page).toHaveURL(/\/login/);
	});

	test("should login with valid credentials", async ({ page }) => {
		await login(page);
		await expect(page).toHaveURL("/");
		await expect(page.locator('text="Your Work"')).toBeVisible();
	});
});

test.describe("Protected Routes", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
	});

	test("home page loads", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator('text="Welcome back"')).toBeVisible();
		await expect(page.locator('text="Your Work"')).toBeVisible();
	});

	test("search page loads", async ({ page }) => {
		await page.goto("/search");
		await expect(page.locator('text="Find pages"')).toBeVisible();
	});

	test("drafts page loads", async ({ page }) => {
		await page.goto("/drafts");
		await expect(page.locator('text="Review drafts"')).toBeVisible();
	});

	test("spaces page loads", async ({ page }) => {
		await page.goto("/spaces");
		await expect(page.locator('text="Durable work areas"')).toBeVisible();
	});
});

test.describe("Navigation", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
	});

	test("sidebar navigation works", async ({ page }) => {
		await page.goto("/");

		// Click on Spaces in sidebar
		await page.click('text="Spaces"');
		await expect(page).toHaveURL("/spaces");

		// Click on Drafts in sidebar
		await page.click('text="Drafts"');
		await expect(page).toHaveURL("/drafts");

		// Click on Search in sidebar
		await page.click('text="Search"');
		await expect(page).toHaveURL("/search");
	});

	test("command palette opens with keyboard shortcut", async ({ page }) => {
		await page.goto("/");
		await page.keyboard.press("Control+K");
		await expect(page.locator('text="Search for a command"')).toBeVisible();
	});
});

test.describe("Space Detail", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
	});

	test("space detail page loads", async ({ page }) => {
		await page.goto("/spaces");
		// Click on first space
		await page.click("text=Open space");
		await expect(page).toHaveURL(/\/spaces\/[\w-]+/);
		await expect(page.locator('text="Pages"')).toBeVisible();
	});

	test("view toggle works", async ({ page }) => {
		await page.goto("/spaces");
		await page.click("text=Open space");

		// Click board view button
		await page.click('button[aria-label="Show board view"]');
		await expect(page.locator('text="Draft"')).toBeVisible();
		await expect(page.locator('text="Stable"')).toBeVisible();
		await expect(page.locator('text="Archived"')).toBeVisible();
	});
});
