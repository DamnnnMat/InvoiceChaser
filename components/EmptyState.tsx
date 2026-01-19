import './EmptyState.css'

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    </div>
  )
}
