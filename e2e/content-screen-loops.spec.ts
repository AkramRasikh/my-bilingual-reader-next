import { test, expect, Page } from '@playwright/test';
import {
  fourthContentId,
  goFromLandingToLearningScreen,
  secondContentId,
  thirdContentId,
  triggerTrackSwitch,
  firstContentId,
  highlightJapaneseText,
  checkSnippetsDueMeta,
  checkBulkReviewCount,
} from './helpers/content-screen-helpers';
import {
  mockGetOnLoadDataE2E,
  mockAddSnippetAPIE2E,
  mockDeleteSnippetAPIE2E,
  mockSaveSnippetAPIE2E,
} from './helpers/mock-api';
import { initScriptsE2e } from './helpers/init-scripts';

const verifyPreFreeLoopUI = async (page: Page) => {
  const masterLoopButton = page.getByTestId('stop-loop');
  await expect(masterLoopButton).not.toBeVisible();
  const loopIndicatorProgress = page.getByTestId('loop-indicator-progress');
  await expect(loopIndicatorProgress).not.toBeVisible();
  const timeOverlapIndicator = page.getByTestId(
    'transcript-time-overlap-indicator',
  );
  await expect(timeOverlapIndicator).not.toBeVisible();
  const loopingSentence = page.getByTestId(
    `transcript-looping-sentence-${thirdContentId}`,
  );
  await expect(loopingSentence).not.toBeVisible();
  const saveButton = page.getByTestId('save-snippet-button');
  await expect(saveButton).not.toBeVisible();
};

const verifyPostFreeLoopUI = async (page: Page) => {
  const masterLoopButton = page.getByTestId('stop-loop');

  const loopIndicatorProgress = page.getByTestId('loop-indicator-progress');
  const timeOverlapIndicator = page.getByTestId(
    'transcript-time-overlap-indicator',
  );
  const loopingSentence = page.getByTestId(
    `transcript-looping-sentence-${thirdContentId}`,
  );

  await expect(masterLoopButton).toBeVisible();
  await expect(masterLoopButton).toContainText('(3)');
  await expect(loopIndicatorProgress).toBeVisible();
  await expect(timeOverlapIndicator).toBeVisible();
  await expect(loopingSentence).toBeVisible();
  const saveButton = page.getByTestId('save-snippet-button');
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeDisabled();
  const videoPlayerText = page
    .locator('p.text-center.font-bold.text-xl.text-blue-700')
    .first();
  await expect(videoPlayerText).toBeVisible();
  await expect(saveButton).toBeDisabled();
};
const startLoopOnThirdEl = async (page: Page) => {
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
  await page.keyboard.press('Shift+"');
};

const verifyOutsideLoopClickDoesntStopLoop = async (page: Page) => {
  const firstPlayButton = page.getByTestId(
    `transcript-play-button-${firstContentId}`,
  );
  await expect(firstPlayButton).toBeVisible();
  await firstPlayButton.click();

  // Verify transcript looping sentence is NOT visible initially
  const loopingSentence = page.getByTestId(
    `transcript-looping-sentence-${thirdContentId}`,
  );
  const highlightedSpan = loopingSentence.locator('span.bg-yellow-200');
  await expect(highlightedSpan).toBeVisible();
};

const saveHighlightedTextAsSnippet = async (page: Page) => {
  const saveButton = page.getByTestId('save-snippet-button');

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
};

const verifyPostSnippetSaveUI = async (page: Page) => {
  const loopIndicatorProgress = page.getByTestId('loop-indicator-progress');
  const timeOverlapIndicator = page.getByTestId(
    'transcript-time-overlap-indicator',
  );
  const loopingSentence = page.getByTestId(
    `transcript-looping-sentence-${thirdContentId}`,
  );
  await expect(loopIndicatorProgress).not.toBeVisible();
  await expect(timeOverlapIndicator).not.toBeVisible();
  await expect(loopingSentence).not.toBeVisible();

  const saveButton = page.getByTestId('save-snippet-button');
  const masterLoopButton = page.getByTestId('stop-loop');
  const thirdMultiIndicatorContainer = page.getByTestId(
    `transcript-time-overlap-indicator-multi-${thirdContentId}`,
  );
  const thirdMultiIndicatorItems =
    thirdMultiIndicatorContainer.locator('> div');
  await expect(saveButton).not.toBeVisible();
  await expect(masterLoopButton).not.toBeVisible();
  await checkSnippetsDueMeta(page, 'Snippets Due: 225/293/293');
  await checkBulkReviewCount(page, 'Bulk Review: 8');
  await expect(thirdMultiIndicatorItems).toHaveCount(2);
};

