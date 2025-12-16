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
