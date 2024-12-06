const { test } = require('@playwright/test');
const path = require('path');
const VisualComparisonPage = require('../src/visualComparisonPage');
const { readExcelFile } = require('../src/excelHelper');

const urlsFilePath = path.join(__dirname, '../urls.xlsx');
const rows = readExcelFile(urlsFilePath);

test.describe('Capture screenshots for URLs', () => {
  let visualComparison;

  test.beforeEach(async ({ page }) => {
    visualComparison = new VisualComparisonPage(page);
  });

  rows.forEach((row, index) => {
    const devUrl = row.testUrls;
    const prodUrl = row.mainUrls;

    test(`Capture screenshots for ${devUrl} and ${prodUrl}`, async () => {
      if (!prodUrl) {
        console.log(`No corresponding prod URL for ${devUrl}`);
        return;
      }

      const sanitizedDevUrl = devUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedProdUrl = prodUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
      const screenshotPathDev = `screenshots/visualComparison/test/test_${sanitizedDevUrl}_${index}.png`;
      const screenshotPathProd = `screenshots/visualComparison/main/main_${sanitizedProdUrl}_${index}.png`;

      await visualComparison.takeScreenshot(devUrl, screenshotPathDev);
      await visualComparison.takeScreenshot(prodUrl, screenshotPathProd);
    });
  });
});
