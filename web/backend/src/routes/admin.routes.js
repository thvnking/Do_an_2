import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { syncPopularMovies, importTmdbMovie } from '../services/movie-catalog.service.js';

export const adminRouter = Router();
adminRouter.use(requireAuth,requireAdmin);

adminRouter.get('/summary',async(_req,res,next)=>{
  try {
    const result=await pool.query(`SELECT (SELECT count(*) FROM users)::int AS users,(SELECT count(*) FROM movies)::int AS movies,(SELECT count(*) FROM blog_posts WHERE status='PENDING')::int AS pending_posts,(SELECT count(*) FROM blog_posts WHERE status='PUBLISHED')::int AS published_posts,(SELECT count(*) FROM reviews)::int AS reviews,(SELECT count(*) FROM blog_comments)::int AS comments`);
    res.json({data:result.rows[0]});
  }catch(error){next(error);}
});

adminRouter.get('/users',async(req,res,next)=>{
  try { const limit=Math.min(Math.max(Number(req.query.limit)||50,1),200);const result=await pool.query('SELECT user_id,username,email,full_name,role,created_at FROM users ORDER BY created_at DESC LIMIT $1',[limit]);res.json({data:result.rows}); }
  catch(error){next(error);}
});
adminRouter.patch('/users/:id/role',async(req,res,next)=>{
  try {
    const role=req.body.role;
    if(!['USER','ADMIN'].includes(role))return res.status(400).json({error:'role must be USER or ADMIN'});
    if(String(req.params.id)===String(req.user.userId)&&role!=='ADMIN')return res.status(400).json({error:'You cannot demote your own account'});
    const result=await pool.query('UPDATE users SET role=$1 WHERE user_id=$2 RETURNING user_id,username,email,role',[role,req.params.id]);
    if(!result.rowCount)return res.status(404).json({error:'User not found'});
    res.json({data:result.rows[0]});
  }catch(error){next(error);}
});

adminRouter.post('/movies',async(req,res,next)=>{
  try {
    const title=typeof req.body.title==='string'?req.body.title.trim():'';
    if(!title)return res.status(400).json({error:'title is required'});
    const result=await pool.query('INSERT INTO movies(title,vietnamese_title,synopsis,release_year,runtime_minutes,poster_url,banner_url,trailer_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING movie_id,title',[title,req.body.vietnameseTitle||null,req.body.synopsis||null,req.body.releaseYear||null,req.body.runtimeMinutes||null,req.body.posterUrl||null,req.body.bannerUrl||null,req.body.trailerUrl||null]);
    res.status(201).json({data:result.rows[0]});
  }catch(error){next(error);}
});
adminRouter.patch('/movies/:id',async(req,res,next)=>{
  try {
    const allowed={title:'title',vietnameseTitle:'vietnamese_title',synopsis:'synopsis',releaseYear:'release_year',runtimeMinutes:'runtime_minutes',posterUrl:'poster_url',bannerUrl:'banner_url',trailerUrl:'trailer_url'};
    const fields=Object.entries(allowed).filter(([key])=>Object.hasOwn(req.body,key));
    if(!fields.length)return res.status(400).json({error:'No editable fields supplied'});
    const values=fields.map(([key])=>req.body[key]);
    const sets=fields.map(([,column],index)=>`${column}=$${index+1}`);
    values.push(req.params.id);
    const result=await pool.query(`UPDATE movies SET ${sets.join(',')} WHERE movie_id=$${values.length} RETURNING movie_id,title`,values);
    if(!result.rowCount)return res.status(404).json({error:'Movie not found'});
    res.json({data:result.rows[0]});
  }catch(error){next(error);}
});
adminRouter.delete('/movies/:id',async(req,res,next)=>{
  try { const result=await pool.query('DELETE FROM movies WHERE movie_id=$1 RETURNING movie_id',[req.params.id]);if(!result.rowCount)return res.status(404).json({error:'Movie not found'});res.status(204).end(); }
  catch(error){next(error);}
});

adminRouter.get('/reviews',async(_req,res,next)=>{
  try {const result=await pool.query('SELECT r.review_id,r.rating,r.comment_text,r.created_at,u.username,m.title FROM reviews r JOIN users u USING(user_id) JOIN movies m USING(movie_id) ORDER BY r.created_at DESC LIMIT 200');res.json({data:result.rows});}
  catch(error){next(error);}
});

adminRouter.post('/sync-tmdb',async(req,res,next)=>{
  try {
    if(req.body.tmdbId){
      const tmdbId=Number(req.body.tmdbId);
      if(!Number.isSafeInteger(tmdbId)||tmdbId<1)return res.status(400).json({error:'Invalid TMDB id'});
      return res.json({data:await importTmdbMovie(tmdbId)});
    }
    const pages=Math.min(Math.max(Number(req.body.pages)||1,1),5);
    const data=await syncPopularMovies(pages);
    res.json({imported:data.length,data});
  }catch(error){next(error);}
});
