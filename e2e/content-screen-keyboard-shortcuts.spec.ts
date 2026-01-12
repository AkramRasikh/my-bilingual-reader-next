import { test, expect, Page } from '@playwright/test';
import { landingMetaData } from './helpers/landing-meta-data';
import {
  checkSentenceCount,
  checkSentenceRepsCount,
  goFromLandingToLearningScreen,
  secondContentId,
  sentenceToastMessage,
  thirdContentId,
  triggerTrackSwitch,
} from './helpers/content-screen-helpers';
import {
  setupApiMocks,
  mockUpdateContentMetaDataWithSnippet,
  mockUpdateSentenceOneMinuteAPI,
} from './helpers/mock-api';
import { mockEasyLinguisticsRadioSignLangIslandSnippets } from './mock-data/easy-linguistics-radio-sign-lang-island';

const contentData = landingMetaData[0];
const contentTitle = contentData.title;

const firstContentId = 'f378ec1d-c885-4e6a-9821-405b0ff9aa24';

const thirdPlayButtonAndShift = async (page: Page) => {
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
  await setupApiMocks(page);
});

test.describe('Keyboard actions', () => {
  test('review sentence using Shift+P keyboard shortcut', async ({ page }) => {
    await mockUpdateSentenceOneMinuteAPI(page);
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);
    await checkSentenceCount(page, 'Sentences: 153/200');
    await checkSentenceRepsCount(page, 'Reps: 0');
    await page.waitForTimeout(2000);
    await thirdPlayButtonAndShift(page);
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
    await thirdPlayButtonAndShift(page);
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
test.describe('Loop(s)', () => {
  test('sentence(s) loop using Shift+Down keyboard shortcut', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    // Wait for audio/video to load
    await page.waitForTimeout(1000);
    await triggerTrackSwitch(page);

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
    const loopIndicator = page.getByTestId('stop-loop');
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
    const loopIndicators = page.getByTestId('stop-loop');
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
    const thirdLoopIndicator = page.getByTestId(`stop-loop-${thirdContentId}`);
    await expect(thirdLoopIndicator).toBeVisible();
    await thirdLoopIndicator.click();
    await page.waitForTimeout(500);

    await expect(loopIndicators).toHaveCount(0);

    const firstPlayButtonRefreshed = page.getByTestId(
      `transcript-play-button-${firstContentId}`,
    );
    // Click on the first element's play button
    await firstPlayButtonRefreshed.click();
    // // Verify first element shows pause button (it is playing)
    await expect(firstPlayButtonRefreshed).toHaveClass(/bg-yellow-200/);
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

    await goFromLandingToLearningScreen(page);

    // Wait for audio/video to load
    await page.waitForTimeout(1000);
    await triggerTrackSwitch(page);

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
    const bulkReviewBefore = page.getByText('Bulk Review: 7');
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
    const bulkReviewCounter = page.getByTestId('bulk-review-count');
    await expect(bulkReviewCounter).toHaveText('Bulk Review: 8');
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

  test('3 second loop using Shift+" TranscriptItem keys', async ({ page }) => {
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
    const bulkReviewBefore = page.getByText('Bulk Review: 7');
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

    const bulkReviewCounter = page.getByTestId('bulk-review-count');
    await expect(bulkReviewCounter).toHaveText('Bulk Review: 8');
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
    await mockUpdateContentMetaDataWithSnippet(page);
    await goFromLandingToLearningScreen(page);
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
