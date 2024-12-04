const fs = require('fs'); // Add this line to import fs
const { PNG } = require('pngjs');
const ComparisonHelper = require('../src/comparisonHelper');

class VisualComparisonPage {
  constructor(page) {
    this.page = page;
  }

  async performLogin(email, password) {
    const emailSelector = '//input[@type="text" and contains(@id, "username")]'; // Replace with the actual selector for the email input field
    const passwordSelector = '//input[@type="password" and contains(@id, "password")]'; // Replace with the actual selector for the password input field
    const loginButtonSelector = '//input[@type="submit" and contains(@id, "loginbtn")]'; // Replace with the actual selector for the login button

    if (await this.page.isVisible(emailSelector)) {
      console.log('Login page detected, performing login...');
      await this.page.fill(emailSelector, email);
      await this.page.fill(passwordSelector, password);
      await this.page.click(loginButtonSelector);
      await this.page.waitForNavigation(); // Wait for the next page to load
    } else {
      console.log('Login page not detected, skipping login...');
    }
  }

  async takeScreenshot(url, screenshotPath) {
    await this.page.goto(url);
    await this.page.waitForTimeout(2000); // Adjust as necessary
    // Call the login function
    await this.performLogin('akash.ru.37@gmail.com', 'Cse123455@');
    await this.page.waitForTimeout(5000); // Additional wait if necessary
    const screenshot = await this.page.screenshot({ fullPage: true });
    fs.writeFileSync(screenshotPath, screenshot); // Save the screenshot
    await this.page.waitForTimeout(3000);
    return PNG.sync.read(fs.readFileSync(screenshotPath)); // Read the saved screenshot
  }

  async compareScreenshots(devUrl, prodUrl, index) {
    const sanitizedDevUrl = ComparisonHelper.sanitizeUrl(devUrl);
    const sanitizedProdUrl = ComparisonHelper.sanitizeUrl(prodUrl);
    const screenshotPathDev = `screenshots/visualComparison/test/test_${sanitizedDevUrl}_${index}.png`;
    const screenshotPathProd = `screenshots/visualComparison/main/main_${sanitizedProdUrl}_${index}.png`;
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