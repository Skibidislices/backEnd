import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import xlsx from 'xlsx';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/verify/:token', verifyEmail);
router.post('/auth/reset-password', resetPasswordRequest);
router.post('/auth/reset-password/:token', resetPassword);


// File upload route
router.post('/upload-excel', authMiddleware, upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(worksheet);
    res.json(json);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

export default router;
