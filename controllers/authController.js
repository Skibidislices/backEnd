import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from 'moment';
import {
  findUserByEmail,
  createUser,
  verifyUser,
  setUserResetPasswordToken,
  resetUserPassword
} from '../models/User.js';
import transporter from '../config/nodemailer.js';

const jwtSecret = process.env.JWT_SECRET;

export const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await findUserByEmail(email);
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

    const userId = await createUser(email, hashedPassword, verificationToken, verificationTokenExpires);

    const verificationUrl = `http://localhost:5173/verify?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Server error');
      }
      res.json({ msg: 'Verification email sent' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const rowsAffected = await verifyUser(req.params.token);
    if (rowsAffected === 0) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }
    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpires = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

    await setUserResetPasswordToken(email, resetToken, resetTokenExpires);

    const resetUrl = `http://localhost:5173/reset-token?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Please reset your password by clicking the following link: ${resetUrl}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Server error');
      }
      res.json({ msg: 'Password reset email sent' });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const rowsAffected = await resetUserPassword(req.params.token, hashedPassword);
    if (rowsAffected === 0) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }
    res.json({ msg: 'Password has been reset' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
