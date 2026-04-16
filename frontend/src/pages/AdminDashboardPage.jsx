import { useEffect, useState } from 'react'
import { Package, CheckCircle, Clock, TrendingUp, Users, Layers } from 'lucide-react'
import { adminAPI } from '../services/api.js'
import { formatDate, formatLocationLabel } from '../utils/helpers.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { RowSkeleton } from '../components/common/Skeleton.jsx'

const STAT_CARDS = [
  {
    key: 'total',
    icon: Package,
    label: 'Total Items',
    sub: 'All time',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    glow: 'rgba(37,99,235,0.25)',
  },
  {
    key: 'reported',
    icon: Clock,
    label: 'Pending',
    sub: 'Awaiting review',
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
    glow: 'rgba(217,119,6,0.25)',
  },
  {
    key: 'verified',
    icon: CheckCircle,
    label: 'At Center',
    sub: 'Verified by admin',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #6366f1 100%)',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    key: 'collected',
    icon: TrendingUp,
    label: 'Collected',
    sub: 'Successfully returned',
    gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    glow: 'rgba(16,185,129,0.25)',
  },
  {
    key: 'withFinder',
    icon: Users,
    label: 'With Finder',
    sub: 'Finder retains item',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    key: 'atCenter',
    icon: Layers,
    label: 'Submitted',
    sub: 'Submitted to center',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    glow: 'rgba(71,85,105,0.25)',
  },
]

const StatCard = ({ icon: Icon, label, value, sub, gradient, glow, index }) => (
  <div
    className="rounded-2xl p-4 sm:p-5 fade-in relative overflow-hidden"
    style={{
      background: gradient,
      boxShadow: `0 8px 24px ${glow}, 0 2px 8px rgba(0,0,0,0.1)`,
      animationDelay: `${index * 60}ms`,
    }}
  >
    {/* Decorative circle */}
    <div
      className="absolute -right-4 -top-4 w-20 sm:w-24 h-20 sm:h-24 rounded-full pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.1)' }}
    />
    <div
      className="absolute -right-1 -top-1 w-10 sm:w-12 h-10 sm:h-12 rounded-full pointer-events-none"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    />

    <div className="relative">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider">{label}</span>
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      </div>
      <div className="text-3xl sm:text-4xl font-display font-bold text-white leading-none">{value ?? '—'}</div>
      {sub && <div className="text-[10px] sm:text-xs text-white/60 mt-1 sm:mt-1.5">{sub}</div>}
    </div>
  </div>
)

const CATEGORY_COLORS = [
  'linear-gradient(90deg, #1e3a8a, #3b82f6)',
  'linear-gradient(90deg, #065f46, #10b981)',
  'linear-gradient(90deg, #4c1d95, #7c3aed)',
  'linear-gradient(90deg, #92400e, #d97706)',
  'linear-gradient(90deg, #1e293b, #475569)',
]

export default function AdminDashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getItems({ limit: 8, page: 1 }),
        ])
        setStats(s.data.data)
        setRecent(r.data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const maxCategory = stats?.byCategory?.reduce((a, b) => a.count > b.count ? a : b, { count: 1 })?.count || 1

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 fade-in">

      {/* Page title */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Overview of Lost & Found activity at PICT</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard
            key={card.key}
            {...card}
            value={stats?.[card.key]}
            index={i}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Category breakdown */}
        {stats?.byCategory?.length > 0 && (
          <div
            className="xl:col-span-2 bg-white rounded-2xl p-4 sm:p-5"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(226,232,240,0.8)' }}
          >
            <h2 className="text-sm font-bold text-slate-700 mb-4 sm:mb-5">Items by Category</h2>
            <div className="space-y-3">
              {stats.byCategory.map((c, i) => {
                const pct = Math.round((c.count / maxCategory) * 100)
                return (
                  <div key={c._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">{c._id}</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{c.count}</span>
                    </div>
                    <div className="h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent items */}
        <div
          className="xl:col-span-3 bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(226,232,240,0.8)' }}
        >
          <div
            className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between"
          >
            <h2 className="text-sm font-bold text-slate-700">Recent Reports</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              Latest {recent.length}
            </span>
          </div>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
            : recent.map(item => (
              <div
                key={item._id}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors cursor-default"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover"
                    style={{ border: '2px solid rgba(226,232,240,1)' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{item.category}</div>
                  <div className="text-xs text-slate-400 truncate">{formatLocationLabel(item.location)}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StatusBadge status={item.status} />
                  <span className="text-[10px] sm:text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
