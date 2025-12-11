import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';

test.beforeEach(async ({ page }) => {
  // Setup API mocking for all tests
  await setupApiMocks(page);
});

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Yah Dun Kno!/);
});

test('homepage loads with mock data', async ({ page }) => {
  await page.goto('/');

  // Wait for page to be loaded
  await page.waitForLoadState('networkidle');

  // Check that the page loaded successfully
  expect(page.url()).toBe('http://localhost:3000/');
});

test('displays content items with correct titles and widgets', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Test specific content items exist with their titles
  const expectedTitles = [
    'Toru-Miyamoto-Takaichis-risky-remarks-Taiwan-emergency',
    'Toru-Miyamoto-Japanese-communist-youth',
    'Takasugi-Shinsaku-destroying-feudal-society',
    'coten-radio-mental-health-part-two',
    'koten-radio-saicho-kukai-enlighten-men',
    'jaru-jaru-push-pull-door',
    'easy-linguistics-radio-sign-lang-island',
  ];

  for (const title of expectedTitles) {
    // Use data-testid to find the button (more reliable than truncated text)
    const contentButton = page.getByTestId(`content-item-${title}`);
    await expect(contentButton).toBeVisible();

    // Get the parent container for this content item
    const contentCard = contentButton.locator('../..');

    // Check for due widgets (these may or may not be visible depending on mock data)
    // Snippets widget (scissors icon)
    const snippetsWidget = contentCard.locator('div:has(svg.lucide-scissors)');

    // Sentences widget (scroll icon)
    const sentencesWidget = contentCard.locator(
      'div:has(svg.lucide-scroll-text)',
    );

    // Words widget (word icon)
    const wordsWidget = contentCard.locator('div:has(svg.lucide-whole-word)');

    // Verify at least one widget indicator exists or content is marked as reviewed
    const hasSnippets = (await snippetsWidget.count()) > 0;
    const hasSentences = (await sentencesWidget.count()) > 0;
    const hasWords = (await wordsWidget.count()) > 0;
    const hasNewTag =
      (await contentCard.locator('span:text("🆕")').count()) > 0;
    const hasCheckmark =
      (await contentCard.locator('svg.lucide-check').count()) > 0;

    // Should have either review indicators or status tags
    expect(
      hasSnippets || hasSentences || hasWords || hasNewTag || hasCheckmark,
    ).toBeTruthy();
  }
});

test('breadcrumb navigation displays correct counts', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check Words button with count
  const wordsButton = page.getByRole('button', { name: /Words \(\d+\)/ });
  await expect(wordsButton).toBeVisible();

  // Verify it shows Words (149) specifically
  await expect(wordsButton).toHaveText('Words (149)');

  // Check Sentence button with count
  const sentencesButton = page.getByRole('button', {
    name: /Sentence \(\d+\)/,
  });
  await expect(sentencesButton).toBeVisible();

  // Check Content button exists
  const contentButton = page.getByRole('button', { name: 'Content' });
  await expect(contentButton).toBeVisible();
});

// test('content item has youtube thumbnail', async ({ page }) => {
//   await page.goto('/');
//   await page.waitForLoadState('networkidle');

//   const title = 'Toru-Miyamoto-Takaichis-risky-remarks-Taiwan-emergency';
//   const contentButton = page.locator(`button:has-text("${title}")`);
//   const contentCard = contentButton.locator('..');

//   // Check for YouTube thumbnail image
//   const thumbnail = contentCard.locator('img[alt*="youtube"]');
//   await expect(thumbnail).toBeVisible();
// });
