import { pool } from '../db/pool.js';

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const result = await pool.query('SELECT role FROM users WHERE user_id=$1', [req.user.userId]);
    if (!result.rowCount || result.rows[0].role !== 'ADMIN') return res.status(403).json({ error: 'Administrator access required' });
    req.user.role = 'ADMIN';
    next();
  } catch (error) { next(error); }
}
