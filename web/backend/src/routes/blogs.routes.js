import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

export const blogsRouter = Router();

blogsRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20,1),100);
    const page = Math.min(Math.max(Number(req.query.page) || 1,1),10000);
    const result = await pool.query(`SELECT b.post_id,b.title,b.slug,b.content,b.status,b.view_count,b.created_at,u.username AS author,m.title AS movie_title,
      (SELECT count(*) FROM blog_comments c WHERE c.post_id=b.post_id) AS comment_count,
      (SELECT count(*) FROM blog_likes l WHERE l.post_id=b.post_id) AS like_count
      FROM blog_posts b JOIN users u ON u.user_id=b.author_id LEFT JOIN movies m USING(movie_id)
      WHERE b.status='PUBLISHED' ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`, [limit,(page-1)*limit]);
    res.json({ page,limit,data:result.rows });
  } catch (error) { next(error); }
});

blogsRouter.get('/mine', requireAuth, async (req,res,next) => {
  try { const result=await pool.query('SELECT post_id,movie_id,title,slug,content,status,view_count,created_at FROM blog_posts WHERE author_id=$1 ORDER BY created_at DESC',[req.user.userId]); res.json({data:result.rows}); }
  catch(error){next(error);}
});

blogsRouter.get('/:id', async (req,res,next) => {
  const client=await pool.connect();
  try {
    const lookup=await client.query('SELECT post_id FROM blog_posts WHERE (slug=$1 OR post_id::text=$1) AND status=\'PUBLISHED\'',[req.params.id]);
    if(!lookup.rowCount) return res.status(404).json({error:'Blog post not found'});
    const id=lookup.rows[0].post_id;
    await client.query('UPDATE blog_posts SET view_count=view_count+1 WHERE post_id=$1',[id]);
    const post=await client.query(`SELECT b.post_id,b.title,b.slug,b.content,b.status,b.view_count,b.created_at,u.username AS author,m.movie_id,m.title AS movie_title,
      (SELECT count(*) FROM blog_likes WHERE post_id=b.post_id) AS like_count FROM blog_posts b JOIN users u ON u.user_id=b.author_id LEFT JOIN movies m USING(movie_id) WHERE b.post_id=$1`,[id]);
    const comments=await client.query(`SELECT c.comment_id,c.parent_comment_id,c.content,c.created_at,u.username AS author,u.avatar_url FROM blog_comments c JOIN users u USING(user_id) WHERE c.post_id=$1 ORDER BY c.created_at`,[id]);
    res.json({data:{...post.rows[0],comments:comments.rows}});
  } catch(error){next(error);} finally {client.release();}
});

blogsRouter.post('/', requireAuth, async (req,res,next) => {
  try {
    const title=typeof req.body.title==='string'?req.body.title.trim().slice(0,240):'';
    const content=typeof req.body.content==='string'?req.body.content.trim():'';
    if(title.length<5||content.length<30||content.length>50000) return res.status(400).json({error:'Title must be at least 5 characters; content must be 30–50000 characters'});
    const slugBase=title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,220)||'bai-viet';
    const slug=`${slugBase}-${Date.now().toString(36)}`;
    const movieId=req.body.movieId?Number(req.body.movieId):null;
    const result=await pool.query('INSERT INTO blog_posts(author_id,movie_id,title,slug,content) VALUES($1,$2,$3,$4,$5) RETURNING post_id,title,slug,status,created_at',[req.user.userId,movieId,title,slug,content]);
    res.status(201).json({data:result.rows[0]});
  } catch(error){if(error.code==='23503') return res.status(404).json({error:'Linked movie not found'}); next(error);}
});

blogsRouter.patch('/:id', requireAuth, async (req,res,next) => {
  try {
    const check=await pool.query('SELECT author_id,status FROM blog_posts WHERE post_id=$1',[req.params.id]);
    if(!check.rowCount) return res.status(404).json({error:'Blog post not found'});
    if(String(check.rows[0].author_id)!==String(req.user.userId)&&req.user.role!=='ADMIN') return res.status(403).json({error:'Not allowed'});
    const title=typeof req.body.title==='string'?req.body.title.trim().slice(0,240):null;
    const content=typeof req.body.content==='string'?req.body.content.trim():null;
    if(title!==null&&title.length<5||content!==null&&(content.length<30||content.length>50000)) return res.status(400).json({error:'Invalid title or content length'});
    const result=await pool.query(`UPDATE blog_posts SET title=COALESCE($1,title),content=COALESCE($2,content),status=CASE WHEN status='PUBLISHED' AND $3='USER' THEN 'PENDING'::post_status ELSE status END,updated_at=now() WHERE post_id=$4 RETURNING post_id,title,slug,status,updated_at`,[title,content,req.user.role,req.params.id]);
    res.json({data:result.rows[0]});
  } catch(error){next(error);}
});

