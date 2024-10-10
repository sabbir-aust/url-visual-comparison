// excelHelper.js
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to read URLs from an Excel file
const readExcelFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assuming you want to read from the first sheet
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};

// Function to write data back to the Excel file
const writeExcelFile = (filePath, data) => {
  let workbook;
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
  } else {
    workbook = XLSX.utils.book_new(); // Create a new workbook
  }
  const sheetName = 'Results'; // You can set your desired sheet name
  const updatedWorksheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = updatedWorksheet;
  XLSX.utils.book_append_sheet(workbook, updatedWorksheet, sheetName);
  XLSX.writeFile(workbook, filePath);
};

// Export the functions
module.exports = {
  readExcelFile,
  writeExcelFile,
};

