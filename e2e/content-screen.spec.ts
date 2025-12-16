import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { landingMetaData } from './helpers/landing-meta-data';

const contentData = landingMetaData[0]; // Using the first content item for navigation test
const contentTitle = contentData.title; // Using the first content item for navigation test

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test('landing screen -> learning content screen navigation', async ({
  page,
}) => {
  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Check that the page loaded successfully
  expect(page.url()).toContain('/');

  // Click on the specific content item
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();

  // Wait for navigation to complete
  await page.waitForURL(`**/content?topic=${contentTitle}`);

  // Verify the URL includes the topic query parameter
  expect(page.url()).toContain(`/content?topic=${contentTitle}`);

  // Verify the content title appears as a header
  const subHeading = page.getByTestId('breadcrumb-subheading');
  await expect(subHeading).toBeVisible();
  await expect(subHeading).toContainText(contentTitle);
});

test('transcript item menu interactions and review', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Navigate to content screen
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();

  // Wait for navigation to complete
  await page.waitForURL(`**/content?topic=${contentTitle}`);

  // Wait for the content to load and find the first transcript item
  await page.waitForLoadState('networkidle');

  // Verify initial sentence count and reps
  const sentencesCount = page.getByTestId('analytics-sentences-count');
  await expect(sentencesCount).toBeVisible();

  const repsCount = page.getByTestId('analytics-reps-count');
  await expect(repsCount).toBeVisible();
  await expect(repsCount).toContainText('Reps: 0');

  const firstMenuToggle = page.getByTestId(/transcript-menu-toggle-/).first();
  await expect(firstMenuToggle).toBeVisible();
  await firstMenuToggle.click();
  const menuOptions = page.getByTestId(/transcript-menu-options-/).first();
  const reviewButton = page.getByTestId(/transcript-menu-review-/).first();
  await reviewButton.click();

  // Verify loading spinner appears in the action bar
  const loadingSpinner = page.getByTestId(/transcript-action-loading-/).first();
  await expect(loadingSpinner).toBeVisible();

  // Verify toast message appears
  const toastMessage = page.getByText('Sentence reviewed ✅');
  await expect(toastMessage).toBeVisible({ timeout: 3000 });

  // Wait for the loading to complete and menu to close
  await expect(menuOptions).not.toBeVisible({ timeout: 5000 });

  // Verify loading spinner is no longer visible
  await expect(loadingSpinner).not.toBeVisible();

  // Verify review button is no longer visible since menu collapsed
  await expect(reviewButton).not.toBeVisible();

  // Verify reps count increased to 1
  await expect(repsCount).toContainText('Reps: 1');

  // Verify sentence count increased by 1 in the denominator
  const finalSentencesText = await sentencesCount.textContent();
  expect(finalSentencesText).toContain('/201');

  // Click the menu toggle again to reopen the menu
  await firstMenuToggle.click();
  // Click review button again to remove the review
  const reviewButtonSecond = page
    .getByTestId(/transcript-menu-review-/)
    .first();
  await reviewButtonSecond.click();

  // Verify loading spinner appears again
  await expect(loadingSpinner).toBeVisible();

  // Verify toast message appears for learning sentence
  const toastMessageLearned = page.getByText('Successful learned sentence ✅');
  await expect(toastMessageLearned).toBeVisible({ timeout: 3000 });

  // Wait for the loading to complete
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify reps count increased to 2
  await expect(repsCount).toContainText('Reps: 2');

  // Verify sentence count reverted back to original
  const revertedSentencesText = await sentencesCount.textContent();
  expect(revertedSentencesText).toContain('/200');
});

test('transcript item review error handling', async ({ page }) => {
  // Setup API mocking with error response for updateSentence
  await page.route('**/api/updateSentence', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    });
  });

  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Navigate to content screen
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();

  // Wait for navigation to complete
  await page.waitForURL(`**/content?topic=${contentTitle}`);

  // Wait for the content to load
  await page.waitForLoadState('networkidle');

  // Verify initial sentence count and reps
  const sentencesCount = page.getByTestId('analytics-sentences-count');
  await expect(sentencesCount).toBeVisible();
  const initialSentencesText = await sentencesCount.textContent();
  expect(initialSentencesText).toContain('/200');

  const repsCount = page.getByTestId('analytics-reps-count');
  await expect(repsCount).toBeVisible();
  await expect(repsCount).toContainText('Reps: 0');

  // Open menu and click review button
  const firstMenuToggle = page.getByTestId(/transcript-menu-toggle-/).first();
  await expect(firstMenuToggle).toBeVisible();
  await firstMenuToggle.click();

  const reviewButton = page.getByTestId(/transcript-menu-review-/).first();
  await reviewButton.click();

  // Verify loading spinner appears in the action bar
  const loadingSpinner = page.getByTestId(/transcript-action-loading-/).first();
  await expect(loadingSpinner).toBeVisible();

  // Verify error toast message appears
  const errorToastMessage = page.getByText('Error updating sentence review ❌');
  await expect(errorToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after error
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify reps count remained at 0 (no increment due to error)
  await expect(repsCount).toContainText('Reps: 0');

  // Verify sentence count remained unchanged
  const finalSentencesText = await sentencesCount.textContent();
  expect(finalSentencesText).toContain('/200');
  expect(finalSentencesText).toBe(initialSentencesText);
});

