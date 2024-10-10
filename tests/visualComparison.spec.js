const { test } = require('@playwright/test');
const path = require('path');
const ComparisonHelper = require('../src/comparisonHelper');
const VisualComparisonPage = require('../src/visualComparisonPage');

const urlsFilePath = path.join(__dirname, '../urls.xlsx');
const rows = require('../src/excelHelper').readExcelFile(urlsFilePath);

test.describe('Visual comparison between dev and prod URLs', () => {
  const comparisonResults = [];
  let visualComparison; // Declare the variable here

  test.beforeEach(async ({ page }) => {
    visualComparison = new VisualComparisonPage(page); // Initialize it in beforeEach
  });

  rows.forEach((row, index) => {
    const devUrl = row.devUrls;
    const prodUrl = row.prodUrls;

    test(`Compare ${devUrl} with corresponding prod URL`, async () => {
      if (!prodUrl) {
        console.log(`No corresponding prod URL for ${devUrl}`);
        return;
      }

      const result = await visualComparison.compareScreenshots(devUrl, prodUrl, index);
      comparisonResults.push(result);
    });
  });

  test.afterAll(async () => {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const excelFileName = `URL_Comparison_${dateString}_${timeString}.xlsx`;
    const excelFilePath = path.join(__dirname, '../Result', excelFileName);

    await ComparisonHelper.writeResultsToExcel(excelFilePath, comparisonResults);
  });
});
