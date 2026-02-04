import { test, expect } from '@playwright/test';
import { setupApiMocks } from './helpers/mock-api';
import { landingMetaData } from './helpers/landing-meta-data';

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

  // Test each content item from landing meta data
  for (const contentItem of landingMetaData) {
    const {
      title,
      dueSnippets,
      dueSentences,
      dueWords,
      contentHasBeenReviews,
    } = contentItem;

    // Use data-testid to find the button (more reliable than truncated text)
    const contentButton = page.getByTestId(`content-item-${title}`);
    await expect(contentButton).toBeVisible();

    // Check for specific due widgets based on meta data
    const snippetsWidget = page.getByTestId(`due-snippets-${title}`);
    if (dueSnippets > 0) {
      await expect(snippetsWidget).toBeVisible();
      await expect(snippetsWidget).toContainText(dueSnippets.toString());
    } else {
      await expect(snippetsWidget).not.toBeVisible();
    }

    const sentencesWidget = page.getByTestId(`due-sentences-${title}`);
    if (dueSentences > 0) {
      await expect(sentencesWidget).toBeVisible();
      await expect(sentencesWidget).toContainText(dueSentences.toString());
    } else {
      await expect(sentencesWidget).not.toBeVisible();
    }

    const wordsWidget = page.getByTestId(`due-words-${title}`);
    if (dueWords > 0) {
      await expect(wordsWidget).toBeVisible();
      await expect(wordsWidget).toContainText(dueWords.toString());
    } else {
      await expect(wordsWidget).not.toBeVisible();
    }

    // Check review status indicator
    const contentCard = contentButton.locator('../..');
    const checkmark = contentCard.locator('svg.lucide-check');
    const newTag = contentCard.locator('span:text("🆕")');

    if (contentHasBeenReviews) {
      await expect(checkmark).toBeVisible();
      await expect(newTag).not.toBeVisible();
    } else {
      await expect(newTag).toBeVisible();
      await expect(checkmark).not.toBeVisible();
    }
  }
});

test('breadcrumb navigation displays correct counts', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check Words link with count
  const wordsLink = page.getByRole('link', { name: /Words \(\d+\)/ });
  await expect(wordsLink).toBeVisible();

  // Verify it shows Words (149) specifically
  await expect(wordsLink).toHaveText('Words (149)');

  // Check Sentence button with count (disabled, so still a link)
  const sentencesButton = page.getByRole('link', {
    name: /Sentence \(\d+\)/,
  });
  await expect(sentencesButton).toBeVisible();
  await expect(sentencesButton).toHaveText('Sentence (1)');

  // Verify Words link is visible with correct count (but don't click it - it's a dummy button)
  await expect(wordsLink).toBeVisible();
  await expect(wordsLink).toHaveText('Words (149)');

  // Check Content link exists
  const contentLink = page.getByRole('link', { name: 'Content' });
  await expect(contentLink).toBeVisible();
});
