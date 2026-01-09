import { test, expect } from '@playwright/test';
import { landingMetaData } from './helpers/landing-meta-data';
import { waitForMediaMetadata } from './helpers/wait-for-media';
import { checkSentenceCount } from './helpers/content-screen-helpers';
import { setupApiMocks } from './helpers/mock-api';

const contentData = landingMetaData[0];
const contentTitle = contentData.title;

const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test.describe('Keyboard actions', () => {
  test('review sentence using Shift+P keyboard shortcut', async ({ page }) => {
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

    // Verify initial sentence count and reps are 0
    await checkSentenceCount(page, '/200');
    const sentencesCount = page.getByTestId('analytics-sentences-count');

    const repsCount = page.getByTestId('analytics-reps-count');
    await expect(repsCount).toBeVisible();
    await expect(repsCount).toContainText('Reps: 0');

    // Wait for audio/video to load before attempting to play
    await page.waitForTimeout(1000);

    // Press Shift+P keyboard shortcut to review the sentence
    await page.keyboard.press('Shift+P');

    // Verify loading spinner appears in the action bar
    const loadingSpinner = page.getByTestId(
      `transcript-action-loading-${firstContentId}`,
    );
    await expect(loadingSpinner).toBeVisible();

    // Verify toast message appears
    const toastMessage = page.getByText('Sentence reviewed ✅');
    await expect(toastMessage).toBeVisible({ timeout: 3000 });

    // Wait for the loading to complete
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

    // Verify reps count increased to 1
    await expect(repsCount).toContainText('Reps: 1');

    // Verify sentence count increased by 1 in the denominator
    const finalSentencesText = await sentencesCount.textContent();
    expect(finalSentencesText).toContain('/201');

    // Press Shift+P again to remove the review
    await page.keyboard.press('Shift+P');

    // Verify loading spinner appears again
    await expect(loadingSpinner).toBeVisible();

    // Verify toast message appears for learning sentence
    const toastMessageLearned = page.getByText(
      'Successful learned sentence ✅',
    );
    await expect(toastMessageLearned).toBeVisible({ timeout: 3000 });

    // Wait for the loading to complete
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

    // Verify reps count increased to 2
    await expect(repsCount).toContainText('Reps: 2');

    // Verify sentence count reverted back to original
    const revertedSentencesText = await sentencesCount.textContent();
    expect(revertedSentencesText).toContain('/200');
    //
  });

  test('breakdown sentence using Shift+B keyboard shortcut', async ({
    page,
  }) => {
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

    // Wait for media metadata to load
    await waitForMediaMetadata(page);

    // Use specific content ID for reliable targeting

    // Scope to transcript tab to avoid confusion with TranscriptItemSecondary
    const transcriptTab = page.locator(
      '[role="tabpanel"][data-state="active"]',
    );

    // Verify brick emoji is NOT visible initially (sentence not broken down)
    const brickEmoji = transcriptTab.getByTestId(
      `transcript-breakdown-complete-${firstContentId}`,
    );
    await expect(brickEmoji).not.toBeVisible();

    // Press Shift+B keyboard shortcut to breakdown the sentence
    await page.keyboard.press('Shift+B');

    // Verify loading hammer icon appears
    const loadingHammer = transcriptTab.getByTestId(
      `transcript-breakdown-loading-${firstContentId}`,
    );
    await expect(loadingHammer).toBeVisible();

    // Verify toast message appears
    const toastMessage = page.getByText('Sentence broken down 🧱🔨!');
    await expect(toastMessage).toBeVisible({ timeout: 3000 });

    // Wait for loading to complete
    await expect(loadingHammer).not.toBeVisible({ timeout: 5000 });

    // Verify brick emoji appears indicating sentence is broken down
    await expect(brickEmoji).toBeVisible();
    await expect(brickEmoji).toContainText('🧱');
  });
});
