const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const { readExcelFile, writeExcelFile } = require('../excelHelper');

const urlsFilePath = path.join(__dirname, '../urls.xlsx');
const rows = readExcelFile(urlsFilePath);

const sanitizeUrl = (url) => {
  return url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
};

const cropImage = (img, newHeight) => {
  const cropped = new PNG({ width: img.width, height: newHeight });
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (img.width * y + x) << 2;
      const idxCropped = (cropped.width * y + x) << 2;
      cropped.data[idxCropped] = img.data[idx];
      cropped.data[idxCropped + 1] = img.data[idx + 1];
      cropped.data[idxCropped + 2] = img.data[idx + 2];
      cropped.data[idxCropped + 3] = img.data[idx + 3];
    }
  }
  return cropped;
};

test.describe('Visual comparison between dev and prod URLs', () => {
  const comparisonResults = []; // Collect all results here

  rows.forEach((row, index) => {
    const devUrl = row.devUrls;
    const prodUrl = row.prodUrls;

    test(`Compare ${devUrl} with corresponding prod URL`, async ({ page }) => {
      if (!prodUrl) {
        console.log(`No corresponding prod URL for ${devUrl}`);
        return;
      }

      const sanitizedDevUrl = sanitizeUrl(devUrl);
      const sanitizedProdUrl = sanitizeUrl(prodUrl);
      const screenshotPathDev = `screenshots/visualComparison/dev/dev_${sanitizedDevUrl}_${index}.png`;
      const screenshotPathProd = `screenshots/visualComparison/prod/prod_${sanitizedProdUrl}_${index}.png`;
      const screenshotDiffPath = `screenshots/visualComparison/diff/diff_${sanitizedDevUrl}_vs_${sanitizedProdUrl}_${index}.png`;

      await page.setViewportSize({ width: 1280, height: 800 });

      await page.goto(devUrl);
      await page.waitForTimeout(5000); 
      const screenshotDev = await page.screenshot({ fullPage: true });
      fs.writeFileSync(screenshotPathDev, screenshotDev);

      await page.goto(prodUrl);
      await page.waitForTimeout(5000); 
      const screenshotProd = await page.screenshot({ fullPage: true });
      fs.writeFileSync(screenshotPathProd, screenshotProd);

      const pixelmatch = (await import('pixelmatch')).default;

      const img1 = PNG.sync.read(fs.readFileSync(screenshotPathDev));
      const img2 = PNG.sync.read(fs.readFileSync(screenshotPathProd));

      let difference = 0;
      let status = '';
      const dateTime = new Date().toLocaleString(); 

      if (img1.width !== img2.width || img1.height !== img2.height) {
        const croppedDevImg = cropImage(img1, img2.height);
        const { width, height } = img2; 

        const diff = new PNG({ width, height });
        difference = pixelmatch(croppedDevImg.data, img2.data, diff.data, width, height, { threshold: 0.1 });

        fs.writeFileSync(screenshotDiffPath, PNG.sync.write(diff));
        status = 'Not Matched (Cropped)';
      } else {
        const { width, height } = img1;
        const diff = new PNG({ width, height });
        difference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

        fs.writeFileSync(screenshotDiffPath, PNG.sync.write(diff));
        status = difference > 0 ? 'Not Matched' : 'Matched';
      }

      comparisonResults.push({
        devUrls: devUrl,
        prodUrls: prodUrl,
        Difference: difference,
        Status: status,
        DateTime: dateTime,
      });
    });
  });

  test.afterAll(async () => {
    const now = new Date();
    const dateString = now.toISOString().split('T')[0]; 
    const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); 
    const excelFileName = `URL_Comparison_${dateString}_${timeString}.xlsx`;
    const excelFilePath = path.join(__dirname, '../Result', excelFileName);

    await writeExcelFile(excelFilePath, comparisonResults); 
    console.log(`Excel file saved at: ${excelFilePath}`);
  });
});
