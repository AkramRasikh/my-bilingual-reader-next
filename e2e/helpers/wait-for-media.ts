import { Page } from '@playwright/test';

// Helper function to wait for video/audio metadata to load
export async function waitForMediaMetadata(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const video = document.querySelector('video');
      const audio = document.querySelector('audio');
      const mediaElement = video || audio;

      if (mediaElement) {
        if (mediaElement.readyState >= 1) {
          // Metadata already loaded (HAVE_METADATA or higher)
          resolve();
        } else {
          // Set a timeout to avoid waiting forever
          const timeout = setTimeout(() => {
            resolve();
          }, 3000);

          // Wait for metadata to load
          mediaElement.addEventListener(
            'loadedmetadata',
            () => {
              clearTimeout(timeout);
              resolve();
            },
            { once: true },
          );

          // Force load metadata if possible
          if (mediaElement.load) {
            mediaElement.load();
          }
        }
      } else {
        // No media element found, resolve immediately
        resolve();
      }
    });
  });
}
