import { test, expect, type Page, Browser } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logger } from './logger'

test.describe('Time Keeper', () => {
  let page: Page;
  const port = process.env.TEST_SERVER_PORT || '3000';
  const timeZonesList = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Juneau", "Pacific/Honolulu"]

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  
  });

  test('should display title and default timezone', async () => {
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);
    await expect(page).toHaveTitle(/Time Keeper/);
    const nameYou = page.locator('td span[class*="text-indigo"]');
    const nameYouText = await nameYou.textContent();
    expect(nameYouText).toBe('(You)');
  });

  const timeZones = [
    { name: 'America/New_York', label: 'New York' },
    { name: 'Europe/London', label: 'London' },
    { name: 'Asia/Tokyo', label: 'Tokyo' },
    { name: 'Pacific/Honolulu', label: 'Honolulu' },
    { name: 'America/Los_Angeles', label: 'Los Angeles' },
  ];

  for (const timeZone of timeZones) {
    test(`should display correct time for ${timeZone.label} timezone`, async ({ browser }) => {
      logger.info(`Set default ${timeZone.label} timezone`);
      const context = await browser.newContext({
        timezoneId: timeZone.name,
      });
      const expectedTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone.name,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());

      const page = await context.newPage();
      logger.info(`Navigate to homepage`);
      await page.goto(`http://localhost:${port}`);
      
      logger.info(`Get timezone values`);
      const values = await getTimeZoneValues(page);

      logger.info(`Get local time values`);
      const localTimeRows = page.locator(`tbody td`).nth(2);
      const localTimeValues = await localTimeRows.allTextContents();

      expect(values).toStrictEqual([timeZone.name]);
      expect(localTimeValues).toStrictEqual([expectedTime]);

      await context.close();
      
    });
  }

  test('should add a new timezone', async ({ browser }) => {
    const testLabel = faker.string.symbol(10);
    const { page, timeZone, context } = await setDefaultTimeZone(browser);

    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    const randomValue = await addRandonTimeZone(page, testLabel);
    const values = await getTimeZoneValues(page);
    
    expect(values).toHaveLength(2);
    expect(values).toContain(randomValue);
    expect(values).toContain(timeZone);
    await context.close();
  });

  test('should delete just added timezone', async ({ browser }) => {
    const testLabel = faker.string.alphanumeric(10);
    const { page, timeZone, context } = await setDefaultTimeZone(browser);
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    logger.info(`Add new timezone`);
    const randomValue = await addRandonTimeZone(page, testLabel);

    logger.info(`Delete just added timezone`);
    const deleteButton = page.locator('tbody tr td').getByText(randomValue).locator('~td button');
    await deleteButton.click();

    logger.info(`Get timezone values`);
    const values = await getTimeZoneValues(page);
    expect(values).toStrictEqual([timeZone]);
    await context.close();
  });

  test('should not delete default timezone',{
    tag: ['@bug'],
    annotation: {
      type: 'bug',
      description: 'https://github.com/LiutskoOlga/timezone-app-hiive-test/issues/1',
    }
  },  async ({ browser }) => {
    const { page,timeZone, context } = await setDefaultTimeZone(browser);
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    logger.info(`Delete default timezone`);
    const deleteButton = page.locator('tbody tr td').getByText(timeZone).locator('~td button');
    await deleteButton.click();

    logger.info(`Get timezone values`);
    const values = await getTimeZoneValues(page);
    expect(values).toStrictEqual([timeZone]);
    await context.close();
  });

  test('should be sorted from min time to max time',{
    tag: ['@bug'],
    annotation: {
      type: 'bug',
      description: 'https://github.com/LiutskoOlga/timezone-app-hiive-test/issues/3',
    }
  }, async ({ browser }) => {

   
    const { page, timeZone, context } = await setDefaultTimeZone(browser);
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    logger.info(`Add new timezone`);
    for (let i = 0; i < timeZonesList.length; i++) {
      const timeZoneName = timeZonesList[i];
      const testLabel = faker.string.alphanumeric(10);
      await page.click('div button.block');
      await page.fill('input#label', testLabel);
      const dropdown = page.locator('select#timezone');

      logger.info(`Select timezone ${timeZoneName}`);
  
      await dropdown.selectOption(timeZoneName);

      logger.info(`Submit form`);
      await page.click('button[type="submit"]');
    }

    logger.info(`Get timezone time values`);
    const timeValueRows = page.locator('tbody tr td:nth-child(3)');
    const values = await timeValueRows.allTextContents();
    const sortedValues = [...values].sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a}`).getTime();
      const timeB = new Date(`1970/01/01 ${b}`).getTime();
      return timeA - timeB;
    });
    expect(values).toEqual(sortedValues);
    await context.close();
  });

  test('should not be able to add timezone without selected one', async () => {
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    const testLabel = faker.string.alphanumeric(10);
    await page.click('div button.block');
    await page.fill('input#label', testLabel);

    logger.info(`Submit form`);
    await page.click('button[type="submit"]');
    const addForm = page.locator('div form');
    expect(addForm).toBeVisible();
    const timeZoneRows = await page.$$('tbody tr td:nth-child(2)');
    expect(timeZoneRows).toHaveLength(1);

  });

  test('should not be able to add timezone without timezoneName', async () => {
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    await page.click('div button.block');
    const dropdown = page.locator('select#timezone');

    logger.info(`Select timezone ${timeZonesList[1]}`);

    await dropdown.selectOption(timeZonesList[1]);

    logger.info(`Submit form`);
    await page.click('button[type="submit"]');
    const addForm = page.locator('div form');
    expect(addForm).toBeVisible();
    const timeZoneRows = await page.$$('tbody tr td:nth-child(2)');
    expect(timeZoneRows).toHaveLength(1);
  });

  test('should not be able to add timezone without selected values', async () => {
    logger.info(`Navigate to homepage`);
    await page.goto(`http://localhost:${port}`);

    await page.click('div button.block');

    logger.info(`Submit form`);
    await page.click('button[type="submit"]');
    const addForm = page.locator('div form');
    expect(addForm).toBeVisible();
    const timeZoneRows = await page.$$('tbody tr td:nth-child(2)');
    expect(timeZoneRows).toHaveLength(1);
  });
});




async function addRandonTimeZone(page: Page, testLabel: string) {
  logger.info(`Add new timezone`);
  await page.click('div button.block');
  await page.fill('input#label', testLabel);
  const dropdown = page.locator('select#timezone');

  logger.info(`Get timezone options`);
  const options = await dropdown.locator('option').evaluateAll((options: HTMLOptionElement[]) => options.map(option => option.value).filter(value => value)
  );

  logger.info(`Select random timezone option`);
  const randomValue = options[Math.floor(Math.random() * options.length)];
  await dropdown.selectOption(randomValue);

  logger.info(`Submit form`);
  await page.click('button[type="submit"]');
  return randomValue;
}

async function setDefaultTimeZone(browser: Browser) {
  const timeZone = 'Africa/Tunis';
  const context = await browser.newContext({
    timezoneId: timeZone,
  });
  const page = await context.newPage();
  return { page, timeZone, context };
}

async function getTimeZoneValues(page: Page) {
  const timeZoneRows = page.locator('tbody tr td:nth-child(2)');
  const values = await timeZoneRows.allTextContents();
  return values;
}

