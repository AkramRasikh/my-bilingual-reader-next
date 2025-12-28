import { test, expect, Page } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { landingMetaData } from './helpers/landing-meta-data';

const contentData = landingMetaData[0];
const contentTitle = contentData.title;

// Helper function to check review variant counts
async function checkReviewVariantCounts(
  page: Page,
  expectedWordsCount: number,
  expectedSentencesCount: number,
  expectedSnippetsCount: number,
) {
  const wordsLabel = page.locator('label[for="words-toggle"]');
  const sentencesLabel = page.locator('label[for="sentences-toggle"]');
  const snippetsLabel = page.locator('label[for="snippets-toggle"]');

  await expect(wordsLabel).toContainText(`🔤 (${expectedWordsCount})`);
  await expect(sentencesLabel).toContainText(`📝 (${expectedSentencesCount})`);
  await expect(snippetsLabel).toContainText(`✂️ (${expectedSnippetsCount})`);
}

// Helper function to check pre/post review toggle state
async function checkPrePostReviewToggle(page: Page) {
  // Before toggling review mode, verify checkboxes are disabled with 0 counts
  const wordsToggle = page.locator('#words-toggle');
  const sentencesToggle = page.locator('#sentences-toggle');
  const snippetsToggle = page.locator('#snippets-toggle');

  await expect(wordsToggle).toBeDisabled();
  await expect(sentencesToggle).toBeDisabled();
  await expect(snippetsToggle).toBeDisabled();

  // Verify counts are 0 before review mode
  const wordsLabel = page.locator('label[for="words-toggle"]');
  const sentencesLabel = page.locator('label[for="sentences-toggle"]');
  const snippetsLabel = page.locator('label[for="snippets-toggle"]');

  await expect(wordsLabel).toContainText('🔤 (0)');
  await expect(sentencesLabel).toContainText('📝 (0)');
  await expect(snippetsLabel).toContainText('✂️ (0)');

  // toggle review mode on
  const reviewSwitch = page.getByTestId('review-switch');
  await reviewSwitch.click();
  await page.waitForTimeout(500);

  // After toggling review mode, verify checkboxes are enabled with proper counts
  await expect(wordsToggle).not.toBeDisabled();
  await expect(sentencesToggle).not.toBeDisabled();
  await expect(snippetsToggle).not.toBeDisabled();

  // Verify counts are updated after review mode
  await expect(wordsLabel).toContainText('🔤 (5)');
  await expect(sentencesLabel).toContainText('📝 (0)');
  await expect(snippetsLabel).toContainText('✂️ (0)');
}

// Helper function to check review variant checkboxes
async function checkReviewVariantCheckboxes(page: Page) {
  // Toggle the word checkbox
  const wordsToggle = page.locator('#words-toggle');
  await wordsToggle.click();
  await page.waitForTimeout(500);

  const wordsLabel = page.locator('label[for="words-toggle"]');
  await expect(wordsLabel).toContainText('🔤 (0)');

  const sentencesLabel = page.locator('label[for="sentences-toggle"]');
  await expect(sentencesLabel).toContainText('📝 (2)');

  // Toggle the sentences checkbox
  const sentencesToggle = page.locator('#sentences-toggle');
  await sentencesToggle.click();
  await expect(sentencesLabel).toContainText('📝 (0)');
  await page.waitForTimeout(500);
  await expect(sentencesLabel).toContainText('📝 (0)');

  const snippetsLabel = page.locator('label[for="snippets-toggle"]');
  await expect(snippetsLabel).toContainText('✂️ (4)');

  const snippetsToggle = page.locator('#snippets-toggle');
  await snippetsToggle.click();
  await expect(snippetsLabel).toContainText('✂️ (0)');

  // Assert "Done!" is rendered
  await expect(page.getByText('Done!')).toBeVisible();

  await wordsToggle.click();
  await sentencesToggle.click();
  await snippetsToggle.click();

  await expect(page.getByText('Done!')).not.toBeVisible();

  await expect(wordsLabel).toContainText('🔤 (5)');
  await expect(sentencesLabel).toContainText('📝 (0)');
  await expect(snippetsLabel).toContainText('✂️ (0)');
}
async function checkReviewIntervalButtons(page: Page) {
  // click review-interval-increment
  const incrementButton = page.getByTestId('review-interval-increment');
  const decrementButton = page.getByTestId('review-interval-decrement');
  const incrementCount = page.getByTestId('review-interval-count');

  const wordsToggle = page.locator('#words-toggle');
  const sentencesToggle = page.locator('#sentences-toggle');
  const snippetsToggle = page.locator('#snippets-toggle');

  await expect(incrementCount).toHaveText('60s');
  await expect(decrementButton).toBeEnabled();
  await decrementButton.click();
  await checkReviewVariantCounts(page, 1, 0, 0);
  await expect(incrementCount).toHaveText('30s');
  await expect(decrementButton).toBeDisabled();
  await incrementButton.click();
  await expect(incrementCount).toHaveText('60s');
  await checkReviewVariantCounts(page, 5, 0, 0);
  await incrementButton.click();
  await page.waitForTimeout(500);
  await expect(incrementCount).toHaveText('90s');
  await checkReviewVariantCounts(page, 5, 0, 3);
  await incrementButton.click();
  await page.waitForTimeout(500);
  await expect(incrementCount).toHaveText('120s');
  await checkReviewVariantCounts(page, 11, 1, 4);
  await incrementButton.click();
  await page.waitForTimeout(500);
  await expect(incrementCount).toHaveText('150s');
  await checkReviewVariantCounts(page, 11, 3, 5);
  await incrementButton.click();
  await page.waitForTimeout(500);
  await expect(incrementButton).toBeEnabled();
  await checkReviewVariantCounts(page, 16, 8, 5);
  await expect(incrementCount).toHaveText('180s');
  await incrementButton.click();
  await page.waitForTimeout(500);
  await checkReviewVariantCounts(page, 17, 11, 6);
  await expect(incrementButton).toBeDisabled();
  await expect(incrementCount).toHaveText('210s');

  await wordsToggle.click();
  await checkReviewVariantCounts(page, 0, 11, 6);
  await sentencesToggle.click();
  await checkReviewVariantCounts(page, 0, 0, 6);
  await snippetsToggle.click();
  // reset
  await wordsToggle.click();
  await checkReviewVariantCounts(page, 17, 0, 0);
  await wordsToggle.click();
  await sentencesToggle.click();
  await checkReviewVariantCounts(page, 0, 16, 0);
  await wordsToggle.click();
  await snippetsToggle.click();

  await decrementButton.click();
  await decrementButton.click();
  await decrementButton.click();
  await decrementButton.click();
  await decrementButton.click();
  await expect(incrementCount).toHaveText('60s');
  await checkReviewVariantCounts(page, 5, 0, 0);
}

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test('review mode', async ({ page }) => {
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

  await expect(page.getByText('Done!')).not.toBeVisible();
  await checkPrePostReviewToggle(page);
  await checkReviewVariantCheckboxes(page);
  await checkReviewIntervalButtons(page);
});
