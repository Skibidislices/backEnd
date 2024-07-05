import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
  getUserInfo,
} from '../controllers/authController.js';
import {
  clearPreviousData,
  insertStudents,
  insertTeachers,
  insertCourses,
  insertTimetable,
  fetchExcelData,
} from '../controllers/excelController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import xlsx from 'xlsx';
import db from '../config/db.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/verify/:token', verifyEmail);
router.post('/auth/reset-password', resetPasswordRequest);
router.post('/auth/reset-password/:token', resetPassword);

router.get('/auth/me', authMiddleware, getUserInfo);

router.post('/upload-excel', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const jsonResult = {};

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      jsonResult[sheetName] = xlsx.utils.sheet_to_json(worksheet);
    });

    await clearPreviousData();
    await insertStudents(jsonResult.students);
    await insertTeachers(jsonResult.teachers);
    await insertCourses(jsonResult.courses);
    await insertTimetable(jsonResult.timetable);

    res.json(await fetchExcelData());
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

router.get('/load-latest-excel', authMiddleware, async (req, res) => {
  try {
    res.json(await fetchExcelData());
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).send('Error loading data');
  }
});

router.get('/user-timetable', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.query.email;
    const [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [userEmail]);
    const user = userRows[0];

    if (!user) {
      return res.status(404).send('User not found');
    }

    let userGroup = "teacher";
    const [studentRows] = await db.execute('SELECT * FROM students WHERE email = ?', [userEmail]);
    if (studentRows.length > 0) {
      userGroup = studentRows[0].group;
    }

    const [timetableRows] = await db.execute(
      'SELECT * FROM timetable WHERE teacher_id = (SELECT id FROM teachers WHERE email = ?) OR `group` = ?',
      [userEmail, userGroup]
    );

    res.json(timetableRows);
  } catch (error) {
    console.error('Error fetching user timetable:', error);
    res.status(500).send('Error fetching user timetable');
  }
});

export default router;
