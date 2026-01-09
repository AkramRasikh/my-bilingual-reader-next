import { expect, Page } from '@playwright/test';

// Content IDs used in tests
export const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';
export const secondContentId = '9007135c-20a0-4481-9ba7-53f7866e962e';
export const thirdContentId = '814797e3-2a33-4654-a754-3cf3754592cc';
export const checkPointContentId = '97d7e891-a669-4bb4-abe6-a4cb60631666';
export const firstDueWordId = '2c08d190-1e96-4147-955a-79620e210c37';
export const firstNonDueWordId = '330a7f02-0971-4281-9be6-24b8d68114db';

// Helper function to check sentence count
export async function checkSentenceCount(page: Page, expectedText: string) {
  const sentencesCount = page.getByTestId('analytics-sentences-count');
  await expect(sentencesCount).toBeVisible();
  await expect(sentencesCount).toContainText(expectedText);
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
  const wordsDue = page.getByTestId('analytics-words-due');
  await expect(wordsDue).toBeVisible();
  await expect(wordsDue).toContainText(expectedText);
}

// Helper function to check snippets due count
export async function checkSnippetsDueMeta(page: Page, expectedText: string) {
  const snippetsDue = page.getByTestId('analytics-snippets-due');
  await expect(snippetsDue).toBeVisible();
  await expect(snippetsDue).toContainText(expectedText);
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

// Helper function to check action bar buttons in non-review state
export async function checkActionBarButtons(page: Page) {
  // Check Study here button is visible
  const studyHereButton = page.getByTestId('study-here-button');
  await expect(studyHereButton).toBeVisible();
  await expect(studyHereButton).toContainText('Study here');

  // Check Current button is visible
  const currentButton = page.getByTestId('current-button');
  await expect(currentButton).toBeVisible();
  await expect(currentButton).toContainText('Current');

  // Check Checkpoint button is visible
  const checkpointButton = page.getByTestId('checkpoint-button');
  await expect(checkpointButton).toBeVisible();
  await expect(checkpointButton).toContainText('Checkpoint');

  // Verify checkpoint transcript item is NOT in viewport before clicking
  const checkpointTranscriptItem = page.getByTestId(
    `transcript-target-lang-${checkPointContentId}`,
  );
  const checkpointNotVisibleInitially = await checkpointTranscriptItem.evaluate(
    (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },
  );
  expect(checkpointNotVisibleInitially).toBe(false);

  // Click Checkpoint button
  await checkpointButton.click();

  // Wait for 2 seconds
  await page.waitForTimeout(2000);

  // Verify checkpoint transcript item IS in viewport after scroll
  const checkpointVisibleAfterScroll = await checkpointTranscriptItem.evaluate(
    (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },
  );
  expect(checkpointVisibleAfterScroll).toBe(true);

  // Verify first transcript item is NOT in viewport after scroll
  const firstTranscriptItem = page.getByTestId(
    `transcript-target-lang-${firstContentId}`,
  );
  const firstNotVisibleAfterScroll = await firstTranscriptItem.evaluate(
    (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },
  );
  expect(firstNotVisibleAfterScroll).toBe(false);

  // Click play on the first transcript item
  const firstPlayButton = page.getByTestId(
    `transcript-play-button-${firstContentId}`,
  );
  await expect(firstPlayButton).toBeVisible();
  await firstPlayButton.click();

  // Wait for play action to register
  await page.waitForTimeout(1000);

  // Click Current button to scroll to the playing item
  await currentButton.click();

  // Wait for scroll animation
  await page.waitForTimeout(2000);

  // Verify first transcript item IS in viewport after clicking Current
  const firstVisibleAfterCurrent = await firstTranscriptItem.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  expect(firstVisibleAfterCurrent).toBe(true);

  // Verify checkpoint transcript item is NOT in viewport after clicking Current
  const checkpointNotVisibleAfterCurrent =
    await checkpointTranscriptItem.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    });
  expect(checkpointNotVisibleAfterCurrent).toBe(false);

  // Click play on the third transcript item
  const thirdPlayButton = page.getByTestId(
    `transcript-play-button-${thirdContentId}`,
  );
  await expect(thirdPlayButton).toBeVisible();
  await thirdPlayButton.click();

  // Wait for play action to register
  await page.waitForTimeout(1000);

  // Click Study here button
  await studyHereButton.click();

  // Wait for study mode to activate
  await page.waitForTimeout(500);

  // Verify Study here button text becomes "Study here 3"
  await expect(studyHereButton).toContainText('Study here 3');

  // Verify Clear button is visible
  const clearButton = page.getByTestId('clear-button');
  await expect(clearButton).toBeVisible();
  await expect(clearButton).toContainText('Clear');

  // Verify first transcript item is NOT visible in UI
  const firstTranscriptItemAfterStudy = page.getByTestId(
    `transcript-target-lang-${firstContentId}`,
  );
  await expect(firstTranscriptItemAfterStudy).not.toBeVisible();

  // Verify second transcript item is NOT visible in UI
  const secondTranscriptItem = page.getByTestId(
    `transcript-target-lang-${secondContentId}`,
  );
  await expect(secondTranscriptItem).not.toBeVisible();

  // Verify TranscriptItemSecondary shows the third content
  const thirdContentJapaneseText = page.getByText(
    '堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
  );
  await expect(thirdContentJapaneseText).toHaveCount(2);

  const thirdContentEnglishTextShort = page.getByText(
    'Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
  );
  await expect(thirdContentEnglishTextShort).toHaveCount(2);

  // Check for the long English text (may have special quotes)
  const transcriptSecondary = page.getByTestId('transcript-item-secondary');
  await expect(transcriptSecondary).toBeVisible();
  await expect(transcriptSecondary).toContainText('Hori: Yes, yes. Mizuki:');
  await expect(transcriptSecondary).toContainText(
    'but if I talk about this summary',
  );

  const thirdContentEnglishTextLong = page.getByText(
    `Hori: Yes, yes. Mizuki: It is a novel called 'Let's talk with words seen by the eyes,' but if I talk about this summary,`,
  );
  await expect(thirdContentEnglishTextLong).toBeVisible();
}
