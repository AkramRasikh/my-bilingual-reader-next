import { expect, Page } from '@playwright/test';
import { landingMetaData } from './landing-meta-data';

// Content IDs used in tests
export const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';
export const secondContentId = '9007135c-20a0-4481-9ba7-53f7866e962e';
export const thirdContentId = '814797e3-2a33-4654-a754-3cf3754592cc';
export const fourthContentId = '2cb4ff62-1826-4e76-adb4-f3bd2700c90b';
export const firstDueWordId = '2c08d190-1e96-4147-955a-79620e210c37';
export const firstNonDueWordId = '330a7f02-0971-4281-9be6-24b8d68114db';
const contentData = landingMetaData[0]; // Using the first content item for navigation test
const contentTitle = contentData.title; // Using the first content item for navigation test

export async function sentenceToastMessage(page: Page, isLearned: boolean) {
  const firstToastMessage = page.getByText(
    isLearned ? 'Successful learned sentence ✅' : 'Sentence reviewed ✅',
  );
  await expect(firstToastMessage).toBeVisible();
}

// Helper function to check sentence count
export async function checkSentenceCount(page: Page, expectedText: string) {
  const sentencesCount = page.getByTestId('progress-header-text');
  await expect(sentencesCount).toBeVisible();
  await expect(sentencesCount).toContainText(
    expectedText.replace('Sentences: ', ''),
  );
}

// Helper function to check words count
export async function checkWordsTabCount(page: Page, expectedText: string) {
  const wordsTabTrigger = page.getByTestId('words-tab-trigger');
  await expect(wordsTabTrigger).toBeVisible();
  await expect(wordsTabTrigger).toContainText(expectedText);
  return wordsTabTrigger;
}

// Helper function to check words due count
export async function checkWordsDueMeta(page: Page, expectedText: string) {
  const dueCount = expectedText.replace('Words Due: ', '');
  const wordsDue = page.getByTestId('progress-header-text');
  await expect(wordsDue).toBeVisible();
  await expect(wordsDue).toContainText(`🔤 ${dueCount}/`);
}

// Helper function to check snippets due count
export async function checkSnippetsDueMeta(page: Page, expectedText: string) {
  const [due, withReview] = expectedText
    .replace('Snippets Due: ', '')
    .split('/');
  const snippetsDue = page.getByTestId('progress-header-text');
  await expect(snippetsDue).toBeVisible();
  await expect(snippetsDue).toContainText(`✂️ ${due}/${withReview}`);
}

// Helper function to check progress header text
export async function checkProgressHeader(page: Page, expectedText: string) {
  const progressHeader = page.getByTestId('progress-header-text');
  await expect(progressHeader).toBeVisible();
  await expect(progressHeader).toContainText(expectedText);
}

// Helper function to check learning screen tab
export async function checkLearningScreenTab(
  page: Page,
  testId: string,
  expectedText: string,
  shouldBeDisabled?: boolean,
) {
  const tabTrigger = page.getByTestId(testId);
  await expect(tabTrigger).toBeVisible();
  await expect(tabTrigger).toContainText(expectedText);
  if (shouldBeDisabled !== undefined) {
    if (shouldBeDisabled) {
      await expect(tabTrigger).toBeDisabled();
    } else {
      await expect(tabTrigger).toBeEnabled();
    }
  }
}

// Helper function to check video control toggle/button presence
export async function checkVideoControl(
  page: Page,
  labelTestId: string,
  switchTestId: string,
  expectedLabelText: string,
) {
  const label = page.getByTestId(labelTestId);
  await expect(label).toBeVisible();
  await expect(label).toContainText(expectedLabelText);

  const toggle = page.getByTestId(switchTestId);
  await expect(toggle).toBeVisible();
}

