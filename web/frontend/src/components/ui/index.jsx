import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function join(...parts) { return parts.filter(Boolean).join(' '); }

export function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, type = 'button', className, children, ...props }) {
  return <button type={type} className={join('cm-button', `cm-button--${variant}`, `cm-button--${size}`, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="cm-button__spinner" aria-hidden="true"/>}{children}
  </button>;
}

function Field({ as: Control = 'input', label, helperText, error, id, className, children, ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  return <div className="cm-field">
    {label && <label className="cm-field__label" htmlFor={fieldId}>{label}</label>}
    <Control id={fieldId} className={join('cm-control', className, error && 'is-invalid')} aria-invalid={error ? true : undefined}
      aria-describedby={[helperText && helperId, error && errorId, props['aria-describedby']].filter(Boolean).join(' ') || undefined} {...props}>{children}</Control>
    {helperText && <small className="cm-field__help" id={helperId}>{helperText}</small>}
    {error && <small className="cm-field__error" id={errorId}>{typeof error === 'string' ? error : error.message}</small>}
  </div>;
}

export function Input(props) { return <Field {...props}/>; }
export function Textarea(props) { return <Field as="textarea" {...props}/>; }
export function Select({ children, ...props }) { return <Field as="select" {...props}>{children}</Field>; }

export function Checkbox({ label, helperText, error, id, className, ...props }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  return <div className={join('cm-checkbox-field', className)}>
    <label className="cm-checkbox" htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={[helperText && helperId, error && errorId, props['aria-describedby']].filter(Boolean).join(' ') || undefined} {...props}/><span className="cm-checkbox__box" aria-hidden="true"/>
      <span>{label}</span>
    </label>
    {helperText && <small className="cm-field__help" id={helperId}>{helperText}</small>}{error && <small className="cm-field__error" id={errorId}>{typeof error === 'string' ? error : error.message}</small>}
  </div>;
}

export function Modal({ open, onClose, title, ariaLabel, children, className, closeOnOverlay = true, closeLabel = 'Đóng hộp thoại' }) {
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const first = dialog?.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    (first || dialog)?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') { event.stopPropagation(); onClose?.(); }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const firstItem = focusable[0]; const lastItem = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus(); }
      else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus(); }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previousFocus.current?.focus?.(); };
  }, [open, onClose]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(<div className="cm-modal-backdrop" onMouseDown={event => { if (closeOnOverlay && event.target === event.currentTarget) onClose?.(); }}>
    <section ref={dialogRef} className={join('cm-modal', className)} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : ariaLabel} tabIndex={-1}>
      <header className="cm-modal__header">{title && <h2 id={titleId}>{title}</h2>}<button type="button" className="cm-icon-button" onClick={onClose} aria-label={closeLabel}>×</button></header>
      <div className="cm-modal__body">{children}</div>
    </section>
  </div>, document.body);
}

export function Toast({ open = true, type = 'info', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!open || !duration || !onClose) return undefined;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [open, duration, onClose]);
  if (!open || !message) return null;
  const role = type === 'error' ? 'alert' : 'status';
  return <div className={`cm-toast cm-toast--${type}`} role={role} aria-live={type === 'error' ? 'assertive' : 'polite'}>
    <span>{message}</span>{onClose && <button type="button" onClick={onClose} aria-label="Đóng thông báo">×</button>}
  </div>;
}

export function Skeleton({ variant = 'text', width, height, className, count = 1, ...props }) {
  return <>{Array.from({ length: Math.max(1, count) }, (_, index) => <span key={index} className={join('cm-skeleton', `cm-skeleton--${variant}`, className)} style={{ width, height }} aria-hidden="true" {...props}/>)}</>;
}

export function Badge({ variant = 'neutral', children, className, ...props }) {
  return <span className={join('cm-badge', `cm-badge--${variant}`, className)} {...props}>{children}</span>;
}

export function Avatar({ src, name = '', alt, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('vi-VN') || '?';
  return <span role="img" className={join('cm-avatar', `cm-avatar--${size}`, className)} aria-label={alt || name || 'Ảnh đại diện'}>
    {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)}/> : <span aria-hidden="true">{initials}</span>}
  </span>;
}
