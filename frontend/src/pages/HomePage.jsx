import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, PackageOpen, RefreshCw, Sparkles, Package, Clock, CheckCircle } from 'lucide-react'
import Navbar from '../components/common/Navbar.jsx'
import FilterBar from '../components/finder/FilterBar.jsx'
import ItemCard from '../components/finder/ItemCard.jsx'
import ItemDetailModal from '../components/finder/ItemDetailModal.jsx'
import ReportForm from '../components/finder/ReportForm.jsx'
import Modal from '../components/common/Modal.jsx'
import { GridSkeleton } from '../components/common/Skeleton.jsx'
import { useItemsStore } from '../store/itemsStore.js'

const StatPill = ({ icon: Icon, label, value, gradient, delay = 0 }) => (
  <div
    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3.5 fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: gradient }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <div className="text-2xl font-display font-bold text-white leading-none">{value}</div>
      <div className="text-xs text-blue-200 font-medium mt-0.5">{label}</div>
    </div>
  </div>
)

export default function HomePage() {
  const {
    items, total, pages, currentPage,
    isLoading, error,
    filters, setFilter, fetchItems, setPage,
  } = useItemsStore()

  const [activeTab,    setActiveTab]    = useState('active')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showReport,   setShowReport]   = useState(false)

  const load = useCallback(() => {
    if (activeTab === 'active') {
      setFilter('status', 'all')
    } else {
      setFilter('status', 'collected')
    }
  }, [activeTab, setFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetchItems(activeTab === 'active' ? { statusNot: 'collected' } : {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.area, filters.seminarHall,
      filters.dateFilter, filters.startDate, filters.endDate, filters.search,
      currentPage])

  const displayItems = activeTab === 'active'
    ? items.filter(i => i.status !== 'collected')
    : items

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleReportSuccess = () => {
    setShowReport(false)
    fetchItems()
  }

  const handleCollected = () => {
    setSelectedItem(null)
    fetchItems()
  }

  const pendingCount   = items.filter(i => i.status === 'reported').length
  const verifiedCount  = items.filter(i => i.status === 'verified').length
  const collectedCount = items.filter(i => i.status === 'collected').length

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────── */}
      <div
        className="relative overflow-hidden noise"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #1d4ed8 100%)',
          minHeight: '260px',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

            {/* Left — title & subtitle */}
            <div className="fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                AI-Powered Search Available
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
                Lost & Found
              </h1>
              <p className="text-blue-200 text-base mt-2 max-w-md leading-relaxed">
                Browse items found across PICT campus — click any card for full details and collection information.
              </p>

              <button
                id="report-item-btn"
                onClick={() => setShowReport(true)}
                className="mt-6 inline-flex items-center gap-2.5 font-semibold text-sm px-6 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  color: '#1e3a8a',
                }}
              >
                <Plus className="w-4 h-4" />
                Report Found Item
              </button>
            </div>

            {/* Right — stat pills */}
            <div className="flex flex-wrap gap-3">
              <StatPill
                icon={Package}
                label="Total Items"
                value={total}
                gradient="linear-gradient(135deg, #1e40af, #3b82f6)"
                delay={0}
              />
              <StatPill
                icon={Clock}
                label="Pending"
                value={pendingCount}
                gradient="linear-gradient(135deg, #92400e, #d97706)"
                delay={80}
              />
              <StatPill
                icon={CheckCircle}
                label="Collected"
                value={collectedCount}
                gradient="linear-gradient(135deg, #065f46, #10b981)"
                delay={160}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="rgb(241,245,249)" />
          </svg>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── Filters sidebar ──────────────────────── */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sticky top-24 shadow-sm"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <FilterBar />
            </div>
          </aside>

          {/* ── Items grid ────────────────────────────── */}
          <main className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button
                  id="tab-active"
                  onClick={() => handleTabChange('active')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === 'active'
                      ? 'text-white font-semibold shadow-md'
                      : 'text-slate-500 hover:text-slate-700'}`}
                  style={activeTab === 'active'
                    ? { background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }
                    : {}}
                >
                  Active Items
                </button>
                <button
                  id="tab-collected"
                  onClick={() => handleTabChange('collected')}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === 'collected'
                      ? 'text-white font-semibold shadow-md'
                      : 'text-slate-500 hover:text-slate-700'}`}
                  style={activeTab === 'collected'
                    ? { background: 'linear-gradient(135deg, #065f46, #10b981)' }
                    : {}}
                >
                  Collected
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 font-medium">
                  {total} item{total !== 1 ? 's' : ''}
                </span>
                <button
                  id="refresh-btn"
                  onClick={() => fetchItems()}
                  className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && <GridSkeleton count={8} />}

            {/* Empty */}
            {!isLoading && displayItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}
                >
                  <PackageOpen className="w-9 h-9 text-slate-400" />
                </div>
                <h3 className="text-slate-700 font-semibold text-lg mb-1">No items found</h3>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                  {activeTab === 'active'
                    ? 'No active lost items match your filters. Try adjusting your search.'
                    : 'No items have been collected yet.'}
                </p>
                <button
                  onClick={() => setShowReport(true)}
                  className="mt-5 inline-flex items-center gap-2 text-sm text-blue-700 font-semibold hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Found something? Report it
                </button>
              </div>
            )}

            {/* Grid */}
            {!isLoading && displayItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 fade-in">
                {displayItems.map(item => (
                  <ItemCard key={item._id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage(currentPage - 1); fetchItems() }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  ← Previous
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 py-2 text-slate-400">…</span>
                      )}
                      <button
                        onClick={() => { setPage(p); fetchItems() }}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200
                          ${currentPage === p
                            ? 'text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'}`}
                        style={currentPage === p
                          ? { background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }
                          : {}}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => { setPage(currentPage + 1); fetchItems() }}
                  disabled={currentPage === pages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 disabled:opacity-40 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Report Modal ─────────────────────────────── */}
      <Modal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        title="Report a Found Item"
        size="lg"
      >
        <ReportForm
          onSuccess={handleReportSuccess}
          onClose={() => setShowReport(false)}
        />
      </Modal>

      {/* ── Item Detail Modal ─────────────────────────── */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCollected={handleCollected}
        />
      )}
    </div>
  )
}
