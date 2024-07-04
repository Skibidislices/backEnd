import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DATA_FILE = path.join(UPLOADS_DIR, '/latest.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

export const saveJsonData = (jsonData) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData));
};

export const loadJsonData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error('No uploaded data found.');
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};
