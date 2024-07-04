import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
} from '../controllers/authController.js';
import { responseExample, updateExample } from '../controllers/exampleController.js';
import { checkName } from '../middleware/exampleMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/verify/:token', verifyEmail);
router.post('/auth/reset-password', resetPasswordRequest);
router.post('/auth/reset-password/:token', resetPassword);

router.get('/', (req, res, next) => {
  res.json('hi');
});
router.get('/example', authMiddleware, checkName, responseExample);
router.post('/example', authMiddleware, checkName, updateExample);

export default router;
