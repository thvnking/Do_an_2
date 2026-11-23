import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !process.env.JWT_SECRET) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT user_id,role FROM users WHERE user_id=$1',[payload.sub]);
    if(!result.rowCount)return res.status(401).json({ error: 'Account no longer exists' });
    req.user = { userId: result.rows[0].user_id, role: result.rows[0].role };
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}

export async function optionalAuth(req,res,next){
  const header=req.get('authorization')||'';
  if(!header.startsWith('Bearer ')||!process.env.JWT_SECRET)return next();
  try{
    const payload=jwt.verify(header.slice(7),process.env.JWT_SECRET);
    const result=await pool.query('SELECT user_id,role FROM users WHERE user_id=$1',[payload.sub]);
    if(result.rowCount)req.user={userId:result.rows[0].user_id,role:result.rows[0].role};
  }catch{}
  next();
}