// Helper function to check English transcript toggles
export async function checkEnglishTranscriptToggles(page: Page) {
  // Check that English text is visible for first transcript item
  const firstTranscriptEnglish = page.getByTestId(
    `transcript-base-lang-${firstContentId}`,
  );
  await expect(firstTranscriptEnglish).toBeVisible();
  await expect(firstTranscriptEnglish).toContainText('Easy Linguistics Radio');

  // Check that English text is visible for second transcript item
  const secondTranscriptEnglish = page.getByTestId(
    `transcript-base-lang-${secondContentId}`,
  );
  await expect(secondTranscriptEnglish).toBeVisible();
  await expect(secondTranscriptEnglish).toContainText(
    'Mizu/I read this novel recently.',
  );

  // Press the English toggle to hide English text
  const englishToggle = page.getByTestId('english-switch');
  await englishToggle.click();

  // Wait for toggle to take effect
  await page.waitForTimeout(500);

  // Assert that English texts are no longer visible
  await expect(firstTranscriptEnglish).not.toBeVisible();
  await expect(secondTranscriptEnglish).not.toBeVisible();

  // Toggle back to show English text again
  await englishToggle.click();
  await page.waitForTimeout(500);

  // Verify English text is visible again
  await expect(firstTranscriptEnglish).toBeVisible();
  await expect(secondTranscriptEnglish).toBeVisible();
}

export async function goFromLandingToLearningScreen(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(page.url()).toContain('/');
  const contentButton = page.getByTestId(`content-item-${contentTitle}`);
  await contentButton.click();
  await page.waitForURL(`**/content?topic=${contentTitle}`);
}

// Helper function to check pre/post review toggle state
export async function checkPrePostReviewToggle(page: Page) {
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
  await expect(reviewSwitch).toBeVisible();
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

// Helper function to check initial action bar button visibility
async function checkInitialActionButtons(page: Page) {
  const learningScreenActionBar = page.getByTestId(
    'learning-screen-action-bar',
  );
  await expect(learningScreenActionBar).toBeVisible();
  await expect(page.getByTestId('study-here-button')).toHaveCount(0);
  await expect(page.getByTestId('current-button')).toHaveCount(0);
  await expect(page.getByTestId('checkpoint-button')).toHaveCount(0);

  const checkpointTimestamp = page.getByTestId('checkpoint-timestamp');
  await expect(checkpointTimestamp).toBeVisible();
  await expect(checkpointTimestamp).toHaveText(/🚩\s+\d+:\d{2}(?::\d{2})?/);
}

export async function triggerTrackSwitch(page: Page) {
  const trackCurrentSwitch = page.getByTestId('track-current-switch');
  await expect(trackCurrentSwitch).toBeVisible();
  await trackCurrentSwitch.click();
}

// Main orchestrator function for checking action bar buttons in non-review state
export async function checkActionBarButtons(page: Page) {
  await checkInitialActionButtons(page);
}

export const highlightJapaneseText = async (page: Page) => {
  const selectionSuccess = await page.evaluate(() => {
    const targetText = '目で見ること';
    const paragraphs = Array.from(
      document.querySelectorAll('[data-testid="video-player-snippet-text"]'),
    );

    for (const p of paragraphs) {
      const text = p.textContent || '';
      const index = text.indexOf(targetText);

      if (index !== -1) {
        const range = document.createRange();
        const textNode = p.firstChild;

        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, index);
          range.setEnd(textNode, index + targetText.length);

          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);

          // Trigger mouseup event
          const mouseUpEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          document.dispatchEvent(mouseUpEvent);

          return true;
        }
      }
    }
    return false;
  });

  return selectionSuccess;
};

export const checkBulkReviewCount = async (
  page: Page,
  expectedCount: number,
) => {
  const bulkReviewButton = page.getByTestId('bulk-review-button');
  await expect(bulkReviewButton).toBeVisible();
  await expect(bulkReviewButton).toHaveText(`💰 ${expectedCount}`);
  if (expectedCount > 0) {
    await expect(bulkReviewButton).toBeEnabled();
  } else {
    await expect(bulkReviewButton).toBeDisabled();
  }
};
