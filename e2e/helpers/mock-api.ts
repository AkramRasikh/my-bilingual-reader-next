import { ContentTypes } from '@/app/types/content-types';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { mockEasyLinguisticsRadioSignLangIslandSnippets } from '../mock-data/easy-linguistics-radio-sign-lang-island';

// Fixed date for consistent e2e testing
// Set this to a date that makes sense for your mock data time comparisons
export const E2E_FIXED_DATE = new Date('2025-12-11T12:00:00.000Z');

/**
 * Sets up API mocking for e2e tests
 * Intercepts /api/getOnLoadData and returns mock data from base-mock-data.json
 */
export async function setupApiMocks(page: Page) {
  // Set e2e flag in localStorage to skip localStorage checks
  await page.addInitScript(() => {
    window.localStorage.setItem('e2e-testing', 'true');
  });

  // Freeze time for consistent testing
  await page.addInitScript((fixedDate) => {
    // Override Date constructor and Date.now()
    const originalDate = Date;
    const fixedTime = new originalDate(fixedDate).getTime();

    // @ts-ignore
    globalThis.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(fixedTime);
        } else {
          super(...args);
        }
      }

      static now() {
        return fixedTime;
      }
    };
  }, E2E_FIXED_DATE.toISOString());

  // Load mock data
  const mockDataPath = path.join(__dirname, '../mock-data/base-mock-data.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

  // Intercept the API call
  await page.route('**/api/getOnLoadData', async (route) => {
    const [contentData, wordsData, sentencesData] = mockData;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        contentData: contentData?.content.map(
          (contentWidget: ContentTypes, contentIndex: number) => {
            return {
              ...contentWidget,
              contentIndex,
              generalTopicName: contentWidget.title,
            };
          },
        ),
        wordsData: wordsData.words,
        sentencesData: sentencesData?.sentences,
      }),
    });
  });

  // Intercept updateSentence API call
  await page.route('**/api/updateSentence', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Use the fixed date as the last_review time
    const lastReviewTime = new Date(E2E_FIXED_DATE);
    // Add one minute (60000 milliseconds) for the due time
    const dueTime = new Date(lastReviewTime.getTime() + 60000);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reviewData: {
          due: dueTime.toISOString(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: lastReviewTime.toISOString(),
          ease: 2.5,
          interval: 0,
        },
      }),
    });
  });

  // Intercept breakdownSentence API call
  await page.route('**/api/breakdownSentence', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        vocab: [
          {
            surfaceForm: 'ゆる',
            meaning: 'loose or relaxed',
          },
          {
            surfaceForm: '言語学',
            meaning: 'linguistics',
          },
          {
            surfaceForm: 'ラジオ',
            meaning: 'radio',
          },
        ],
        sentenceStructure:
          'ゆる (loose) + 言語学 (linguistics) + ラジオ (radio)',
        meaning: 'Loose Linguistics Radio',
      }),
    });
  });

  // Intercept bulkSentenceReview API call
  await page.route('**/api/bulkSentenceReview', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calculate review date (current fixed date + 5 minutes)
    const lastReviewTime = new Date(E2E_FIXED_DATE);
    const dueTime = new Date(lastReviewTime.getTime() + 5 * 60000); // 5 minutes

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        updatedSentenceIds: [
          'b7b19fec-aba9-4ed3-bae6-a8150f99f415',
          '2cb4ff62-1826-4e76-adb4-f3bd2700c90b',
          'e9cb0b45-5794-47f8-8a05-9e8323dc0cce',
          'b460a5ea-587e-4632-924e-1e6379708d59',
          'cf0d93be-aca9-4889-989f-7148b80bff30',
          '7afd1f73-cb7a-4600-abea-a174d493734c',
          '7648d676-66e1-4d3b-abb5-3083750c5ce8',
        ],
        reviewData: {
          due: dueTime.toISOString(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: lastReviewTime.toISOString(),
          ease: 2.5,
          interval: 0,
        },
      }),
    });
  });
}

/**
 * Sets up API mock for updateContentMetaData with new snippet
 * @param page - Playwright page object
 * @param newSnippet - The snippet object to add to the existing snippets
 * @param existingSnippets - Array of existing snippets to include
 * @param delay - Optional delay in ms for the mock response (default: 1000)
 */
export async function mockUpdateContentMetaDataWithSnippet(page: Page) {
  return await page.route('**/api/updateContentMetaData', async (route) => {
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
}

/**
 * Sets up API mock for updateContentMetaData deletion
 * @param page - Playwright page object
 * @param snippets - Array of snippets after deletion
 * @param delay - Optional delay in ms for the mock response (default: 500)
 */
export async function mockUpdateContentMetaDataDelete(
  page: Page,
  snippets: any[],
  delay: number = 500,
) {
  await page.route('**/api/updateContentMetaData', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        snippets,
      }),
    });
  });
}

/**
 * Clears e2e flag from localStorage
 */
export async function clearE2EFlag(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('e2e-testing');
  });
}

export const mockUpdateSentenceOneMinuteAPI = async (page: Page) => {
  return await page.route('**/api/updateSentence', async (route) => {
    // Wait 1 second to make loading spinner visible
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use the fixed date as the last_review time
    const lastReviewTime = new Date(E2E_FIXED_DATE);
    // Add one minute (60000 milliseconds) for the due time
    const dueTime = new Date(lastReviewTime.getTime() + 60000);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reviewData: {
          due: dueTime.toISOString(),
          stability: 0.40255,
          difficulty: 7.1949,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 0,
          state: 1,
          last_review: lastReviewTime.toISOString(),
          ease: 2.5,
          interval: 0,
        },
      }),
    });
  });
};
