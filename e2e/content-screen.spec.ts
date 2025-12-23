import { test, expect, Page } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { landingMetaData } from './helpers/landing-meta-data';
import { mockEasyLinguisticsRadioSignLangIslandSnippets } from './mock-data/easy-linguistics-radio-sign-lang-island';

const contentData = landingMetaData[0]; // Using the first content item for navigation test
const contentTitle = contentData.title; // Using the first content item for navigation test

const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';
const secondContentId = '9007135c-20a0-4481-9ba7-53f7866e962e';
const thirdContentId = '814797e3-2a33-4654-a754-3cf3754592cc';

// Helper function to check sentence count
async function checkSentenceCount(page: Page, expectedText: string) {
  const sentencesCount = page.getByTestId('analytics-sentences-count');
  await expect(sentencesCount).toBeVisible();
  await expect(sentencesCount).toContainText(expectedText);
}

// Helper function to check words count
async function checkWordsTabCount(page: Page, expectedText: string) {
  const wordsTabTrigger = page.getByTestId('words-tab-trigger');
  await expect(wordsTabTrigger).toBeVisible();
  await expect(wordsTabTrigger).toContainText(expectedText);
  return wordsTabTrigger;
}

// Helper function to check words due count
async function checkWordsDueMeta(page: Page, expectedText: string) {
  const wordsDue = page.getByTestId('analytics-words-due');
  await expect(wordsDue).toBeVisible();
  await expect(wordsDue).toContainText(expectedText);
}

// Helper function to check snippets due count
async function checkSnippetsDueMeta(page: Page, expectedText: string) {
  const snippetsDue = page.getByTestId('analytics-snippets-due');
  await expect(snippetsDue).toBeVisible();
  await expect(snippetsDue).toContainText(expectedText);
}

// Helper function to check progress header text
async function checkProgressHeader(page: Page, expectedText: string) {
  const progressHeader = page.getByTestId('progress-header-text');
  await expect(progressHeader).toBeVisible();
  await expect(progressHeader).toContainText(expectedText);
}

