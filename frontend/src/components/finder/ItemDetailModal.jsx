import { useState } from 'react'
import { MapPin, Calendar, Tag, Phone, Mail, Package, CheckCircle, Sparkles, User, ArrowRight } from 'lucide-react'
import Modal from '../common/Modal.jsx'
import StatusBadge from '../common/StatusBadge.jsx'
import CollectForm from './CollectForm.jsx'
import { formatDate, formatLocationLabel } from '../../utils/helpers.js'
import { SUBMISSION_LABELS } from '../../utils/constants.js'

const InfoRow = ({ icon: Icon, label, value, iconColor = '#2563eb' }) => (
  <div className="flex items-start gap-3 py-2.5 sm:py-3 border-b border-slate-100 last:border-0">
    <div
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: `${iconColor}18` }}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-xs sm:text-sm text-slate-800 font-semibold">{value}</div>
    </div>
  </div>
)

export default function ItemDetailModal({ item, onClose, onCollected }) {
  const [showCollectForm, setShowCollectForm] = useState(false)

  if (!item) return null

  const canCollect = item.submissionType === 'submitted_to_center' && item.status !== 'collected'

  return (
    <Modal isOpen={!!item} onClose={onClose} title="Found Item Details" size="lg">
      <div className="space-y-3 sm:space-y-4">

        {/* Image */}
        <div
          className="w-full rounded-xl overflow-hidden bg-slate-100"
          style={{ aspectRatio: '16/9' }}
        >
          <img
            src={item.imageUrl}
            alt={item.category}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Status + submission row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={item.status} size="md" />
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                color: '#475569',
                border: '1px solid #cbd5e1',
              }}
            >
              <Package className="w-3 h-3" />
              {SUBMISSION_LABELS[item.submissionType]}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{formatDate(item.createdAt)}</span>
        </div>

        {/* Info rows */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #e2e8f0' }}
        >
          <InfoRow icon={Tag}      label="Category"     value={item.category}                   iconColor="#2563eb" />
          <InfoRow icon={MapPin}   label="Location Found" value={formatLocationLabel(item.location)} iconColor="#7c3aed" />
          <InfoRow icon={Calendar} label="Date Found"   value={formatDate(item.foundDate)}      iconColor="#059669" />
        </div>

        {/* Description */}
        {item.description && (
          <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4" style={{ border: '1px solid #e2e8f0' }}>
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5 sm:mb-2">Description</div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* AI description */}
        {item.aiDescription && item.aiDescription !== item.description && (
          <div
            className="rounded-xl p-3.5 sm:p-4 space-y-2"
            style={{
              background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
              border: '1px solid #c7d2fe',
            }}
          >
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              AI Analysis
            </div>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{item.aiDescription}</p>
            {item.aiTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.aiTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: '#c7d2fe', color: '#3730a3' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Finder contact */}
        {item.submissionType === 'with_finder' && item.finderContact && (
          <div
            className="rounded-xl p-3.5 sm:p-4"
            style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid #fcd34d',
            }}
          >
            <div className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Contact Finder
            </div>
            <div className="flex items-center gap-2">
              {item.finderContact.type === 'phone'
                ? <Phone className="w-4 h-4 text-amber-600" />
                : <Mail  className="w-4 h-4 text-amber-600" />
              }
              <a
                href={item.finderContact.type === 'phone'
                  ? `tel:${item.finderContact.value}`
                  : `mailto:${item.finderContact.value}`}
                className="text-blue-700 hover:text-blue-900 font-semibold text-sm hover:underline"
              >
                {item.finderContact.value}
              </a>
            </div>
            <p className="text-xs text-amber-700/80 mt-2 sm:mt-2.5 leading-relaxed">
              This item is still with the finder — contact them directly to retrieve it.
            </p>
          </div>
        )}

        {/* Collected info */}
        {item.status === 'collected' && item.collectorInfo && (
          <div
            className="rounded-xl p-3.5 sm:p-4"
            style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '1px solid #6ee7b7',
            }}
          >
            <div className="flex items-center gap-2 text-green-800 font-bold text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Item has been collected
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              Collected by {item.collectorInfo.name} ({item.collectorInfo.rollNumber})
            </p>
          </div>
        )}

        {/* Collect button */}
        {canCollect && !showCollectForm && (
          <button
            id="collect-item-btn"
            onClick={() => setShowCollectForm(true)}
            className="w-full py-3 sm:py-3.5 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
              color: 'white',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
            }}
          >
            <CheckCircle className="w-4 h-4" />
            I Found My Item — Collect It
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Collect form inline */}
        {canCollect && showCollectForm && (
          <CollectForm
            itemId={item._id}
            onSuccess={() => { onCollected(); onClose() }}
            onCancel={() => setShowCollectForm(false)}
          />
        )}
      </div>
    </Modal>
  )
}
