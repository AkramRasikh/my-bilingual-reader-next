import { test, expect, Page } from '@playwright/test';
import {
  checkSentenceCount,
  checkSentenceRepsCount,
  goFromLandingToLearningScreen,
  sentenceToastMessage,
  thirdContentId,
  triggerTrackSwitch,
  firstContentId,
} from './helpers/content-screen-helpers';
import {
  mockUpdateSentenceOneMinuteAPI,
  mockGetOnLoadDataE2E,
} from './helpers/mock-api';
import { initScriptsE2e } from './helpers/init-scripts';

const thirdPlayButtonAndShiftReview = async (page: Page) => {
  await page.evaluate(() => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = 6;
      video.play();
    }
  });
  await page.waitForTimeout(500);
  await page.keyboard.press('Shift+P');
  const loadingSpinner = page.getByTestId(
    `transcript-action-loading-${thirdContentId}`,
  );
  await expect(loadingSpinner).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  // await setupApiMocks(page);
  await initScriptsE2e(page);
  await mockGetOnLoadDataE2E(page);
});

test.describe('Keyboard actions', () => {
  test('review sentence using Shift+P keyboard shortcut', async ({ page }) => {
    await mockUpdateSentenceOneMinuteAPI(page);
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);
    await checkSentenceCount(page, 'Sentences: 153/200');
    await checkSentenceRepsCount(page, 'Reps: 0');
    await page.waitForTimeout(2000);
    await thirdPlayButtonAndShiftReview(page);
    await sentenceToastMessage(page, false);
    await checkSentenceRepsCount(page, 'Reps: 1');
    await checkSentenceCount(page, 'Sentences: 153/201');
    await page.route('**/api/updateSentence', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reviewData: {},
        }),
      });
    });
    await thirdPlayButtonAndShiftReview(page);
    await sentenceToastMessage(page, true);
    await checkSentenceCount(page, 'Sentences: 153/200');
    await checkSentenceRepsCount(page, 'Reps: 2');
  });

  test('breakdown sentence using Shift+B keyboard shortcut', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);
    await checkSentenceCount(page, 'Sentences: 153/200');
    await checkSentenceRepsCount(page, 'Reps: 0');
    const brickEmoji = page.getByTestId(
      `transcript-breakdown-complete-${firstContentId}`,
    );
    await expect(brickEmoji).not.toBeVisible();
    const firstPlayButton = page.getByTestId(
      `transcript-play-button-${firstContentId}`,
    );
    await firstPlayButton.click();
    await page.keyboard.press('Shift+B');
    const loadingHammer = page.getByTestId(
      `transcript-breakdown-loading-${firstContentId}`,
    );
    await expect(loadingHammer).toBeVisible();
    const toastMessage = page.getByText('Sentence broken down 🧱🔨!');
    await expect(toastMessage).toBeVisible({ timeout: 3000 });
    await expect(loadingHammer).not.toBeVisible({ timeout: 5000 });
    await expect(brickEmoji).toBeVisible();
    await expect(brickEmoji).toContainText('🧱');
  });
});
