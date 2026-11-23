import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button } from './ui/index.jsx';

export function BlogAuthor({ name, avatar, href, subtitle, className = '' }) {
  const displayName = typeof name === 'string' && name.trim() ? name : 'CineMind';
  const content = <><Avatar src={avatar} name={displayName} size="sm"/><span><strong>{displayName}</strong>{subtitle && <small>{subtitle}</small>}</span></>;
  return href ? <Link className={`cm-blog-author ${className}`} to={href}>{content}</Link> : <span className={`cm-blog-author ${className}`}>{content}</span>;
}

export function BlogCard({ post, href, category = 'GÓC NHÌN', className = '' }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const cover = post?.cover_url || post?.coverUrl;
  useEffect(() => setCoverFailed(false), [cover]);
  if (!post) return null;
  const title = post.title || 'Bài viết điện ảnh';
  const destination = href || `/blogs/${post.slug || post.post_id || post.id}`;
  const published = post.created_at || post.publishedAt;
  const author = post.author || post.author_name || 'CineMind';
  return <article className={`post cm-blog-card ${className}`}>
    <Link to={destination} className="post-art cm-blog-card__art" aria-label={`Đọc bài viết: ${title}`} style={{ '--a': '#645b4f' }}>
      {cover && !coverFailed ? <img src={cover} alt="" loading="lazy" onError={() => setCoverFailed(true)}/> : <><span>TẠP CHÍ CINEMIND</span><b aria-hidden="true">{title[0]}</b></>}
    </Link>
    <div className="post-copy"><small>{post.movie_title || post.category || category}{published && ` · ${new Date(published).toLocaleDateString('vi-VN')}`}</small>
      <h3><Link to={destination}>{title}</Link></h3><p>{post.excerpt || (post.content || '').slice(0, 160)}</p>
      <div className="cm-blog-card__footer"><BlogAuthor name={author}/><span className="author-count">{post.like_count ?? post.likeCount ?? 0} lượt thích</span></div>
    </div>
  </article>;
}

export function LikeButton({ liked = false, count, onToggle, disabled = false, pending = false, label = 'Thích bài viết', className = '' }) {
  const buttonLabel = pending ? 'Đang xử lý…' : label;
  return <Button variant="outline" className={`cm-like-button ${className}`} aria-pressed={liked} aria-label={`${buttonLabel}${count !== undefined ? `, ${count} lượt thích` : ''}`} disabled={disabled || pending} loading={pending} onClick={onToggle}>
    <span aria-hidden="true">{liked ? '♥' : '♡'}</span>{buttonLabel}{count !== undefined && !pending && <> · {count}</>}
  </Button>;
}

export function CommentItem({ comment, onReply, depth = 0, className = '' }) {
  const name = typeof comment.author === 'string' ? comment.author : comment.author?.name;
  return <article className={`comment cm-comment-item ${className}`} style={{ '--cm-comment-depth': Math.min(depth, 4) }}>
    <div className="cm-comment-item__author"><Avatar src={comment.avatar} name={name} size="sm"/><strong>{name || 'Thành viên'}</strong>{comment.createdAt && <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</time>}</div>
    <p>{comment.content}</p>{onReply && <button type="button" className="text-button" onClick={() => onReply(comment)}>Trả lời</button>}
    {comment.replies?.length > 0 && <div className="cm-comment-item__replies">{comment.replies.map((reply, index) => <CommentItem key={reply.id ?? reply.comment_id ?? index} comment={reply} onReply={onReply} depth={depth + 1}/>)}</div>}
  </article>;
}

export function CommentThread({ comments = [], onReply, emptyState = 'Chưa có bình luận.', className = '' }) {
  if (!comments.length) return <div className={`state-message ${className}`}>{emptyState}</div>;
  return <div className={`cm-comment-thread ${className}`}>{comments.map((comment, index) => <CommentItem key={comment.id ?? comment.comment_id ?? index} comment={comment} onReply={onReply}/>)}</div>;
}
