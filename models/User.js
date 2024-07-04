import db from '../config/db.js';
import moment from 'moment';

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async (email, password, verificationToken, verificationTokenExpires) => {
  const [result] = await db.execute(
    'INSERT INTO users (email, password, isVerified, verificationToken, verificationTokenExpires) VALUES (?, ?, ?, ?, ?)',
    [email, password, false, verificationToken, verificationTokenExpires]
  );
  return result.insertId;
};

export const verifyUser = async (token) => {
  const [result] = await db.execute(
    'UPDATE users SET isVerified = ?, verificationToken = ?, verificationTokenExpires = ? WHERE verificationToken = ? AND verificationTokenExpires > ?',
    [true, null, null, token, moment().format('YYYY-MM-DD HH:mm:ss')]
  );
  return result.affectedRows;
};

export const setUserResetPasswordToken = async (email, resetToken, resetTokenExpires) => {
  const [result] = await db.execute(
    'UPDATE users SET resetPasswordToken = ?, resetPasswordTokenExpires = ? WHERE email = ?',
    [resetToken, resetTokenExpires, email]
  );
  return result.affectedRows;
};

export const resetUserPassword = async (token, password) => {
  const [result] = await db.execute(
    'UPDATE users SET password = ?, resetPasswordToken = ?, resetPasswordTokenExpires = ? WHERE resetPasswordToken = ? AND resetPasswordTokenExpires > ?',
    [password, null, null, token, moment().format('YYYY-MM-DD HH:mm:ss')]
  );
  return result.affectedRows;
};
