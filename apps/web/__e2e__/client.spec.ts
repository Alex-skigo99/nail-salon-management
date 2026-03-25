import { test, expect } from "@playwright/test";

test.describe("Client page", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/client");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders navigation tabs when authenticated", async ({ page }) => {
    // This test requires an authenticated session - skip if no test credentials
    test.skip(!process.env.TEST_USER_EMAIL, "Requires TEST_USER_EMAIL env var");

    // Login first
    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\//);

    // Navigate to client page
    await page.goto("/client");
    await expect(page.getByText("Active Appointments")).toBeVisible();
    await expect(page.getByText("History")).toBeVisible();
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Feedback")).toBeVisible();
    await expect(page.getByText("Back to Main")).toBeVisible();
  });

  test("shows feedback coming soon page", async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, "Requires TEST_USER_EMAIL env var");

    await page.goto("/login");
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL(/\//);

    await page.goto("/client");
    await page.getByText("Feedback").click();
    await expect(page.getByText("coming soon")).toBeVisible();
  });
});
