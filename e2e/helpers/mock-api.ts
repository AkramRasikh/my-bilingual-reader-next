import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sets up API mocking for e2e tests
 * Intercepts /api/getOnLoadData and returns mock data from base-mock-data.json
 */
export async function setupApiMocks(page: Page) {
  // Set e2e flag in localStorage to skip localStorage checks
  await page.addInitScript(() => {
    window.localStorage.setItem('e2e-testing', 'true');
  });

  // Load mock data
  const mockDataPath = path.join(__dirname, '../mock-data/base-mock-data.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf-8'));

  // Intercept the API call
  await page.route('**/api/getOnLoadData', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        contentData: mockData.japanese.content,
        wordsData: mockData.japanese.words,
        sentencesData: mockData.japanese.sentences,
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
