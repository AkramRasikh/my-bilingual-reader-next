import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Yah Dun Kno!/);
});

test('homepage loads with mock data', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Check that the page loaded successfully
  expect(page.url()).toBe('http://localhost:3000/');
  
  // Verify the API was called (you can add more specific checks here)
  // For example, check if content from mock data is displayed
});
