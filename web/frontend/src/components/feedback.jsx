import { Button, Modal } from './ui/index.jsx';

export function EmptyState({ title, children, action, className = '' }) {
  return <section className={`state-message cm-empty-state ${className}`} role="status">
    {title && <h2>{title}</h2>}{children && <div>{children}</div>}{action && <div className="cm-empty-state__action">{action}</div>}
  </section>;
}

export function ErrorState({ error, title = 'Đã xảy ra lỗi', onRetry, className = '' }) {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  return <div className={`error-box cm-error-state ${className}`} role="alert"><strong>{title}</strong><span>{message}</span>{onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Thử lại</Button>}</div>;
}

export function LoadingSpinner({ label = 'Đang tải…', className = '' }) {
  return <div className={`state-message cm-loading-state ${className}`} role="status" aria-live="polite"><span className="cm-spinner" aria-hidden="true"/><span>{label}</span></div>;
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Xác nhận thao tác', children, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', busy = false, variant = 'danger' }) {
  return <Modal open={open} onClose={busy ? undefined : onClose} title={title} className="cm-confirm-dialog">
    <div className="cm-confirm-dialog__message">{children}</div>
    <div className="cm-confirm-dialog__actions"><Button variant="ghost" onClick={onClose} disabled={busy}>{cancelLabel}</Button><Button variant={variant} onClick={onConfirm} loading={busy}>{confirmLabel}</Button></div>
  </Modal>;
}

export function Pagination({ page, onPageChange, hasPrevious = page > 1, hasNext = false, className = '' }) {
  return <nav className={`pager cm-pagination ${className}`} aria-label="Phân trang">
    <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange?.(page - 1)}>← Trước</Button>
    <span aria-current="page">Trang {page}</span>
    <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange?.(page + 1)}>Tiếp →</Button>
  </nav>;
}
