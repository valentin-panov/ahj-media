/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import { fork } from 'child_process';

const puppeteer = require('puppeteer');

jest.setTimeout(35000); // puppeteer timeout

describe('timeline widget', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:9000';

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppeteer.launch({
      // this should be commented for CI?
      // headless: false, // show gui
      // slowMo: 250,
      // devtools: true, // show devTools
    });

    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('manual input should block incorrect input', async () => {
    await page.goto(baseUrl);

    await page.type('#newEntryInput', '1');
    await page.keyboard.press('Enter');

    await page.waitForSelector('div.modal', { visible: true });

    await page.type('#manualCoordsInput', `1`);
    await page.keyboard.press('Enter');

    await page.waitForSelector('#manualCoordsInput.invalid');
  });

  const cases = [
    `60.0420485, 30.3636373`,
    `51.50851, -0.12572`,
    `51.50851,-0.12572`,
    `[51.50851, -0.12572]`,
  ];

  test.each(cases)('manual input should pass with correct input', async (param) => {
    await page.goto(baseUrl);

    await page.$eval('#newEntryInput', (el, value) => (el.value = value), param);
    await page.keyboard.press('Enter');

    await page.waitForSelector('div.modal', { visible: true });

    await page.$eval('#manualCoordsInput', (el, value) => (el.value = value), param);
    await page.keyboard.press('Enter');

    const name = await page.$eval('span.unit-text', (el) => el.innerText);
    expect(name).toBe(param);

    const geotag = await page.$eval('span.unit-geotag', (el) => el.innerText);
    let expected = param.replace(/\[|\]|\s*|\+/g, '');
    expected = expected.replace(/,/g, ', ');
    expected = `[${expected}]`;
    expect(geotag).toBe(expected);
  });
});
