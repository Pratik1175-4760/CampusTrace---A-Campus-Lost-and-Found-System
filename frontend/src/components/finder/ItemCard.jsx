import { MapPin, Clock, Package } from 'lucide-react'
import StatusBadge from '../common/StatusBadge.jsx'
import { formatDate, formatLocationLabel, truncate } from '../../utils/helpers.js'
import { SUBMISSION_LABELS } from '../../utils/constants.js'

const CATEGORY_ICONS = {
  'ID Card':    '🪪',
  'Bottle':     '🍶',
  'Calculator': '🖩',
  'Accessory':  '⌚',
  'Other':      '📦',
}

const CATEGORY_GRADIENTS = {
  'ID Card':    'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  'Bottle':     'linear-gradient(135deg, #065f46, #10b981)',
  'Calculator': 'linear-gradient(135deg, #4c1d95, #7c3aed)',
  'Accessory':  'linear-gradient(135deg, #92400e, #d97706)',
  'Other':      'linear-gradient(135deg, #1e293b, #475569)',
}

export default function ItemCard({ item, onClick }) {
  const gradient = CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS['Other']

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden cursor-pointer card-hover group"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      onClick={() => onClick(item)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.category}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category pill top-left */}
        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center gap-1 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md"
            style={{ background: gradient }}
          >
            <span className="text-[10px]">{CATEGORY_ICONS[item.category] || '📦'}</span>
            {item.category}
          </span>
        </div>

        {/* Status top-right */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 space-y-1.5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
          <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
          <span className="truncate">{formatLocationLabel(item.location)}</span>
        </div>

        {/* Time reported */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{formatDate(item.createdAt)}</span>
        </div>

        {/* Submission type */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Package className="w-3 h-3 flex-shrink-0" />
          <span>{SUBMISSION_LABELS[item.submissionType]}</span>
        </div>

        {/* Description if any */}
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-2 pt-0.5 leading-relaxed">
            {truncate(item.description, 70)}
          </p>
        )}
      </div>
    </div>
  )
}
