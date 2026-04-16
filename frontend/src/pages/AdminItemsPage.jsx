import { useEffect, useState, useCallback } from 'react'
import { Search, CheckSquare, Filter, Phone, Mail, User, Eye, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { adminAPI, itemsAPI } from '../services/api.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import Modal from '../components/common/Modal.jsx'
import { RowSkeleton } from '../components/common/Skeleton.jsx'
import { formatDate, formatLocationLabel } from '../utils/helpers.js'
import { SUBMISSION_LABELS } from '../utils/constants.js'

const TABS = [
  { value: 'all',                  label: 'All' },
  { value: 'reported',             label: 'Reported' },
  { value: 'verified',             label: 'At Center' },
  { value: 'collected',            label: 'Collected' },
  { value: '__with_finder',        label: 'With Finder' },
  { value: '__submitted_to_center',label: 'Submitted' },
]

export default function AdminItemsPage() {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('all')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [detail,  setDetail]  = useState(null)   // item for detail modal
  const [verifying, setVerifying] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (tab === '__with_finder')         params.submissionType = 'with_finder'
      else if (tab === '__submitted_to_center') params.submissionType = 'submitted_to_center'
      else if (tab !== 'all')              params.status = tab

      const { data } = await adminAPI.getItems(params)
      setItems(data.data)
      setTotal(data.pagination.total)
    } catch { toast.error('Failed to load items') }
    finally { setLoading(false) }
  }, [tab, page])

  useEffect(() => { load() }, [load])

  const handleVerify = async (item) => {
    setVerifying(item._id)
    try {
      await itemsAPI.verify(item._id)
      toast.success('Item verified — now marked as At Center')
      load()
      if (detail?._id === item._id) setDetail(null)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to verify')
    } finally {
      setVerifying(null)
    }
  }

  const filtered = search
    ? items.filter(i =>
        i.category.toLowerCase().includes(search.toLowerCase()) ||
        i.location?.area?.toLowerCase().includes(search.toLowerCase()) ||
        i.description?.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div className="p-4 sm:p-6 fade-in">
      <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">All Items</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{total} total items in system</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter items…"
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4 sm:mb-5 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1) }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0
              ${tab === t.value
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hidden md:block">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div />
          <div>Category / Desc</div>
          <div>Location</div>
          <div>Submission</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {loading && Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items match this filter</p>
          </div>
        )}

        {!loading && filtered.map(item => (
          <div
            key={item._id}
            className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors"
          >
            {/* Image */}
            <img
              src={item.imageUrl}
              alt={item.category}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
            />

            {/* Category */}
            <div>
              <div className="text-sm font-medium text-slate-800">{item.category}</div>
              {item.description && (
                <div className="text-xs text-slate-400 truncate max-w-[180px]">{item.description}</div>
              )}
            </div>

            {/* Location */}
            <div className="text-sm text-slate-600 truncate">
              {formatLocationLabel(item.location)}
            </div>

            {/* Submission */}
            <div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                {SUBMISSION_LABELS[item.submissionType]}
              </span>
              {item.submissionType === 'with_finder' && item.finderContact && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  {item.finderContact.type === 'phone'
                    ? <Phone className="w-3 h-3" />
                    : <Mail className="w-3 h-3" />
                  }
                  <span className="truncate">{item.finderContact.value}</span>
                </div>
              )}
            </div>

            {/* Status */}
            <StatusBadge status={item.status} />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDetail(item)}
                className="p-1.5 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>

              {item.submissionType === 'submitted_to_center' && item.status === 'reported' && (
                <button
                  onClick={() => handleVerify(item)}
                  disabled={verifying === item._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {verifying === item._id ? 'Verifying…' : 'Verify'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading && Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items match this filter</p>
          </div>
        )}

        {!loading && filtered.map(item => (
          <div
            key={item._id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4">
              <img
                src={item.imageUrl}
                alt={item.category}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{item.category}</div>
                    {item.description && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatLocationLabel(item.location)}</span>
                </div>

                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {SUBMISSION_LABELS[item.submissionType]}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                </div>

                {item.submissionType === 'with_finder' && item.finderContact && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                    {item.finderContact.type === 'phone'
                      ? <Phone className="w-3 h-3" />
                      : <Mail className="w-3 h-3" />
                    }
                    <span className="truncate">{item.finderContact.value}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setDetail(item)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>

              {item.submissionType === 'submitted_to_center' && item.status === 'reported' && (
                <button
                  onClick={() => handleVerify(item)}
                  disabled={verifying === item._id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  {verifying === item._id ? 'Verifying…' : 'Verify'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Item Details" size="lg">
        {detail && <AdminItemDetail item={detail} onVerify={handleVerify} onClose={() => { setDetail(null); load() }} />}
      </Modal>
    </div>
  )
}

/* ── Admin Item Detail ─────────────────────────────────────────────── */
function AdminItemDetail({ item, onVerify, onClose }) {
  const sections = [
    { label: 'Category',    value: item.category },
    { label: 'Location',    value: formatLocationLabel(item.location) },
    { label: 'Found Date',  value: formatDate(item.foundDate) },
    { label: 'Reported At', value: formatDate(item.createdAt) },
    { label: 'Submission',  value: SUBMISSION_LABELS[item.submissionType] },
  ]

  return (
    <div className="space-y-5">
      <img src={item.imageUrl} alt={item.category} className="w-full h-40 sm:h-52 object-contain rounded-xl bg-slate-100 border border-slate-200" />

      <div className="flex items-center gap-2">
        <StatusBadge status={item.status} size="md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-400 font-medium mb-0.5">{s.label}</div>
            <div className="text-sm text-slate-700 font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      {item.description && (
        <div>
          <div className="text-xs text-slate-400 font-medium mb-1">Description</div>
          <p className="text-sm text-slate-700">{item.description}</p>
        </div>
      )}

      {/* Finder contact */}
      {item.submissionType === 'with_finder' && item.finderContact && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-amber-700 mb-2 uppercase">Finder Contact</div>
          <div className="flex items-center gap-2">
            {item.finderContact.type === 'phone'
              ? <Phone className="w-4 h-4 text-amber-600" />
              : <Mail className="w-4 h-4 text-amber-600" />
            }
            <span className="text-slate-700 font-medium text-sm">{item.finderContact.value}</span>
          </div>
        </div>
      )}

      {/* Collector info */}
      {item.collectorInfo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-green-700 mb-2 uppercase">Collector Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
            {[
              ['Name',        item.collectorInfo.name],
              ['Roll No.',    item.collectorInfo.rollNumber],
              ['Branch',      item.collectorInfo.branch],
              ['Division',    item.collectorInfo.division],
              ['Contact',     item.collectorInfo.contact],
              ['Collected At',formatDate(item.collectorInfo.collectedAt)],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-xs text-slate-400">{k}</span>
                <div className="font-medium">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify button */}
      {item.submissionType === 'submitted_to_center' && item.status === 'reported' && (
        <button
          onClick={() => onVerify(item)}
          className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors"
        >
          ✓ Mark as Verified (Item at Center)
        </button>
      )}
    </div>
  )
}
