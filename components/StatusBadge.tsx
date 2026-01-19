import './StatusBadge.css'

export default function StatusBadge({ status }: { status: 'upcoming' | 'overdue' | 'paid' }) {
  const colors = {
    upcoming: '#f59e0b',
    overdue: '#ef4444',
    paid: '#10b981',
  }

  const labels = {
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    paid: 'Paid',
  }

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: colors[status] }}
    >
      {labels[status]}
    </span>
  )
}
