import { ContentTypes } from '@/app/types/content-types';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
}

/**
 * Clears e2e flag from localStorage
 */
export async function clearE2EFlag(page: Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('e2e-testing');
  });
}
