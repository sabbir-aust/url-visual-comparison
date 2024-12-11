const { test } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { PNG } = require('pngjs');
const ComparisonHelper = require('../src/comparisonHelper');

test.describe('Compare screenshots', () => {
  const screenshotDir = 'screenshots/visualComparison';
  const testDir = path.join(screenshotDir, 'test');
  const mainDir = path.join(screenshotDir, 'main');
  const diffDir = path.join(screenshotDir, 'diff');
  const comparisonResults = [];

  test('Compare saved screenshots', async () => {
    const testScreenshots = fs.readdirSync(testDir).filter(file => file.startsWith('test_'));
    const mainScreenshots = fs.readdirSync(mainDir).filter(file => file.startsWith('main_'));

    for (let i = 0; i < testScreenshots.length; i++) {
      const testFile = path.join(testDir, testScreenshots[i]);
      const mainFile = path.join(mainDir, mainScreenshots[i]);
      const diffFile = path.join(diffDir, `diff_${i}.png`);

      const img1 = PNG.sync.read(fs.readFileSync(testFile));
      const img2 = PNG.sync.read(fs.readFileSync(mainFile));

      let difference = 0;
      let status = '';

      const pixelmatch = (await import('pixelmatch')).default;

      if (img1.width !== img2.width || img1.height !== img2.height) {
        const croppedImg = ComparisonHelper.cropImage(img1, img2.height);
        const { width, height } = img2;
        const diff = new PNG({ width, height });
        difference = pixelmatch(croppedImg.data, img2.data, diff.data, width, height, { threshold: 0.1 });
        fs.writeFileSync(diffFile, PNG.sync.write(diff));
        status = 'Not Matched (Cropped)';
      } else {
        const { width, height } = img1;
        const diff = new PNG({ width, height });
        difference = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
        fs.writeFileSync(diffFile, PNG.sync.write(diff));
        status = difference > 0 ? 'Not Matched' : 'Matched';
      }

      comparisonResults.push({ testFile, mainFile, Difference: difference, Status: status });
    }

    console.log('Comparison Results:', comparisonResults);
  });
});
//