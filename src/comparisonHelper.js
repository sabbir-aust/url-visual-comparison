const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

class ComparisonHelper {
  static sanitizeUrl(url) {
    return url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');
  }

  static cropImage(img, newHeight) {
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
  }

  static async writeResultsToExcel(filePath, results) {
    const { writeExcelFile } = require('../src/excelHelper');
    await writeExcelFile(filePath, results);
    console.log(`Excel file saved at: ${filePath}`);
  }
}

module.exports = ComparisonHelper;