test('transcript item sentence breakdown', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Navigate to content screen
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();

  // Wait for navigation to complete
  await page.waitForURL(`**/content?topic=${contentTitle}`);

  // Wait for the content to load
  await page.waitForLoadState('networkidle');

  // Use specific content ID for reliable targeting
  const contentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';

  // Open the menu
  const menuToggle = page.getByTestId(`transcript-menu-toggle-${contentId}`);
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  // Verify menu is open
  const menuOptions = page.getByTestId(`transcript-menu-options-${contentId}`);
  // await expect(menuOptions).toBeVisible();

  // Click the breakdown sentence button (hammer icon)
  const breakdownButton = page.getByTestId(
    `transcript-breakdown-button-${contentId}`,
  );
  // await expect(breakdownButton).toBeVisible();
  await breakdownButton.click();

  // Verify loading hammer icon appears
  const loadingHammer = page.getByTestId(
    `transcript-breakdown-loading-${contentId}`,
  );
  await expect(loadingHammer).toBeVisible();

  // Verify toast message appears
  const toastMessage = page.getByText('Sentence broken down 🧱🔨!');
  await expect(toastMessage).toBeVisible({ timeout: 3000 });

  // Wait for loading to complete
  await expect(loadingHammer).not.toBeVisible({ timeout: 5000 });

  // Verify menu closes after breakdown
  await expect(menuOptions).not.toBeVisible();

  // Verify brick emoji appears indicating sentence is broken down
  const brickEmoji = page.getByTestId(
    `transcript-breakdown-complete-${contentId}`,
  );
  await expect(brickEmoji).toBeVisible();
  await expect(brickEmoji).toContainText('🧱');

  // Verify breakdown button is no longer visible
  await expect(breakdownButton).not.toBeVisible();
});

test('transcript item sentence breakdown error handling', async ({ page }) => {
  // Setup API mocking with error response for breakdownSentence
  await page.route('**/api/breakdownSentence', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    });
  });

  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Navigate to content screen
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();

  // Wait for navigation to complete
  await page.waitForURL(`**/content?topic=${contentTitle}`);

  // Wait for the content to load
  await page.waitForLoadState('networkidle');

  // Use specific content ID for reliable targeting
  const contentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';

  // Open the menu
  const menuToggle = page.getByTestId(`transcript-menu-toggle-${contentId}`);
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  // Verify menu is open
  const menuOptions = page.getByTestId(`transcript-menu-options-${contentId}`);
  // await expect(menuOptions).toBeVisible();

  // Click the breakdown sentence button (hammer icon)
  const breakdownButton = page.getByTestId(
    `transcript-breakdown-button-${contentId}`,
  );
  await expect(breakdownButton).toBeVisible();
  await breakdownButton.click();

  // Verify loading hammer icon appears
  const loadingHammer = page.getByTestId(
    `transcript-breakdown-loading-${contentId}`,
  );
  await expect(loadingHammer).toBeVisible();

  // Verify error toast message appears
  const errorToastMessage = page.getByText('Sentence breakdown error 🧱🔨❌');
  await expect(errorToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading hammer disappears after error
  await expect(loadingHammer).not.toBeVisible({ timeout: 5000 });

  // Verify menu closes even after error
  await expect(menuOptions).not.toBeVisible();

  // Verify breakdown button is still visible (since breakdown failed)
  await expect(breakdownButton).toBeVisible();

  // Verify brick emoji does NOT appear (since breakdown failed)
  const brickEmoji = page.getByTestId(
    `transcript-breakdown-complete-${contentId}`,
  );
  await expect(brickEmoji).not.toBeVisible();
});
