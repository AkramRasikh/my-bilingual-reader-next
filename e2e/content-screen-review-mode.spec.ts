import { test, expect, Page } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { landingMetaData } from './helpers/landing-meta-data';
import {
  checkSentenceCount,
  checkSnippetsDueMeta,
  checkWordsDueMeta,
} from './content-screen.spec';
import { mockEasyLinguisticsRadioSignLangIslandSnippets } from './mock-data/easy-linguistics-radio-sign-lang-island';

const contentData = landingMetaData[0];
const contentTitle = contentData.title;

const firstDueWord = {
  definition: 'summary; Synopsis',
  id: '860b155c-45fc-433d-8c77-d43e4e1d87b4',
};

const secondDueWord = {
  definition: 'Difficulty',
  id: 'c277baca-452d-416e-8334-c517ca36e59d',
};

const thirdDueWord = {
  definition: 'signs; sign',
  id: 'ee863404-57ff-4393-82f0-beb8c92b3cb0',
};

const fourthDueWord = {
  definition: 'Speaker',
  id: '0e98f24f-aaee-4b52-a1e3-aad4af3570cf',
};

const fifthDueWord = {
  definition:
    'were forced (to experience) or something; Or they were forced to',
  id: '8099e324-61ab-4ac0-984c-c1571a1ae912',
};

const firstSnippet = '75a51c0b-9378-4f44-8ea5-e8e3013abd23';
const secondSnippet = '3eca4d57-72f3-40ba-95f9-ec7dfe35635a';
const thirdSnippet = '7f3b7a90-4419-48e1-b4a3-527ab83e4014';
const fourthSnippet = '4fee7322-f0db-41d1-b671-e8c472bcc395';

const firstDueSentenceId = '7c5ba8cc-c745-422e-b0f5-4c8ab884744d';
const secondDueSentenceId = '24cb7886-50d5-4ee9-85e8-55eb099faf5a';

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

async function reviewWord(page: Page, wordId: string) {
  const reviewSRSToggles = page.getByTestId(`review-srs-toggles-${wordId}`);
  await expect(reviewSRSToggles).toBeVisible();

  // Find and click the "2 days" button
  const threeDaysButton = reviewSRSToggles.getByRole('button', {
    name: /3 days/i,
  });
  await expect(threeDaysButton).toBeVisible();

  // Mock the /api/updateWord call for the SRS review
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  await page.route('**/api/updateWord', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reviewData: {
          difficulty: 7.1949,
          due: twoDaysFromNow.toISOString(),
          ease: 2.5,
          elapsed_days: 0,
          interval: 0,
          lapses: 0,
          last_review: new Date().toISOString(),
          reps: 1,
          scheduled_days: 0,
          stability: 0.40255,
          state: 1,
        },
      }),
    });
  });
  await threeDaysButton.click();
  await page.waitForTimeout(500);
}

async function reviewSnippet(page: Page, snippetId: string) {
  await page.route('**/api/updateContentMetaData', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        snippets: [
          ...mockEasyLinguisticsRadioSignLangIslandSnippets,
          {
            baseLang: '*****',
            focusedText: '****',
            id: snippetId,
            isContracted: true,
            reviewData: {
              difficulty: 7.1949,
              due: new Date().toISOString(),
              ease: 2.5,
              elapsed_days: 0,
              interval: 0,
              lapses: 0,
              last_review: new Date().toISOString(),
              reps: 1,
              scheduled_days: 0,
              stability: 0.40255,
              state: 1,
            },
            suggestedFocusText: '****',
            targetLang: '****',
            time: 1000,
          },
        ],
      }),
    });
  });

  const reviewSRSTogglesForSnippet = page.getByTestId(
    `review-srs-toggles-${snippetId}`,
  );

  await reviewSRSTogglesForSnippet.locator('button').nth(3).click();
  await page.waitForTimeout(1000);
}

async function reviewSentence(page: Page, sentenceId: string) {
  //refactor to one
  const reviewSRSTogglesForSentence = page.getByTestId(
    `review-srs-toggles-${sentenceId}`,
  );

  await reviewSRSTogglesForSentence.locator('button').nth(3).click();
  await page.waitForTimeout(1000);
}

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test('review mode toggle settings (widgets & time interval)', async ({
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

  await expect(page.getByText('Done!')).not.toBeVisible();
  await checkPrePostReviewToggle(page);
  await checkReviewVariantCheckboxes(page);
  await checkReviewIntervalButtons(page);
});

test.only('review each variant - words/sentences/snippets - follows a change in review numbers', async ({
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
  await checkPrePostReviewToggle(page);
  // check meta data
  await checkWordsDueMeta(page, 'Words Due: 55');
  await checkSentenceCount(page, '153/200');

  await checkReviewVariantCounts(page, 5, 0, 0);

  await reviewWord(page, firstDueWord.id);
  await checkWordsDueMeta(page, 'Words Due: 54');
  await checkReviewVariantCounts(page, 4, 0, 0);
  await reviewWord(page, secondDueWord.id);
  await checkWordsDueMeta(page, 'Words Due: 53');
  await checkReviewVariantCounts(page, 3, 0, 0);
  await reviewWord(page, thirdDueWord.id);
  await checkWordsDueMeta(page, 'Words Due: 52');
  await checkReviewVariantCounts(page, 2, 0, 0);
  await reviewWord(page, fourthDueWord.id);
  await checkWordsDueMeta(page, 'Words Due: 51');
  await checkReviewVariantCounts(page, 1, 0, 0);
  await reviewWord(page, fifthDueWord.id);
  await checkWordsDueMeta(page, 'Words Due: 50');
  await checkReviewVariantCounts(page, 6, 2, 4);

  await checkSnippetsDueMeta(page, 'Snippets Due: 225/292/292');
  await reviewSnippet(page, firstSnippet);

  await checkReviewVariantCounts(page, 6, 2, 3);
  await checkSnippetsDueMeta(page, 'Snippets Due: 224/292/292');

  await reviewSnippet(page, secondSnippet);
  await checkReviewVariantCounts(page, 6, 2, 2);
  await checkSnippetsDueMeta(page, 'Snippets Due: 223/292/292');

  await reviewSnippet(page, fourthSnippet);
  await checkReviewVariantCounts(page, 6, 2, 1);
  await checkSnippetsDueMeta(page, 'Snippets Due: 222/292/292');

  await reviewSnippet(page, thirdSnippet);
  await checkReviewVariantCounts(page, 6, 2, 0);
  await checkSnippetsDueMeta(page, 'Snippets Due: 221/292/292');

  // Find the review SRS toggles container
  await reviewSentence(page, firstDueSentenceId);
  await checkReviewVariantCounts(page, 6, 1, 0);
  await checkSentenceCount(page, '152/200');

  await reviewSentence(page, secondDueSentenceId);
  await checkReviewVariantCounts(page, 6, 0, 0);
  await checkSentenceCount(page, '151/200');

  // review-srs-toggles-4fee7322-f0db-41d1-b671-e8c472bcc395
  //
});
