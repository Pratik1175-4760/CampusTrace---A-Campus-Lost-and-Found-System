const STATUS_CONFIG = {
  reported: {
    label: 'Reported',
    dot: '#f59e0b',
    style: {
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      color: '#92400e',
      border: '1px solid #fcd34d',
    },
  },
  verified: {
    label: 'At Center',
    dot: '#3b82f6',
    style: {
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      color: '#1e40af',
      border: '1px solid #93c5fd',
    },
  },
  collected: {
    label: 'Collected',
    dot: '#10b981',
    style: {
      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      color: '#065f46',
      border: '1px solid #6ee7b7',
    },
  },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.reported
  const sz  = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1.5'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sz}`}
      style={cfg.style}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }}
      />
      {cfg.label}
    </span>
  )
}
