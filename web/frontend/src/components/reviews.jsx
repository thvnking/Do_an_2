import { useId, useState } from 'react';
import { Avatar, Button, Textarea } from './ui/index.jsx';
import { Rating } from './movies.jsx';
import { Link } from 'react-router-dom';

export function RatingInput({ value = 0, onChange, max = 5, label = 'Chọn số sao', disabled = false, className = '' }) {
  const groupId = useId();
  const selected = Number(value) || 0;
  function onKeyDown(event) {
    let next = selected || 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(max, next + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, next - 1);
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = max;
    else return;
    event.preventDefault(); onChange?.(next); document.getElementById(`${groupId}-${next}`)?.focus();
  }
  return <div className={`cm-rating-input ${className}`} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
    {Array.from({ length: max }, (_, i) => { const rating = i + 1; return <button key={rating} id={`${groupId}-${rating}`} type="button" role="radio" aria-checked={selected === rating} aria-label={`${rating} sao`} disabled={disabled} tabIndex={selected === rating || (!selected && rating === 1) ? 0 : -1} onClick={() => onChange?.(rating)} className={rating <= selected ? 'is-selected' : ''}>★</button>; })}
  </div>;
}

export function ReviewCard({ author = 'Thành viên CineMind', avatar, rating, title, content = '', movieTitle, movieHref, createdAt, likes, comments, expanded = false, onExpand, className = '' }) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expanded || internalExpanded;
  const limited = !isExpanded && content.length > 360;
  const excerpt = limited ? `${content.slice(0, 360).trimEnd()}…` : content;
  function toggleExpanded() { if (onExpand) onExpand(!isExpanded); else setInternalExpanded(value => !value); }
  return <article className={`review cm-review-card ${className}`}>
    <div className="cm-review-card__author"><Avatar src={avatar} name={typeof author === 'string' ? author : author?.name} size="sm"/><div><strong>{typeof author === 'string' ? author : author?.name}</strong>{createdAt && <time dateTime={createdAt}>{new Date(createdAt).toLocaleDateString('vi-VN')}</time>}</div></div>
    <div className="cm-review-card__rating"><Rating value={rating} label="Điểm đánh giá" showValue/></div>
    {title && <h3>{title}</h3>}{movieTitle && <p className="cm-review-card__movie">{movieHref ? <Link to={movieHref}>{movieTitle}</Link> : movieTitle}</p>}
    {content && <p className="cm-review-card__content">{excerpt}</p>}
    {(limited || (isExpanded && content.length > 360)) && <button type="button" className="text-button" onClick={toggleExpanded}>{isExpanded ? 'Thu gọn' : 'Đọc tiếp'}</button>}
    {(likes !== undefined || comments !== undefined) && <div className="cm-review-card__counts">{likes !== undefined && <span>{likes} lượt thích</span>}{comments !== undefined && <span>{comments} bình luận</span>}</div>}
  </article>;
}

export function ReviewForm({ rating, onRatingChange, comment, onCommentChange, onSubmit, submitting = false, submitLabel = 'Gửi đánh giá', error, className = '' }) {
  return <form className={`stack-form cm-review-form ${className}`} onSubmit={onSubmit}>
    <fieldset className="cm-review-form__rating"><legend>Điểm số</legend><RatingInput value={rating} onChange={onRatingChange} disabled={submitting}/></fieldset>
    <label className="cm-field"><span className="cm-field__label">Nhận xét</span><Textarea maxLength={5000} value={comment} onChange={event => onCommentChange?.(event.target.value)} placeholder="Chia sẻ cảm nhận của bạn…" disabled={submitting}/></label>
    {error && <p className="cm-field__error" role="alert">{error.message || error}</p>}
    <Button type="submit" loading={submitting}>{submitLabel}</Button>
  </form>;
}

export function ReviewList({ items = [], emptyState = 'Chưa có đánh giá nào.', className = '' }) {
  if (!items.length) return <div className={`state-message ${className}`}>{emptyState}</div>;
  return <div className={`cm-review-list ${className}`}>{items.map((item, index) => <ReviewCard key={item.id ?? item.review_id ?? index} {...item}/>)}</div>;
}