blogsRouter.delete('/:id', requireAuth, async (req,res,next) => {
  try {
    const result=await pool.query('DELETE FROM blog_posts WHERE post_id=$1 AND (author_id=$2 OR $3::text=\'ADMIN\')',[req.params.id,req.user.userId,req.user.role]);
    if(!result.rowCount) return res.status(404).json({error:'Blog post not found or not allowed'});
    res.status(204).end();
  } catch(error){next(error);}
});

blogsRouter.post('/:id/comments', requireAuth, async (req,res,next) => {
  try {
    const content=typeof req.body.content==='string'?req.body.content.trim():'';
    const parentId=req.body.parentCommentId?Number(req.body.parentCommentId):null;
    if(content.length<1||content.length>3000) return res.status(400).json({error:'Comment must be 1–3000 characters'});
    if(parentId){const parent=await pool.query('SELECT comment_id FROM blog_comments WHERE comment_id=$1 AND post_id=$2',[parentId,req.params.id]);if(!parent.rowCount)return res.status(400).json({error:'Parent comment must belong to this post'});}
    const result=await pool.query('INSERT INTO blog_comments(post_id,user_id,parent_comment_id,content) SELECT post_id,$2,$3,$4 FROM blog_posts WHERE post_id=$1 AND status=\'PUBLISHED\' RETURNING comment_id,parent_comment_id,content,created_at',[req.params.id,req.user.userId,parentId,content]);
    if(!result.rowCount)return res.status(404).json({error:'Blog post not found'});
    res.status(201).json({data:result.rows[0]});
  } catch(error){next(error);}
});

blogsRouter.delete('/comments/:commentId', requireAuth, async (req,res,next) => {
  try {
    const result=await pool.query(`DELETE FROM blog_comments c WHERE c.comment_id=$1 AND (c.user_id=$2 OR $3::text='ADMIN') RETURNING c.comment_id`,[req.params.commentId,req.user.userId,req.user.role]);
    if(!result.rowCount)return res.status(404).json({error:'Comment not found or not allowed'});
    res.status(204).end();
  } catch(error){next(error);}
});

blogsRouter.put('/:id/like', requireAuth, async (req,res,next) => {
  try {
    const result=await pool.query(`INSERT INTO blog_likes(post_id,user_id) SELECT post_id,$2 FROM blog_posts WHERE post_id=$1 AND status='PUBLISHED' ON CONFLICT DO NOTHING RETURNING post_id`,[req.params.id,req.user.userId]);
    const exists=await pool.query("SELECT 1 FROM blog_posts WHERE post_id=$1 AND status='PUBLISHED'",[req.params.id]);
    if(!exists.rowCount)return res.status(404).json({error:'Blog post not found'});
    res.json({liked:true,changed:result.rowCount>0});
  } catch(error){next(error);}
});
blogsRouter.delete('/:id/like', requireAuth, async (req,res,next) => {
  try { await pool.query('DELETE FROM blog_likes WHERE post_id=$1 AND user_id=$2',[req.params.id,req.user.userId]); res.json({liked:false}); }
  catch(error){next(error);}
});

blogsRouter.get('/admin/queue', requireAuth, requireAdmin, async (req,res,next) => {
  try { const status=['PENDING','PUBLISHED','REJECTED'].includes(req.query.status)?req.query.status:'PENDING';const result=await pool.query('SELECT b.post_id,b.title,b.content,b.status,b.created_at,u.username AS author FROM blog_posts b JOIN users u ON u.user_id=b.author_id WHERE b.status=$1 ORDER BY b.created_at',[status]);res.json({data:result.rows}); }
  catch(error){next(error);}
});
blogsRouter.patch('/admin/:id/moderation', requireAuth, requireAdmin, async (req,res,next) => {
  try {
    const status=req.body.action==='approve'?'PUBLISHED':req.body.action==='reject'?'REJECTED':null;
    if(!status)return res.status(400).json({error:'action must be approve or reject'});
    const result=await pool.query('UPDATE blog_posts SET status=$1,moderated_at=now(),moderated_by=$2,updated_at=now() WHERE post_id=$3 RETURNING post_id,status',[status,req.user.userId,req.params.id]);
    if(!result.rowCount)return res.status(404).json({error:'Blog post not found'});
    res.json({data:result.rows[0]});
  } catch(error){next(error);}
});
