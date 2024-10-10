const fs = require('fs'); // Add this line to import fs
const { PNG } = require('pngjs');
const ComparisonHelper = require('../src/comparisonHelper');

class VisualComparisonPage {
  constructor(page) {
    this.page = page;
  }

  async takeScreenshot(url, screenshotPath) {
    await this.page.goto(url);
    await this.page.waitForTimeout(5000); // Adjust as necessary
    const screenshot = await this.page.screenshot({ fullPage: true });
    fs.writeFileSync(screenshotPath, screenshot); // Save the screenshot
    return PNG.sync.read(fs.readFileSync(screenshotPath)); // Read the saved screenshot
  }

  async compareScreenshots(devUrl, prodUrl, index) {
    const sanitizedDevUrl = ComparisonHelper.sanitizeUrl(devUrl);
    const sanitizedProdUrl = ComparisonHelper.sanitizeUrl(prodUrl);
    const screenshotPathDev = `screenshots/visualComparison/dev/dev_${sanitizedDevUrl}_${index}.png`;
    const screenshotPathProd = `screenshots/visualComparison/prod/prod_${sanitizedProdUrl}_${index}.png`;
    const screenshotDiffPath = `screenshots/visualComparison/diff/diff_${sanitizedDevUrl}_vs_${sanitizedProdUrl}_${index}.png`;

    const img1 = await this.takeScreenshot(devUrl, screenshotPathDev);
    const img2 = await this.takeScreenshot(prodUrl, screenshotPathProd);

    let difference = 0;
    let status = '';
    const dateTime = new Date().toLocaleString();

    // Dynamically import pixelmatch here
    const pixelmatch = (await import('pixelmatch')).default;

    if (img1.width !== img2.width || img1.height !== img2.height) {
      const croppedDevImg = ComparisonHelper.cropImage(img1, img2.height);
      const { width, height } = img2;
      const diff = new PNG({ width, height });
      difference = pixelmatch(croppedDevImg.data, img2.data, diff.data, width, height, { threshold: 0.1 });
      fs.writeFileSync(screenshotDiffPath, PNG.sync.write(diff)); // Save the diff screenshot
      status = 'Not Matched (Cropped)';
    } else {
      const { width, height } = img1;
      const diff = new PNG({ width, height });
      difference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
      fs.writeFileSync(screenshotDiffPath, PNG.sync.write(diff)); // Save the diff screenshot
      status = difference > 0 ? 'Not Matched' : 'Matched';
    }

    return { devUrls: devUrl, prodUrls: prodUrl, Difference: difference, Status: status, DateTime: dateTime };
  }
}

module.exports = VisualComparisonPage;