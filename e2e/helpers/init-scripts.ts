import { Page } from '@playwright/test';
import { E2E_FIXED_DATE } from './mock-api';

export const initScriptsE2e = async (page: Page) => {
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
};
