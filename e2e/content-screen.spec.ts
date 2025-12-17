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
  await expect(wordsTabTrigger).toContainText('Words 55/84');

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

test.only('delete word from transcript item - error handling', async ({
  page,
}) => {
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
  await expect(wordsTabTrigger).toContainText('Words 55/85');

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
  await expect(wordsTabTrigger).toContainText('Words 55/85');

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
  const wordsTabTrigger = page.getByTestId('words-tab-trigger');
  await expect(wordsTabTrigger).toBeVisible();
  await expect(wordsTabTrigger).toContainText('Words 55/84');

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
  await expect(wordsTabTrigger).toContainText('Words 55/85');

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
  await expect(wordsTabTrigger).toContainText('Words 55/84');

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
