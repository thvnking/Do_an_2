import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

function sign(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    const error = new Error('Set JWT_SECRET to a random value of at least 32 characters');
    error.status = 503;
    throw error;
  }
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, { subject: String(user.user_id), expiresIn: '7d' });
}

authRouter.post('/register', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ error: 'JWT_SECRET must be configured (at least 32 characters)' });
    const { username, email, password, fullName } = req.body;
    if (typeof username !== 'string' || !/^[\p{L}\p{N}_.-]{3,50}$/u.test(username.trim()) || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 100) {
      return res.status(400).json({ error: 'Username (3–50 ký tự), email hợp lệ và mật khẩu (8–100 ký tự) là bắt buộc' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query('INSERT INTO users (username,email,password_hash,full_name) VALUES ($1,$2,$3,$4) RETURNING user_id,username,email,full_name,role', [username.trim(), email.trim().toLowerCase(), hash, typeof fullName === 'string' ? fullName.trim().slice(0, 150) : null]);
    res.status(201).json({ user: result.rows[0], token: sign(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Username or email already exists' });
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ error: 'JWT_SECRET must be configured (at least 32 characters)' });
    const identity = typeof req.body.identity === 'string' ? req.body.identity.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const result = await pool.query('SELECT user_id,username,email,password_hash,full_name,role FROM users WHERE lower(email)=lower($1) OR lower(username)=lower($1) LIMIT 1', [identity]);
    if (!result.rowCount || !(await bcrypt.compare(password, result.rows[0].password_hash))) return res.status(401).json({ error: 'Email/tên đăng nhập hoặc mật khẩu không đúng' });
    const { password_hash, ...user } = result.rows[0];
    res.json({ user, token: sign(user) });
  } catch (error) { next(error); }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT user_id,username,email,full_name,avatar_url,role,created_at FROM users WHERE user_id=$1', [req.user.userId]);
    if (!result.rowCount) return res.status(401).json({ error: 'Account no longer exists' });
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
});
