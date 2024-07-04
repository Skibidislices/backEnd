import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
  getUserInfo, 
} from '../controllers/authController.js';
import { saveJsonData, loadJsonData } from '../controllers/fileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import xlsx from 'xlsx';
import { findUserByEmail } from '../models/User.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/verify/:token', verifyEmail);
router.post('/auth/reset-password', resetPasswordRequest);
router.post('/auth/reset-password/:token', resetPassword);

router.get('/auth/me', authMiddleware, getUserInfo);

router.post('/upload-excel', authMiddleware, upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const jsonResult = {};

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      jsonResult[sheetName] = xlsx.utils.sheet_to_json(worksheet);
    });

    saveJsonData(jsonResult);
    res.json(jsonResult);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

router.get('/load-latest-excel', authMiddleware, (req, res) => {
  try {
    const jsonResult = loadJsonData();
    res.json(jsonResult);
  } catch (error) {
    console.error('Error loading file:', error);
    res.status(500).send('Error loading file');
  }
});

router.get('/user-timetable', authMiddleware, async (req, res) => {
  try {
    console.log(req.params);
    const userEmail = req.query.email;
    const data = loadJsonData();
    let userGroup = "teacher";
    const studentInfos = data.students.filter(student => {return student["email"] === userEmail});
    if(studentInfos.length > 0) userGroup = studentInfos[0]["group name"];
    const userTimetable = data.timetable.filter(activity => {
      const teacherEmails = activity["teacher email"].split(',').map(email => email.trim());
      if (teacherEmails.includes(userEmail)) {
        return true;
      }
      if (activity["student group"] === userGroup) {
        return true;
      }
      return false;
    });
    res.json(userTimetable);
  } catch (error) {
    console.error('Error fetching user timetable:', error);
    res.status(500).send('Error fetching user timetable');
  }
});

export default router;
