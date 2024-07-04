import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
} from '../controllers/authController.js';
import { saveExcelFile, loadExcelFile } from '../controllers/fileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/verify/:token', verifyEmail);
router.post('/auth/reset-password', resetPasswordRequest);
router.post('/auth/reset-password/:token', resetPassword);

router.post('/upload-excel', authMiddleware, upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const filePath = saveExcelFile(file);
    const jsonResult = loadExcelFile();
    res.json(jsonResult);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

router.get('/load-latest-excel', authMiddleware, (req, res) => {
  try {
    const jsonResult = loadExcelFile();
    res.json(jsonResult);
  } catch (error) {
    console.error('Error loading file:', error);
    res.status(500).send('Error loading file');
  }
});

export default router;
