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
        contentData: contentData.content,
        wordsData: wordsData.words,
        sentencesData: sentencesData?.sentences,
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