const deleteRecentlyAddedSnippet = async (page: Page) => {
  const thirdMultiIndicatorContainer = page.getByTestId(
    `transcript-time-overlap-indicator-multi-${thirdContentId}`,
  );
  const thirdMultiIndicatorItems =
    thirdMultiIndicatorContainer.locator('> div');
  await expect(thirdMultiIndicatorItems).toHaveCount(2);
  const nestedDeleteBtn = thirdMultiIndicatorContainer
    .locator('> div')
    .nth(1)
    .locator('button')
    .last();
  await nestedDeleteBtn.dblclick();
  await expect(thirdMultiIndicatorItems).toHaveCount(1);
};

const contractLoop = async (page: Page) => {
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500);
  const masterLoopButton = page.getByTestId('stop-loop');
  await expect(masterLoopButton).toContainText('(1.5)');
};

const textOfLoop = async (page: Page) => {
  const loopingSentence = page.getByTestId(
    `transcript-looping-sentence-${thirdContentId}`,
  );

  const highlightedSpan = loopingSentence.locator('span.bg-yellow-200');
  const highlightedTextBefore = await highlightedSpan.textContent();
  const text = highlightedTextBefore?.trim() || '';
  return { text: text, length: text.length };
};

const toggleLeftAndRightChecks = async (page: Page) => {
  const textBefore = await textOfLoop(page);
  await contractLoop(page);
  const highlightedTextAfter = await textOfLoop(page);
  expect(highlightedTextAfter.length).toBeLessThan(textBefore.length);
  expect(highlightedTextAfter.text).not.toBe(textBefore.text);

  await page.keyboard.press(',');
  await page.waitForTimeout(200);

  const highlightedTextAfterToggleLeft = await textOfLoop(page);
  expect(highlightedTextAfterToggleLeft.length).toBe(
    highlightedTextAfter.length,
  );
  expect(highlightedTextAfterToggleLeft.text).not.toBe(
    highlightedTextAfter.text,
  );

  await page.keyboard.press('.');
  await page.waitForTimeout(300);

  const highlightedTextAfterToggleRight = await textOfLoop(page);
  expect(highlightedTextAfter.length).toEqual(
    highlightedTextAfterToggleRight.length,
  );
  expect(highlightedTextAfter.text).toBe(highlightedTextAfterToggleRight.text);
};

const verifyOverlappingSnippetUI = async (page: Page) => {
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
};

const saveSecondSnippet = async (page: Page) => {
  const secondLoopingSentenceNestedSaveButton = page.getByTestId(
    `save-snippet-button-${secondContentId}`,
  );
  await secondLoopingSentenceNestedSaveButton.click();
};

const verifyPostSaveOverlappingSnippetUI = async (page: Page) => {
  const secondMultiIndicatorContainer = page.getByTestId(
    `transcript-time-overlap-indicator-multi-${secondContentId}`,
  );
  const thirdMultiIndicatorContainer = page.getByTestId(
    `transcript-time-overlap-indicator-multi-${thirdContentId}`,
  );

  const secondMultiIndicatorItems =
    secondMultiIndicatorContainer.locator('> div');
  const thirdMultiIndicatorItems =
    thirdMultiIndicatorContainer.locator('> div');
  await expect(secondMultiIndicatorItems).toHaveCount(1);

  await expect(
    page.getByTestId('transcript-time-overlap-indicator'),
  ).toHaveCount(0);

  await expect(secondMultiIndicatorItems).toHaveCount(1);
  await expect(thirdMultiIndicatorItems).toHaveCount(2);
};

test.beforeEach(async ({ page }) => {
  // await setupApiMocks(page);
  await initScriptsE2e(page);
  await mockGetOnLoadDataE2E(page);
});

