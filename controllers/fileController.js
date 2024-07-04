import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

export const saveExcelFile = (file) => {
  const filePath = path.join(UPLOADS_DIR, 'latest.xlsx');
  fs.writeFileSync(filePath, file.buffer);
  return filePath;
};

export const loadExcelFile = () => {
  const filePath = path.join(UPLOADS_DIR, 'latest.xlsx');
  if (!fs.existsSync(filePath)) {
    throw new Error('No uploaded file found.');
  }
  const workbook = xlsx.readFile(filePath);
  const jsonResult = {};
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    jsonResult[sheetName] = xlsx.utils.sheet_to_json(worksheet);
  });
  return jsonResult;
};