// Helper function to check learning screen tab
async function checkLearningScreenTab(
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

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test.only('landing screen -> learning content screen navigation', async ({
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

  // home header
  const heading = page.getByTestId('breadcrumb-heading');
  await expect(heading).toContainText('Home');
  // left side meta data
  await checkSentenceCount(page, '153/200');
  await checkWordsDueMeta(page, 'Words Due: 55');
  await checkSnippetsDueMeta(page, 'Snippets Due: 225/292/292');
  await checkProgressHeader(page, '0/153');

  const bulkReviewBefore = page.getByText('Bulk Review: 5');
  await expect(bulkReviewBefore).toBeVisible();

  const repsCount = page.getByTestId('analytics-reps-count');
  await expect(repsCount).toContainText('Reps: 0');

  // tab data
  await checkWordsTabCount(page, 'Words 55/84');
  await checkLearningScreenTab(
    page,
    'transcript-tab-trigger',
    'Transcript',
    false,
  );
  await checkLearningScreenTab(
    page,
    'comprehensive-tab-trigger',
    'Comprehensive',
    true,
  );
  await checkLearningScreenTab(page, 'words-tab-trigger', 'Words 55/84', false);
  await checkLearningScreenTab(page, 'meta-tab-trigger', 'Meta', false);

  // ProgressHeader 0/153

  //
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
  await checkSentenceCount(page, '/200');
  const sentencesCount = page.getByTestId('analytics-sentences-count');
  const initialSentencesText = await sentencesCount.textContent();

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

test('save word from transcript item - error handling', async ({ page }) => {
  // Setup API mocking for saveWord with error response
  await page.route('**/api/saveWord', async (route) => {
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

  // Verify initial Words count
  const wordsTabTrigger = page.getByTestId('words-tab-trigger');
  await expect(wordsTabTrigger).toBeVisible();
  await expect(wordsTabTrigger).toContainText('Words 55/84');

  // Find the transcript item
  const transcriptTargetLang = page.getByTestId(
    `transcript-target-lang-${contentId}`,
  );
  await expect(transcriptTargetLang).toBeVisible();

  // Get the text content to verify it contains "言語学"
  const transcriptText = await transcriptTargetLang.textContent();
  expect(transcriptText).toContain('言語学');

  // Select/highlight the text "言語学" using page.evaluate
  const selectionSuccess = await page.evaluate((id) => {
    const container = document.querySelector(
      `[data-testid="transcript-target-lang-${id}"]`,
    );
    if (!container) {
      return false;
    }

    const spans = Array.from(container.querySelectorAll('span'));
    const targetChars = ['言', '語', '学'];

    let startSpan = null;
    let endSpan = null;

    for (let i = 0; i < spans.length - 2; i++) {
      if (
        spans[i].textContent === targetChars[0] &&
        spans[i + 1].textContent === targetChars[1] &&
        spans[i + 2].textContent === targetChars[2]
      ) {
        startSpan = spans[i];
        endSpan = spans[i + 2];
        break;
      }
    }

    if (!startSpan || !endSpan) {
      return false;
    }

    const range = document.createRange();
    const startTextNode = startSpan.firstChild || startSpan;
    const endTextNode = endSpan.firstChild || endSpan;

    range.setStart(startTextNode, 0);
    range.setEnd(endTextNode, endTextNode.textContent?.length || 1);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    document.dispatchEvent(mouseUpEvent);

    return true;
  }, contentId);

  expect(selectionSuccess).toBe(true);

  // Wait for the state to update
  await page.waitForTimeout(1000);

  // Verify that HighlightedText component is rendered
  const openaiButton = page.getByTestId('save-word-openai-button');
  await expect(openaiButton).toBeVisible();

  // Click the OpenAI save button
  await openaiButton.click();

  // Verify loading spinner appears
  const loadingSpinner = page.getByTestId(
    `transcript-action-loading-${contentId}`,
  );
  await expect(loadingSpinner).toBeVisible();

  // Verify error toast message appears
  const errorToastMessage = page.getByText('Failed to save word 🫤❌');
  await expect(errorToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after error
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify highlighted text is cleared (buttons should disappear)
  await expect(openaiButton).not.toBeVisible();

  // Verify Words count remained at 55/84 (no change due to error)
  await checkWordsTabCount(page, 'Words 55/84');

  // Verify the word is NOT underlined (since save failed)
  const underlinedWord = transcriptTargetLang
    .locator('span')
    .filter({ hasText: '語' })
    .first();

  // Move mouse to the word location
  const boundingBox = await underlinedWord.boundingBox();
  if (boundingBox) {
    await page.mouse.move(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2,
    );
  }
  await page.waitForTimeout(1000);

  // Verify hover card does NOT appear (word was not saved)
  const hoverWordInfo = page.getByTestId('hover-word-info');
  await expect(hoverWordInfo).not.toBeVisible();
});

test('delete word from transcript item - error handling', async ({ page }) => {
  // Setup API mocking for saveWord (success)
  await page.route('**/api/saveWord', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        word: {
          id: '83b75769-a67d-4f8a-9baa-9716bdd78219',
          contexts: ['f378ec1d-c885-4e6a-9821-405b0ff9aa24'],
          surfaceForm: '言語学',
          definition: 'linguistics',
          transliteration: 'gengogaku',
          baseForm: '言語学',
          phonetic: 'げんごがく',
          notes:
            '言語学 (gengogaku) specifically refers to the scientific study of language, encompassing various aspects such as syntax, semantics, and phonetics. In the context of ゆる言語学ラジオ, it suggests a more relaxed or informal approach to discussing topics related to linguistics.',
          reviewData: {
            due: '2025-12-16T20:17:44.113Z',
            stability: 0.40255,
            difficulty: 7.1949,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 1,
            lapses: 0,
            state: 1,
            last_review: '2025-12-16T20:16:44.113Z',
            ease: 2.5,
            interval: 0,
          },
        },
      }),
    });
  });

  // Setup API mocking for deleteWord (error)
  await page.route('**/api/deleteWord', async (route) => {
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

  // Verify initial Words count
  const wordsTabTrigger = page.getByTestId('words-tab-trigger');
  await expect(wordsTabTrigger).toBeVisible();
  await expect(wordsTabTrigger).toContainText('Words 55/84');

  // Find the transcript item
  const transcriptTargetLang = page.getByTestId(
    `transcript-target-lang-${contentId}`,
  );
  await expect(transcriptTargetLang).toBeVisible();

  // Select and save the word "言語学" (same as previous test)
  const selectionSuccess = await page.evaluate((id) => {
    const container = document.querySelector(
      `[data-testid="transcript-target-lang-${id}"]`,
    );
    if (!container) {
      return false;
    }

    const spans = Array.from(container.querySelectorAll('span'));
    const targetChars = ['言', '語', '学'];

    let startSpan = null;
    let endSpan = null;

    for (let i = 0; i < spans.length - 2; i++) {
      if (
        spans[i].textContent === targetChars[0] &&
        spans[i + 1].textContent === targetChars[1] &&
        spans[i + 2].textContent === targetChars[2]
      ) {
        startSpan = spans[i];
        endSpan = spans[i + 2];
        break;
      }
    }

    if (!startSpan || !endSpan) {
      return false;
    }

    const range = document.createRange();
    const startTextNode = startSpan.firstChild || startSpan;
    const endTextNode = endSpan.firstChild || endSpan;

    range.setStart(startTextNode, 0);
    range.setEnd(endTextNode, endTextNode.textContent?.length || 1);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    document.dispatchEvent(mouseUpEvent);

    return true;
  }, contentId);

  expect(selectionSuccess).toBe(true);
  await page.waitForTimeout(1000);

  // Click save button
  const openaiButton = page.getByTestId('save-word-openai-button');
  await expect(openaiButton).toBeVisible();
  await openaiButton.click();

  // Wait for save to complete
  const loadingSpinner = page.getByTestId(
    `transcript-action-loading-${contentId}`,
  );
  await expect(loadingSpinner).toBeVisible();
  const toastMessage = page.getByText('言語学 saved!');
  await expect(toastMessage).toBeVisible({ timeout: 3000 });
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify Words count increased to 55/85
  await checkWordsTabCount(page, 'Words 55/85');

  // Now hover over the saved word to open hover card
  const underlinedWord = transcriptTargetLang
    .locator('span')
    .filter({ hasText: '語' })
    .first();
  await expect(underlinedWord).toBeVisible();

  const boundingBox = await underlinedWord.boundingBox();
  if (boundingBox) {
    await page.mouse.move(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2,
    );
  }

  await page.waitForTimeout(1000);

  // Verify hover card appears
  const hoverWordInfo = page.getByTestId('hover-word-info');
  await expect(hoverWordInfo).toBeVisible();

  // Click Delete button
  const deleteButton = page.getByTestId('delete-button');
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // Click Confirm Delete
  const confirmDeleteButton = page.getByRole('button', {
    name: 'Confirm Delete',
  });
  await expect(confirmDeleteButton).toBeVisible();
  await confirmDeleteButton.click();

  // Verify loading spinner appears
  const clickAndConfirmLoading = page.getByTestId('click-and-confirm-loading');
  await expect(clickAndConfirmLoading).toBeVisible();

  // Verify error toast message appears
  const errorToastMessage = page.getByText('Error deleting word ❌');
  await expect(errorToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after error
  await expect(clickAndConfirmLoading).not.toBeVisible({ timeout: 5000 });

  // Verify Words count remained at 55/85 (no change due to error)
  await checkWordsTabCount(page, 'Words 55/85');

  // Verify the word is still underlined (deletion failed)
  // Move mouse away first to close hover card
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);

  // Move mouse back to the word to verify it's still interactive
  const boundingBoxAfter = await underlinedWord.boundingBox();
  if (boundingBoxAfter) {
    await page.mouse.move(
      boundingBoxAfter.x + boundingBoxAfter.width / 2,
      boundingBoxAfter.y + boundingBoxAfter.height / 2,
    );
  }
  await page.waitForTimeout(1000);

  // Verify hover card still appears (word was not deleted)
  await expect(hoverWordInfo).toBeVisible();
  await expect(hoverWordInfo).toContainText('言語学, 言語学, linguistics');
});

test('save word from transcript item', async ({ page }) => {
  // Setup API mocking for saveWord
  await page.route('**/api/saveWord', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        word: {
          id: '83b75769-a67d-4f8a-9baa-9716bdd78219',
          contexts: ['f378ec1d-c885-4e6a-9821-405b0ff9aa24'],
          surfaceForm: '言語学',
          definition: 'linguistics',
          transliteration: 'gengogaku',
          baseForm: '言語学',
          phonetic: 'げんごがく',
          notes:
            '言語学 (gengogaku) specifically refers to the scientific study of language, encompassing various aspects such as syntax, semantics, and phonetics. In the context of ゆる言語学ラジオ, it suggests a more relaxed or informal approach to discussing topics related to linguistics.',
          reviewData: {
            due: '2025-12-16T20:17:44.113Z',
            stability: 0.40255,
            difficulty: 7.1949,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 1,
            lapses: 0,
            state: 1,
            last_review: '2025-12-16T20:16:44.113Z',
            ease: 2.5,
            interval: 0,
          },
        },
      }),
    });
  });

  // Setup API mocking for deleteWord
  await page.route('**/api/deleteWord', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '83b75769-a67d-4f8a-9baa-9716bdd78219',
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

  // Verify initial Words count
  const wordsTabTrigger = await checkWordsTabCount(page, 'Words 55/84');

  // Find the transcript item with text "ゆる言語学ラジオ"
  const transcriptTargetLang = page.getByTestId(
    `transcript-target-lang-${contentId}`,
  );
  await expect(transcriptTargetLang).toBeVisible();

  // Get the text content to verify it contains "言語学"
  const transcriptText = await transcriptTargetLang.textContent();
  expect(transcriptText).toContain('言語学');

  // Select/highlight the text "言語学" using page.evaluate
  // Since text is split into individual character spans, we need to select across multiple elements
  const selectionSuccess = await page.evaluate((id) => {
    const container = document.querySelector(
      `[data-testid="transcript-target-lang-${id}"]`,
    );
    if (!container) {
      console.log('Container not found');
      return false;
    }

    // Get all span elements (each contains one character)
    const spans = Array.from(container.querySelectorAll('span'));
    const targetChars = ['言', '語', '学'];

    // Find the spans containing our target characters in sequence
    let startSpan = null;
    let endSpan = null;

    for (let i = 0; i < spans.length - 2; i++) {
      if (
        spans[i].textContent === targetChars[0] &&
        spans[i + 1].textContent === targetChars[1] &&
        spans[i + 2].textContent === targetChars[2]
      ) {
        startSpan = spans[i];
        endSpan = spans[i + 2];
        break;
      }
    }

    if (!startSpan || !endSpan) {
      return false;
    }

    // Create a range spanning from start of first span to end of last span
    const range = document.createRange();
    const startTextNode = startSpan.firstChild || startSpan;
    const endTextNode = endSpan.firstChild || endSpan;

    range.setStart(startTextNode, 0);
    range.setEnd(endTextNode, endTextNode.textContent?.length || 1);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Trigger mouseup event to trigger the selection handler
    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    document.dispatchEvent(mouseUpEvent);

    return true;
  }, contentId);

  console.log('Selection success:', selectionSuccess);

  // Wait for the state to update
  await page.waitForTimeout(1000);

  // Verify that HighlightedText component is rendered by checking for save buttons
  const openaiButton = page.getByTestId('save-word-openai-button');
  await expect(openaiButton).toBeVisible();

  const googleButton = page.getByTestId('save-word-google-button');
  await expect(googleButton).toBeVisible();

  // Verify that the highlighted text displays "言語学"
  const highlightedTextFocus = page.getByTestId('highlighted-text-focus');
  await expect(highlightedTextFocus).toBeVisible();
  await expect(highlightedTextFocus).toContainText('言語学');

  // Click the OpenAI save button
  await openaiButton.click();

  // Verify loading spinner appears in the action bar
  const loadingSpinner = page.getByTestId(
    `transcript-action-loading-${contentId}`,
  );
  await expect(loadingSpinner).toBeVisible();

  // Verify toast message appears
  const toastMessage = page.getByText('言語学 saved!');
  await expect(toastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after save
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify highlighted text is cleared (buttons should disappear)
  await expect(openaiButton).not.toBeVisible();
  await expect(googleButton).not.toBeVisible();

  // Verify Words count increased from 55/84 to 55/85
  await checkWordsTabCount(page, 'Words 55/85');

  // Now hover over the saved word to verify it shows in hover card
  // The word should now be underlined in the transcript
  // Find an underlined span within the transcript (using CSS selector for underline style)
  const underlinedWord = transcriptTargetLang
    .locator('span')
    .filter({ hasText: '語' })
    .first();
  await expect(underlinedWord).toBeVisible();

  // Move mouse to trigger hover - use mouse.move for more reliable hovering
  const boundingBox = await underlinedWord.boundingBox();
  if (boundingBox) {
    await page.mouse.move(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2,
    );
  }

  // Wait for hover card to appear
  await page.waitForTimeout(1000);

  // Verify hover card shows the word info
  const hoverWordInfo = page.getByTestId('hover-word-info');
  await expect(hoverWordInfo).toBeVisible();
  await expect(hoverWordInfo).toContainText('言語学, 言語学, linguistics');
  await expect(hoverWordInfo).toContainText('げんごがく, gengogaku');

  // Verify Delete button is present
  const deleteButton = page.getByTestId('delete-button');
  await expect(deleteButton).toBeVisible();
  await expect(deleteButton).toContainText('Delete');

  // Click the Delete button
  await deleteButton.click();

  // Verify "Confirm Delete" button appears
  const confirmDeleteButton = page.getByRole('button', {
    name: 'Confirm Delete',
  });
  await expect(confirmDeleteButton).toBeVisible();

  // Click "Confirm Delete"
  await confirmDeleteButton.click();

  // Verify loading spinner appears in the ClickAndConfirm component
  const clickAndConfirmLoading = page.getByTestId('click-and-confirm-loading');
  await expect(clickAndConfirmLoading).toBeVisible();

  // Verify toast message appears
  const deleteToastMessage = page.getByText('Word deleted!');
  await expect(deleteToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after delete
  await expect(clickAndConfirmLoading).not.toBeVisible({ timeout: 5000 });

  // Verify Words count went back to 55/84
  await checkWordsTabCount(page, 'Words 55/84');

  // Verify the word is no longer underlined
  // The underlined word should not be visible anymore
  const underlinedWordAfterDelete = transcriptTargetLang
    .locator('span')
    .filter({ hasText: '語' })
    .first();
  // Check that it's either not visible or doesn't have underline styling
  // Since the word text will still be there, we can check that the hover card doesn't appear
  const boundingBoxAfter = await underlinedWordAfterDelete.boundingBox();
  if (boundingBoxAfter) {
    await page.mouse.move(
      boundingBoxAfter.x + boundingBoxAfter.width / 2,
      boundingBoxAfter.y + boundingBoxAfter.height / 2,
    );
  }
  await page.waitForTimeout(1000);

  // Verify hover card is no longer visible
  await expect(hoverWordInfo).not.toBeVisible();
});

test('transcript item sentence breakdown', async ({ page }) => {
  // Setup API mocking for saveWord
  await page.route('**/api/saveWord', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        word: {
          id: '83b75769-a67d-4f8a-9baa-9716bdd78219',
          contexts: ['f378ec1d-c885-4e6a-9821-405b0ff9aa24'],
          surfaceForm: '言語学',
          definition: 'linguistics',
          transliteration: 'gengogaku',
          baseForm: '言語学',
          phonetic: 'げんごがく',
          notes:
            '言語学 (gengogaku) specifically refers to the scientific study of language, encompassing various aspects such as syntax, semantics, and phonetics. In the context of ゆる言語学ラジオ, it suggests a more relaxed or informal approach to discussing topics related to linguistics.',
          reviewData: {
            due: '2025-12-16T20:17:44.113Z',
            stability: 0.40255,
            difficulty: 7.1949,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 1,
            lapses: 0,
            state: 1,
            last_review: '2025-12-16T20:16:44.113Z',
            ease: 2.5,
            interval: 0,
          },
        },
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

  // Scope to transcript tab to avoid confusion with TranscriptItemSecondary
  const transcriptTab = page.locator('[role="tabpanel"][data-state="active"]');

  // Open the menu
  const menuToggle = transcriptTab.getByTestId(
    `transcript-menu-toggle-${contentId}`,
  );
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  // Verify menu is open
  const menuOptions = transcriptTab.getByTestId(
    `transcript-menu-options-${contentId}`,
  );
  // await expect(menuOptions).toBeVisible();

  // Click the breakdown sentence button (hammer icon)
  const breakdownButton = transcriptTab.getByTestId(
    `transcript-breakdown-button-${contentId}`,
  );
  // await expect(breakdownButton).toBeVisible();
  await breakdownButton.click();

  // Verify loading hammer icon appears
  const loadingHammer = transcriptTab.getByTestId(
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
  const brickEmoji = transcriptTab.getByTestId(
    `transcript-breakdown-complete-${contentId}`,
  );
  await expect(brickEmoji).toBeVisible();
  await expect(brickEmoji).toContainText('🧱');

  // Verify breakdown button is no longer visible
  await expect(breakdownButton).not.toBeVisible();

  // Now click the brick emoji to open the breakdown view
  await brickEmoji.click();

  // Wait for the breakdown view to render
  await page.waitForTimeout(500);

  // Verify SentenceBreakdown component is visible within transcript tab
  const sentenceBreakdownContainer = transcriptTab.getByTestId(
    'sentence-breakdown-container',
  );
  await expect(sentenceBreakdownContainer).toBeVisible();

  // Verify the standard target language text is NOT visible (replaced by breakdown)
  const transcriptTargetLang = transcriptTab.getByTestId(
    `transcript-target-lang-${contentId}`,
  );
  await expect(transcriptTargetLang).not.toBeVisible();

  // Verify SentenceBreakdownTargetLang shows vocab with spaces: "ゆる 言語学 ラジオ"
  const sentenceBreakdownTargetLang = transcriptTab.getByTestId(
    'sentence-breakdown-target-lang',
  );
  await expect(sentenceBreakdownTargetLang).toBeVisible();
  const targetLangText = await sentenceBreakdownTargetLang.textContent();
  // Should have vocab words: ゆる, 言語学, ラジオ (with spaces between)
  expect(targetLangText).toContain('ゆる');
  expect(targetLangText).toContain('言語学');
  expect(targetLangText).toContain('ラジオ');

  // Verify SentenceBreakdownSyntacticStructure shows meanings joined
  const sentenceBreakdownStructure = transcriptTab.getByTestId(
    'sentence-breakdown-structure',
  );
  await expect(sentenceBreakdownStructure).toBeVisible();
  const structureText = await sentenceBreakdownStructure.textContent();
  expect(structureText).toContain('loose or relaxed');
  expect(structureText).toContain('linguistics');
  expect(structureText).toContain('radio');

  // Verify the bottom meaning shows "Loose Linguistics Radio"
  const sentenceBreakdownMeaning = transcriptTab.getByTestId(
    'sentence-breakdown-meaning',
  );
  await expect(sentenceBreakdownMeaning).toBeVisible();
  await expect(sentenceBreakdownMeaning).toContainText(
    'Loose Linguistics Radio',
  );

  // Verify the close icon ❌ is now showing instead of brick
  await expect(brickEmoji).toContainText('❌');

  // Click the close icon to close the breakdown view
  await brickEmoji.click();
  await page.waitForTimeout(500);

  // Verify breakdown container is no longer visible
  await expect(sentenceBreakdownContainer).not.toBeVisible();

  // Verify standard target language text is visible again
  await expect(transcriptTargetLang).toBeVisible();

  // Verify brick emoji is showing again (not close icon)
  await expect(brickEmoji).toContainText('🧱');

  // Re-open breakdown view to test hover interaction
  await brickEmoji.click();
  await page.waitForTimeout(500);
  await expect(sentenceBreakdownContainer).toBeVisible();

  // Hover over the word 言語学 in the breakdown view
  const vocabWord = sentenceBreakdownTargetLang
    .locator('span')
    .filter({ hasText: '言語学' })
    .first();
  await expect(vocabWord).toBeVisible();

  // Move mouse to the vocab word
  const vocabBoundingBox = await vocabWord.boundingBox();
  if (vocabBoundingBox) {
    await page.mouse.move(
      vocabBoundingBox.x + vocabBoundingBox.width / 2,
      vocabBoundingBox.y + vocabBoundingBox.height / 2,
    );
  }

  // Wait for hover card to appear
  await page.waitForTimeout(500);

  // Verify SentenceBreakdownHover content is visible
  const breakdownHoverContent = page.getByTestId(
    'sentence-breakdown-hover-content',
  );
  await expect(breakdownHoverContent).toBeVisible();

  // Verify the save buttons are visible
  const deepseekButton = page.getByTestId(
    'breakdown-save-word-deepseek-button',
  );
  const googleButton = page.getByTestId('breakdown-save-word-google-button');
  await expect(deepseekButton).toBeVisible();
  await expect(googleButton).toBeVisible();

  // Click the Deepseek save button
  await deepseekButton.click();

  // Verify loading spinner appears in the action bar
  const loadingSpinner = transcriptTab.getByTestId(
    `transcript-action-loading-${contentId}`,
  );
  await expect(loadingSpinner).toBeVisible();

  // Verify toast message appears
  const saveToastMessage = page.getByText('言語学 saved!');
  await expect(saveToastMessage).toBeVisible({ timeout: 3000 });

  // Verify loading spinner disappears after save
  await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

  // Verify the hover card is no longer visible after save
  await expect(breakdownHoverContent).not.toBeVisible();

  // Now verify the word is underlined (saved words are rendered differently)
  // The word should now be rendered by SentenceBreakdownTargetLangWord with underline
  const underlinedVocabWord = sentenceBreakdownTargetLang
    .locator('span')
    .filter({ hasText: '言語学' })
    .first();
  await expect(underlinedVocabWord).toBeVisible();

  // Hover over the saved word again
  const savedVocabBoundingBox = await underlinedVocabWord.boundingBox();
  if (savedVocabBoundingBox) {
    await page.mouse.move(
      savedVocabBoundingBox.x + savedVocabBoundingBox.width / 2,
      savedVocabBoundingBox.y + savedVocabBoundingBox.height / 2,
    );
  }

  // Wait to see if hover card appears
  await page.waitForTimeout(1000);

  // Verify that the hover card does NOT appear (saved words don't show hover card)
  await expect(breakdownHoverContent).not.toBeVisible();
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

  // Scope to transcript tab to avoid confusion with TranscriptItemSecondary
  const transcriptTab = page.locator('[role="tabpanel"][data-state="active"]');

  // Open the menu within the transcript tab
  const menuToggle = transcriptTab.getByTestId(
    `transcript-menu-toggle-${contentId}`,
  );
  await expect(menuToggle).toBeVisible();
  await menuToggle.click();

  // Verify menu is open
  const menuOptions = transcriptTab.getByTestId(
    `transcript-menu-options-${contentId}`,
  );
  // await expect(menuOptions).toBeVisible();

  // Click the breakdown sentence button (hammer icon)
  const breakdownButton = transcriptTab.getByTestId(
    `transcript-breakdown-button-${contentId}`,
  );
  await expect(breakdownButton).toBeVisible();
  await breakdownButton.click();

  // Verify loading hammer icon appears
  const loadingHammer = transcriptTab.getByTestId(
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
  const brickEmoji = transcriptTab.getByTestId(
    `transcript-breakdown-complete-${contentId}`,
  );
  await expect(brickEmoji).not.toBeVisible();
});

test('checkpoint button scrolls to last reviewed sentence', async ({
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

  // The checkpoint text from the last reviewed sentence
  const checkpointText =
    'Hori/In the meantime, we look forward to everyone continuing to subscribe, like, and leave comments with their thoughts, so please feel free to send in whatever you think. Wed/Yes.';

  // Find the checkpoint element by text
  const checkpointElement = page.getByText(checkpointText);

  // Verify checkpoint element is NOT in viewport initially
  const checkpointNotVisibleInitially = await checkpointElement.evaluate(
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

  // Click checkpoint button
  const checkpointButton = page.getByTestId('checkpoint-button');
  await expect(checkpointButton).toBeVisible();
  await checkpointButton.click();

  // Wait for scroll animation to complete
  await page.waitForTimeout(1500);

  // Verify checkpoint text is now in viewport
  const checkpointVisible = await checkpointElement.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  expect(checkpointVisible).toBe(true);

  // Scroll to the top of the page manually
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Define the first transcript container element
  const firstTranscriptContainer = page.getByTestId(
    `transcript-target-lang-${firstContentId}`,
  );

  // Verify first transcript container is NOT visible before clicking play
  const firstContainerNotVisibleBeforePlay =
    await firstTranscriptContainer.evaluate((el) => {
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
  expect(firstContainerNotVisibleBeforePlay).toBe(false);

  // Click play on the first transcript item
  const playButton = page.getByTestId(
    `transcript-play-button-${firstContentId}`,
  );
  await expect(playButton).toBeVisible();
  await playButton.click();

  // Wait for play action to register
  await page.waitForTimeout(1000);

  // Verify first transcript container is visible in viewport
  const firstContainerVisible = await firstTranscriptContainer.evaluate(
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
  expect(firstContainerVisible).toBe(true);

  // Verify checkpoint text is NOT visible in viewport
  const checkpointNotVisibleNow = await checkpointElement.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  expect(checkpointNotVisibleNow).toBe(false);

  // Click checkpoint button again to scroll back to checkpoint
  await checkpointButton.click();
  await page.waitForTimeout(1000);

  // Verify checkpoint is visible in viewport
  const checkpointVisibleAgain = await checkpointElement.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  expect(checkpointVisibleAgain).toBe(true);

  // Verify first transcript container is NOT visible in viewport
  const firstContainerNotVisibleAgain = await firstTranscriptContainer.evaluate(
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
  expect(firstContainerNotVisibleAgain).toBe(false);

  // Click current button to scroll back to currently playing item
  const currentButton = page.getByTestId('current-button');
  await expect(currentButton).toBeVisible();
  await currentButton.click();
  await page.waitForTimeout(1000);

  // Verify first transcript container is visible in viewport
  const firstContainerVisibleFinal = await firstTranscriptContainer.evaluate(
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
  expect(firstContainerVisibleFinal).toBe(true);

  // Verify checkpoint is NOT visible in viewport
  const checkpointNotVisibleFinal = await checkpointElement.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  expect(checkpointNotVisibleFinal).toBe(false);
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

  test.describe('Loop(s)', () => {
    test('sentence(s) loop using Shift+Down keyboard shortcut', async ({
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

      // Use specific content IDs for first and second transcript items

      // Wait for audio/video to load
      await page.waitForTimeout(1000);

      // Click play on the second transcript item
      const secondPlayButton = page.getByTestId(
        `transcript-play-button-${secondContentId}`,
      );
      await expect(secondPlayButton).toBeVisible();
      await secondPlayButton.click();

      // Press Shift+Down to trigger loop
      await page.keyboard.press('Shift+ArrowDown');

      // Wait for loop state to register
      await page.waitForTimeout(500);

      // Verify loop indicator (stop-loop button) is visible
      const loopIndicator = page.locator('#stop-loop');
      await expect(loopIndicator).toBeVisible();

      // Try to play the first transcript item
      const firstPlayButton = page.getByTestId(
        `transcript-play-button-${firstContentId}`,
      );
      await expect(firstPlayButton).toBeVisible();
      await firstPlayButton.click();

      // Wait for click to register
      await page.waitForTimeout(500);

      // Verify first item still shows play icon (not playing)
      const firstPlayIcon = firstPlayButton.locator('svg').first();
      await expect(firstPlayIcon).toBeVisible();
      // Play icon should be LucidePlayCircle (not LucidePauseCircle)

      // Verify second item shows pause icon (still playing/looping)
      const secondPauseIcon = secondPlayButton.locator('svg').first();
      await expect(secondPauseIcon).toBeVisible();
      // Pause icon should be LucidePauseCircle

      // Press Shift+Down again to extend the loop to include more sentences
      await page.keyboard.press('Shift+ArrowDown');
      await page.waitForTimeout(500);
      await page.keyboard.press('Shift+ArrowDown');

      // Verify there are now two loop indicators visible
      const loopIndicators = page.locator('#stop-loop');
      await expect(loopIndicators).toHaveCount(3);

      // Press Shift+Right to remove the first element in the loop (second element)
      await page.keyboard.press('Shift+ArrowRight');
      await page.waitForTimeout(500);

      // Verify there are now 2 loop indicators (third and fourth)
      await expect(loopIndicators).toHaveCount(2);

      await page.keyboard.press('Shift+ArrowUp');

      await page.waitForTimeout(500);

      // // Verify there is now only 1 loop indicator (third element only)
      await expect(loopIndicators).toHaveCount(1);

      // Click on the third element's loop indicator to remove it from loop state
      const thirdLoopIndicator = page.getByTestId(
        `stop-loop-${thirdContentId}`,
      );
      await expect(thirdLoopIndicator).toBeVisible();
      await thirdLoopIndicator.click();
      await page.waitForTimeout(500);

      await expect(loopIndicators).toHaveCount(0);

      // Click on the first element's play button
      await firstPlayButton.click();

      // // Verify first element shows pause button (it is playing)
      await expect(firstPlayButton).toHaveClass(/bg-yellow-200/);
      //
    });

    test('3 second loop using Shift+" keyboard shortcut', async ({ page }) => {
      // Setup API mocking for updateContentMetaData
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
                baseLang:
                  'Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
                focusedText: '目で見ること',
                id: '38d3e884-b050-46d6-ab0d-3d5a751be335',
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
                suggestedFocusText: 'とばで話をさせて』という',
                targetLang:
                  '堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
                time: 8.785492,
              },
            ],
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

      // Use specific content ID (third item with ~12 second duration)

      // Wait for audio/video to load
      await page.waitForTimeout(1000);

      // Verify loop button is NOT visible initially
      const loopButton = page.getByTestId('stop-loop');
      await expect(loopButton).not.toBeVisible();

      // Verify loop indicator progress is NOT visible initially
      const loopIndicatorProgress = page.getByTestId('loop-indicator-progress');
      await expect(loopIndicatorProgress).not.toBeVisible();

      // Verify transcript time overlap indicator is NOT visible initially
      const timeOverlapIndicator = page.getByTestId(
        'transcript-time-overlap-indicator',
      );
      await expect(timeOverlapIndicator).not.toBeVisible();

      // Verify transcript looping sentence is NOT visible initially
      const loopingSentence = page.getByTestId(
        `transcript-looping-sentence-${thirdContentId}`,
      );
      await expect(loopingSentence).not.toBeVisible();

      // Click play on the third transcript item
      const thirdPlayButton = page.getByTestId(
        `transcript-play-button-${thirdContentId}`,
      );
      await expect(thirdPlayButton).toBeVisible();
      await thirdPlayButton.click();

      // Wait for video to start playing
      await page.waitForTimeout(500);

      // Seek to 7.5 seconds by evaluating video element directly
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = 7.5;
        }
      });

      // Wait for seek to complete
      await page.waitForTimeout(500);

      // Press Shift+" to trigger 3 second loop
      await page.keyboard.press('Shift+"');

      // Wait for loop state to register
      await page.waitForTimeout(500);

      // Verify loop button is now visible with text "(3)"
      await expect(loopButton).toBeVisible();
      await expect(loopButton).toContainText('(3)');

      // Verify loop indicator progress is now visible
      await expect(loopIndicatorProgress).toBeVisible();

      // Verify transcript time overlap indicator is now visible
      await expect(timeOverlapIndicator).toBeVisible();

      // Verify transcript looping sentence is now visible
      await expect(loopingSentence).toBeVisible();
      // test that clicking on the first transcript item does not stop the loop
      // const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';
      const firstPlayButton = page.getByTestId(
        `transcript-play-button-${firstContentId}`,
      );
      await expect(firstPlayButton).toBeVisible();
      await firstPlayButton.click();

      const snippetsDue = page.getByText('Snippets Due: 225/292/292');
      await expect(snippetsDue).toBeVisible();

      // Verify bulk review count before save
      const bulkReviewBefore = page.getByText('Bulk Review: 5');
      await expect(bulkReviewBefore).toBeVisible();

      // Get the highlighted text length (yellow span) before contraction
      const highlightedSpan = loopingSentence.locator('span.bg-yellow-200');
      await expect(highlightedSpan).toBeVisible();
      // const highlightedTextBefore = await highlightedSpan.textContent();
      // const lengthBefore = highlightedTextBefore?.trim().length || 0;

      // Verify save button is visible but disabled (no text highlighted)
      const saveButton = page.getByTestId('save-snippet-button');
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeDisabled();

      // Test highlighting text in VideoPlayer to enable save button
      // Find the p element containing overlappingTextMemoized text
      const videoPlayerText = page
        .locator('p.text-center.font-bold.text-xl.text-blue-700')
        .first();
      await expect(videoPlayerText).toBeVisible();

      // Verify the save button in VideoPlayer is disabled before selection
      // Reusing the saveButton from earlier in the test
      await expect(saveButton).toBeDisabled();

      // Select the text "目で見ること" using page.evaluate
      const selectionSuccess = await page.evaluate(() => {
        const targetText = '目で見ること';
        const paragraphs = Array.from(
          document.querySelectorAll('p.text-center.font-bold.text-xl'),
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

      expect(selectionSuccess).toBe(true);

      // Wait for selection state to update
      await page.waitForTimeout(500);

      // Verify the save button is now enabled
      await expect(saveButton).toBeEnabled();

      const thirdMultiIndicatorContainer = page.getByTestId(
        `transcript-time-overlap-indicator-multi-${thirdContentId}`,
      );

      const thirdMultiIndicatorItems =
        thirdMultiIndicatorContainer.locator('> div');
      await expect(thirdMultiIndicatorItems).toHaveCount(1);

      // Click the save button and wait for API response to complete
      await saveButton.click();
      await page.waitForResponse('**/api/updateContentMetaData');
      // await page.waitForTimeout(500);

      // Verify snippets count increased after save

      // Verify all looping phase elements are no longer visible
      await expect(loopIndicatorProgress).not.toBeVisible();
      await expect(timeOverlapIndicator).not.toBeVisible();
      await expect(loopingSentence).not.toBeVisible();
      await expect(saveButton).not.toBeVisible();
      await expect(loopButton).not.toBeVisible();

      const snippetsDueAfter = page.getByText('Snippets Due: 225/293/293');
      await expect(snippetsDueAfter).toBeVisible();

      // Verify bulk review count increased after save
      const bulkReviewAfter = page.getByText('Bulk Review: 6');
      await expect(bulkReviewAfter).toBeVisible();
      await expect(thirdMultiIndicatorItems).toHaveCount(2);
      // Setup route for delete operation
      await page.route('**/api/updateContentMetaData', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            snippets: mockEasyLinguisticsRadioSignLangIslandSnippets,
          }),
        });
      });

      // Get the second item in thirdMultiIndicatorItems
      const secondIndicatorItem = thirdMultiIndicatorItems.nth(1);
      await expect(secondIndicatorItem).toBeVisible();

      // Find the ❌ button within the second item
      const deleteButton = secondIndicatorItem.locator('button').last();
      await expect(deleteButton).toBeVisible();

      // Double-click the ❌ button to delete the snippet
      await deleteButton.dblclick();

      // Wait for API response to complete
      await page.waitForResponse('**/api/updateContentMetaData');

      // Verify thirdMultiIndicatorItems now has count of 1
      await expect(thirdMultiIndicatorItems).toHaveCount(1);
    });

    test('3 second loop using Shift+" TranscriptItem keys', async ({
      page,
    }) => {
      // Setup API mocking for updateContentMetaData
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
                baseLang:
                  'Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
                focusedText: '目で見ること',
                id: '38d3e884-b050-46d6-ab0d-3d5a751be335',
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
                suggestedFocusText: 'とばで話をさせて』という',
                targetLang:
                  '堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
                time: 8.785492,
              },
            ],
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

      // Use specific content ID (third item with ~12 second duration)

      // Wait for audio/video to load
      await page.waitForTimeout(1000);

      // Verify loop button is NOT visible initially
      const loopButton = page.getByTestId('stop-loop');
      await expect(loopButton).not.toBeVisible();

      // Verify loop indicator progress is NOT visible initially
      const loopIndicatorProgress = page.getByTestId('loop-indicator-progress');
      await expect(loopIndicatorProgress).not.toBeVisible();

      // Verify transcript time overlap indicator is NOT visible initially
      const timeOverlapIndicator = page.getByTestId(
        'transcript-time-overlap-indicator',
      );
      await expect(timeOverlapIndicator).not.toBeVisible();

      // Verify transcript looping sentence is NOT visible initially
      const loopingSentence = page.getByTestId(
        `transcript-looping-sentence-${thirdContentId}`,
      );
      await expect(loopingSentence).not.toBeVisible();

      // Click play on the third transcript item
      const thirdPlayButton = page.getByTestId(
        `transcript-play-button-${thirdContentId}`,
      );
      await expect(thirdPlayButton).toBeVisible();
      await thirdPlayButton.click();

      // Wait for video to start playing
      await page.waitForTimeout(500);

      // Seek to 7.5 seconds by evaluating video element directly
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = 7.5;
        }
      });

      // Wait for seek to complete
      await page.waitForTimeout(500);

      // Press Shift+" to trigger 3 second loop
      await page.keyboard.press('Shift+"');

      // Wait for loop state to register
      await page.waitForTimeout(500);

      // Verify loop button is now visible with text "(3)"
      await expect(loopButton).toBeVisible();
      await expect(loopButton).toContainText('(3)');

      // Verify loop indicator progress is now visible
      await expect(loopIndicatorProgress).toBeVisible();

      // Verify transcript time overlap indicator is now visible
      await expect(timeOverlapIndicator).toBeVisible();

      // Verify transcript looping sentence is now visible
      await expect(loopingSentence).toBeVisible();
      // test that clicking on the first transcript item does not stop the loop
      // const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';
      const firstPlayButton = page.getByTestId(
        `transcript-play-button-${firstContentId}`,
      );
      await expect(firstPlayButton).toBeVisible();
      await firstPlayButton.click();

      const snippetsDue = page.getByText('Snippets Due: 225/292/292');
      await expect(snippetsDue).toBeVisible();

      // Verify bulk review count before save
      const bulkReviewBefore = page.getByText('Bulk Review: 5');
      await expect(bulkReviewBefore).toBeVisible();
      // Get the highlighted text length (yellow span) before contraction
      const highlightedSpan = loopingSentence.locator('span.bg-yellow-200');
      await expect(highlightedSpan).toBeVisible();
      const highlightedTextBefore = await highlightedSpan.textContent();
      const lengthBefore = highlightedTextBefore?.trim().length || 0;

      // Verify save button is visible but disabled (no text highlighted)
      const saveButton = page.getByTestId('save-snippet-button');
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeDisabled();

      // Press ArrowUp to contract the loop to 1.5 seconds
      await page.keyboard.press('ArrowUp');

      // Wait for state to update
      await page.waitForTimeout(500);

      // Verify loop button text changed to "(1.5)"
      await expect(loopButton).toContainText('(1.5)');

      // Get the highlighted text length after contraction
      const highlightedTextAfter = await highlightedSpan.textContent();
      const lengthAfter = highlightedTextAfter?.trim().length || 0;

      // Verify the highlighted text is shorter after contraction
      expect(lengthAfter).toBeLessThan(lengthBefore);
      expect(lengthAfter).toBeGreaterThan(0); // Still has some text

      // Verify save button is still disabled
      await expect(saveButton).toBeDisabled();

      // Test shifting the highlighted text block with "," key
      const textBeforeComma = await highlightedSpan.textContent();
      const lengthBeforeComma = textBeforeComma?.trim().length || 0;

      // Press "," to shift the text block left
      await page.keyboard.press(',');
      await page.waitForTimeout(300);

      const textAfterComma = await highlightedSpan.textContent();
      const lengthAfterComma = textAfterComma?.trim().length || 0;

      // Verify text content is different but length is the same
      expect(textAfterComma).not.toBe(textBeforeComma);
      expect(lengthAfterComma).toBe(lengthBeforeComma);

      // Press "." twice to shift the text block right
      await page.keyboard.press('.');
      await page.waitForTimeout(300);
      await page.keyboard.press('.');
      await page.waitForTimeout(300);

      const textAfterPeriods = await highlightedSpan.textContent();
      const lengthAfterPeriods = textAfterPeriods?.trim().length || 0;

      // Verify text content is different from after comma but length is the same
      expect(textAfterPeriods).not.toBe(textAfterComma);
      expect(lengthAfterPeriods).toBe(lengthAfterComma);

      // Verify that TranscriptItemTimeOverlappingIndicator (red single indicator) is showing during loop
      await expect(timeOverlapIndicator).toBeVisible();

      // Verify that TranscriptItemTimeOverlappingIndicatorMulti has 1 item before save
      const multiIndicatorContainer = page.getByTestId(
        `transcript-time-overlap-indicator-multi-${thirdContentId}`,
      );
      const multiIndicatorItems = multiIndicatorContainer.locator('> div');
      await expect(multiIndicatorItems).toHaveCount(1);

      // press shift+enter to save the snippet
      await page.keyboard.press('Shift+Enter');

      // Wait for API response to complete
      await page.waitForResponse('**/api/updateContentMetaData');

      // Wait for React to update state after API response
      await page.waitForTimeout(500);

      // Verify positive state changes first (new counts)
      const snippetsDueAfter = page.getByText('Snippets Due: 225/293/293');
      await expect(snippetsDueAfter).toBeVisible({ timeout: 10000 });

      const bulkReviewAfter = page.getByText('Bulk Review: 6');
      await expect(bulkReviewAfter).toBeVisible({ timeout: 10000 });
      await expect(multiIndicatorItems).toHaveCount(2);

      // Verify all looping phase elements are no longer visible
      // await expect(loopIndicatorProgress).not.toBeVisible();
      // await expect(timeOverlapIndicator).not.toBeVisible();
      // await expect(loopingSentence).not.toBeVisible();
      // await expect(saveButton).not.toBeVisible();
      // await expect(loopButton).not.toBeVisible();
    });

    test('3 second loop using Shift+" keyboard shortcut - multi sentences', async ({
      page,
    }) => {
      // Setup API mocking for updateContentMetaData
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
                baseLang:
                  'Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
                focusedText: 'だんですよ。堀/はい。はい。水/『目で見る',
                id: '38d3e884-b050-46d6-ab0d-3d5a751be335',
                isContracted: false,
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
                suggestedFocusText: 'だんですよ。堀/はい。はい。水/『目で見る',
                targetLang:
                  '堀/水/最近こんな小説を読んだんですよ。堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
                time: 6,
              },
            ],
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

      // Seek to 5 seconds by evaluating video element directly

      const firstContentBtn = page.getByTestId(
        `transcript-play-button-${firstContentId}`,
      );
      await firstContentBtn.click();
      await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = 6;
        }
      });
      // Wait for audio/video to load before attempting to play

      // Press Shift+P keyboard shortcut to review the sentence
      await page.keyboard.press('Shift+"');

      await expect(
        page.getByTestId('transcript-time-overlap-indicator'),
      ).toHaveCount(2);

      // assert that only data-testid={`transcript-looping-sentence-${contentItemId}`} for secondContentId is visible And NOT thirdContentId
      const secondLoopingSentence = page.getByTestId(
        `transcript-looping-sentence-${secondContentId}`,
      );
      const secondLoopingSentenceNestedSaveButton = page.getByTestId(
        `save-snippet-button-${secondContentId}`,
      );
      const thirdLoopingSentence = page.getByTestId(
        `transcript-looping-sentence-${thirdContentId}`,
      );
      await expect(secondLoopingSentence).toBeVisible();
      await expect(secondLoopingSentenceNestedSaveButton).toBeVisible();

      await expect(secondLoopingSentence).toBeVisible();
      await expect(thirdLoopingSentence).not.toBeVisible();

      // assert that transcript-time-overlap-indicator-multi-{contentItemId} has 0 items for secondContentId and 1 item for thirdContentId but 1 for thirdcontentId
      const secondMultiIndicatorContainer = page.getByTestId(
        `transcript-time-overlap-indicator-multi-${secondContentId}`,
      );
      const secondMultiIndicatorItems =
        secondMultiIndicatorContainer.locator('> div');
      await expect(secondMultiIndicatorItems).toHaveCount(0);

      const thirdMultiIndicatorContainer = page.getByTestId(
        `transcript-time-overlap-indicator-multi-${thirdContentId}`,
      );
      const thirdMultiIndicatorItems =
        thirdMultiIndicatorContainer.locator('> div');
      await expect(thirdMultiIndicatorItems).toHaveCount(1);

      await secondLoopingSentenceNestedSaveButton.click();

      // Wait for API response to complete
      await page.waitForResponse('**/api/updateContentMetaData');
      await expect(
        page.getByTestId('transcript-time-overlap-indicator'),
      ).toHaveCount(0);

      await expect(secondMultiIndicatorItems).toHaveCount(1);
      await expect(thirdMultiIndicatorItems).toHaveCount(2);
    });
  });
});