test.describe('Loop(s)', () => {
  test.describe.configure({ timeout: 60000 });
  test('sentence(s) loop using Shift+Down extends loops. Shift+ArrowUp retracts loops', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);

    const firstLoopIndicator = page.getByTestId(`stop-loop-${firstContentId}`);
    const secondLoopIndicator = page.getByTestId(
      `stop-loop-${secondContentId}`,
    );
    const thirdLoopIndicators = page.getByTestId(`stop-loop-${thirdContentId}`);
    const fourthLoopIndicators = page.getByTestId(
      `stop-loop-${fourthContentId}`,
    );

    const firstPlayButton = page.getByTestId(
      `transcript-play-button-${firstContentId}`,
    );
    // Click play on the second transcript item
    const secondPlayButton = page.getByTestId(
      `transcript-play-button-${secondContentId}`,
    );

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).not.toBeVisible();
    await expect(thirdLoopIndicators).not.toBeVisible();
    await expect(fourthLoopIndicators).not.toBeVisible();

    await secondPlayButton.click();

    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).toBeVisible();
    await expect(thirdLoopIndicators).toBeVisible();
    await expect(fourthLoopIndicators).toBeVisible();

    await page.keyboard.press('Shift+ArrowUp');
    await page.keyboard.press('Shift+ArrowUp');
    await page.keyboard.press('Shift+ArrowUp');

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).not.toBeVisible();
    await expect(thirdLoopIndicators).not.toBeVisible();
    await expect(fourthLoopIndicators).not.toBeVisible();

    await firstPlayButton.click();
    await page.waitForTimeout(200);
    await expect(firstPlayButton).toHaveClass(/bg-yellow-200/);
  });
  test('sentence(s) loop using Shift+Right slices existing loop by one', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);

    const firstLoopIndicator = page.getByTestId(`stop-loop-${firstContentId}`);
    const secondLoopIndicator = page.getByTestId(
      `stop-loop-${secondContentId}`,
    );
    const thirdLoopIndicators = page.getByTestId(`stop-loop-${thirdContentId}`);
    const fourthLoopIndicators = page.getByTestId(
      `stop-loop-${fourthContentId}`,
    );

    const secondPlayButton = page.getByTestId(
      `transcript-play-button-${secondContentId}`,
    );

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).not.toBeVisible();
    await expect(thirdLoopIndicators).not.toBeVisible();
    await expect(fourthLoopIndicators).not.toBeVisible();

    await secondPlayButton.click();

    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).toBeVisible();
    await expect(thirdLoopIndicators).toBeVisible();
    await expect(fourthLoopIndicators).toBeVisible();

    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).not.toBeVisible();
    await expect(thirdLoopIndicators).not.toBeVisible();
    await expect(fourthLoopIndicators).toBeVisible();
  });
  test('sentence(s) clicking on any stop loop button ends stops the loop', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);

    const firstLoopIndicator = page.getByTestId(`stop-loop-${firstContentId}`);
    const secondLoopIndicator = page.getByTestId(
      `stop-loop-${secondContentId}`,
    );
    const thirdLoopIndicators = page.getByTestId(`stop-loop-${thirdContentId}`);
    const fourthLoopIndicators = page.getByTestId(
      `stop-loop-${fourthContentId}`,
    );

    const secondPlayButton = page.getByTestId(
      `transcript-play-button-${secondContentId}`,
    );

    await secondPlayButton.click();

    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).toBeVisible();
    await expect(thirdLoopIndicators).toBeVisible();
    await expect(fourthLoopIndicators).toBeVisible();

    await secondLoopIndicator.click({ force: true });

    await expect(firstLoopIndicator).not.toBeVisible();
    await expect(secondLoopIndicator).not.toBeVisible();
    await expect(thirdLoopIndicators).not.toBeVisible();
    await expect(fourthLoopIndicators).not.toBeVisible();
  });

  test('3 second loop using Shift+" keyboard shortcut', async ({ page }) => {
    await mockAddSnippetAPIE2E(page);
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);
    await checkSnippetsDueMeta(page, 'Snippets Due: 225/292/292');
    await checkBulkReviewCount(page, 'Bulk Review: 7');
    await page.waitForTimeout(500);
    await verifyPreFreeLoopUI(page);
    await startLoopOnThirdEl(page);
    await page.waitForTimeout(500);
    await verifyPostFreeLoopUI(page);
    await verifyOutsideLoopClickDoesntStopLoop(page);
    const selectionSuccess = await highlightJapaneseText(page);
    expect(selectionSuccess).toBe(true);
    await mockSaveSnippetAPIE2E(
      page,
      {
        id: '13b3d85c-33c7-47a2-8467-914e3546fc1f',
        time: 7.5,
        isContracted: false,
        reviewData: {
          due: new Date(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: new Date(),
          ease: 2.5,
          interval: 0,
        },
        targetLang:
          '堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
        baseLang:
          'Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
        suggestedFocusText: '堀/はい。はい。水/『目で見ることばで話をさせて',
        focusedText: '目で見ること',
      },
      false,
    );
    await saveHighlightedTextAsSnippet(page);
    await verifyPostSnippetSaveUI(page);
    await mockDeleteSnippetAPIE2E(page);
    await deleteRecentlyAddedSnippet(page);
    await checkSnippetsDueMeta(page, 'Snippets Due: 225/292/292');
    await checkBulkReviewCount(page, 'Bulk Review: 7');
  });

  test('3 second loop using Shift+" TranscriptItem keys', async ({ page }) => {
    await mockAddSnippetAPIE2E(page);
    await goFromLandingToLearningScreen(page);
    await checkSnippetsDueMeta(page, 'Snippets Due: 225/292/292');
    await checkBulkReviewCount(page, 'Bulk Review: 7');

    await triggerTrackSwitch(page);
    await startLoopOnThirdEl(page);
    await page.waitForTimeout(500);
    await verifyPostFreeLoopUI(page);
    await toggleLeftAndRightChecks(page);
    await mockSaveSnippetAPIE2E(
      page,
      {
        id: '335fbec1-bd11-4a53-becc-e453d6ed003a',
        time: 6.001384,
        isContracted: false,
        reviewData: {
          due: new Date(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: new Date(),
          ease: 2.5,
          interval: 0,
        },
        targetLang:
          '水/最近こんな小説を読んだんですよ。堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
        baseLang:
          'Mizu/I read this novel recently.Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
        suggestedFocusText: 'を読んだんですよ堀/はい。はい。水/『目',
        focusedText: '読んだんですよ。堀/はい。はい。水/『目',
      },
      false,
    );
    await page.keyboard.press('Shift+Enter');
    await checkSnippetsDueMeta(page, 'Snippets Due: 225/293/293');
    await checkBulkReviewCount(page, 'Bulk Review: 8');
    await expect(
      page.getByTestId('transcript-time-overlap-indicator'),
    ).toHaveCount(0);
  });

  const triggerOverlappingSnippets = async (page: Page) => {
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
    await page.keyboard.press('Shift+"');
    await expect(
      page.getByTestId('transcript-time-overlap-indicator'),
    ).toHaveCount(2);
  };

  test('3 second loop using Shift+" keyboard shortcut - multi sentences', async ({
    page,
  }) => {
    await goFromLandingToLearningScreen(page);
    await triggerTrackSwitch(page);
    await triggerOverlappingSnippets(page);
    await verifyOverlappingSnippetUI(page);
    await mockSaveSnippetAPIE2E(
      page,
      {
        id: '335fbec1-bd11-4a53-becc-e453d6ed003a',
        time: 6.001384,
        isContracted: false,
        reviewData: {
          due: new Date(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: new Date(),
          ease: 2.5,
          interval: 0,
        },
        targetLang:
          '水/最近こんな小説を読んだんですよ。堀/はい。はい。水/『目で見ることばで話をさせて』という小説なんですけど、これあらすじを話しますと',
        baseLang:
          'Mizu/I read this novel recently.Hori/Yes. Yes. Mizu/It\'s called "Let Me Speak with the Language of My Eyes." Here\'s the synopsis:',
        suggestedFocusText: 'を読んだんですよ堀/はい。はい。水/『目',
        focusedText: '読んだんですよ。堀/はい。はい。水/『目',
      },
      false,
    );
    await saveSecondSnippet(page);
    await verifyPostSaveOverlappingSnippetUI(page);
  });
});
