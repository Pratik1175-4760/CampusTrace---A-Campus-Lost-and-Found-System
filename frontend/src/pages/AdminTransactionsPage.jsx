import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, ArrowRight, Package, CheckSquare, HandshakeIcon, RefreshCw, AlertTriangle } from 'lucide-react'
import { adminAPI } from '../services/api.js'
import { formatDate, formatLocationLabel } from '../utils/helpers.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { RowSkeleton } from '../components/common/Skeleton.jsx'

const ACTION_CONFIG = {
  ITEM_REPORTED:  { icon: Package,       color: 'bg-amber-100 text-amber-700',  label: 'Item Reported'  },
  ADMIN_VERIFIED: { icon: CheckSquare,   color: 'bg-blue-100 text-blue-700',    label: 'Admin Verified' },
  ITEM_COLLECTED: { icon: HandshakeIcon, color: 'bg-green-100 text-green-700',  label: 'Item Collected' },
  STATUS_UPDATED: { icon: AlertTriangle, color: 'bg-slate-100 text-slate-600',  label: 'Status Updated' },
}

export default function AdminTransactionsPage() {
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const pages = Math.ceil(total / 30)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getTransactions({ page, limit: 30 })
      setLogs(data.data)
      setTotal(data.pagination.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 fade-in">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full audit trail — {total} events recorded
          </p>
        </div>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:border-blue-400 hover:text-blue-900 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {loading && Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}

        {!loading && logs.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No transactions recorded yet</p>
          </div>
        )}

        {!loading && logs.map(log => {
          const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.STATUS_UPDATED
          const Icon = cfg.icon
          const item = log.itemId

          return (
            <div key={log._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">

                {/* Action icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{cfg.label}</span>
                      {log.fromStatus && log.toStatus && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <StatusBadge status={log.fromStatus} />
                          <ArrowRight className="w-3 h-3" />
                          <StatusBadge status={log.toStatus} />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
                  </div>

                  {/* Performed by */}
                  <p className="text-xs text-slate-500 mt-1">
                    By: <span className="font-medium text-slate-700">{log.performedBy}</span>
                  </p>

                  {/* Item reference */}
                  {item && (
                    <div className="mt-3 flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700">{item.category}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {formatLocationLabel(item.location)}
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  )}

                  {/* Details */}
                  {log.action === 'ITEM_COLLECTED' && log.details && (
                    <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-100 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        ['Collector', log.details.name],
                        ['Roll No.',  log.details.rollNumber],
                        ['Branch',    log.details.branch],
                        ['Division',  log.details.division],
                        ['Contact',   log.details.contact],
                      ].map(([k, v]) => v && (
                        <div key={k}>
                          <span className="text-slate-400">{k}: </span>
                          <span className="font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {log.action === 'ITEM_REPORTED' && log.details && (
                    <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-slate-600 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400">Submission: </span>
                        <span className="font-medium">{log.details.submissionType?.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Category: </span>
                        <span className="font-medium">{log.details.category}</span>
                      </div>
                    </div>
                  )}

                  {log.note && (
                    <p className="mt-2 text-xs text-slate-500 italic">Note: {log.note}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 disabled:opacity-40 hover:border-blue-400 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 disabled:opacity-40 hover:border-blue-400 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
