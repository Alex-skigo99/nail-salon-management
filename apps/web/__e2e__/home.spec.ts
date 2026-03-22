import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("redirects / to /home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/home/);
  });

  test("renders the home page without errors", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveTitle(/.+/);
    // Main content should be visible
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Login page", () => {
  test("renders the login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
  });

  test("shows validation errors on empty form submit", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.getByRole("button", { name: "Sign In", exact: true });
    await submitButton.click();
    // At least one error message should appear
    await expect(page.locator("text=is required").first()).toBeVisible();
  });
});
