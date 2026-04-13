import { useState, useRef } from 'react'
import { Search, Sparkles, X, ChevronDown, Filter } from 'lucide-react'
import { useItemsStore } from '../../store/itemsStore.js'
import { aiAPI } from '../../services/api.js'
import { toast } from 'react-hot-toast'
import {
  CATEGORIES, LOCATIONS, SEMINAR_HALLS, DATE_FILTERS,
} from '../../utils/constants.js'

export default function FilterBar() {
  const { filters, setFilter, resetFilters, fetchItems } = useItemsStore()
  const [aiQuery, setAiQuery]     = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showDate, setShowDate]   = useState(false)
  const inputRef = useRef()

  /* ── AI smart search ─────────────────────────────────── */
  const handleSmartSearch = async (e) => {
    e.preventDefault()
    if (!aiQuery.trim()) return
    setAiLoading(true)
    try {
      const { data } = await aiAPI.smartSearch(aiQuery.trim())
      const result   = data.data
      if (result.category) setFilter('category', result.category)
      if (result.area)     setFilter('area', result.area)
      if (result.dateHint) setFilter('dateFilter', result.dateHint)
      if (result.keywords?.length) setFilter('search', result.keywords.join(' '))
      toast.success('Smart filters applied!', { icon: '✦' })
      await fetchItems()
    } catch {
      // Fallback to plain text search
      setFilter('search', aiQuery.trim())
      await fetchItems()
    } finally {
      setAiLoading(false)
    }
  }

  const clearSearch = () => {
    setAiQuery('')
    setFilter('search', '')
    fetchItems()
  }

  const applyFilter = (key, val) => {
    setFilter(key, val)
    // Reset seminar hall when area changes
    if (key === 'area' && val !== 'Seminar Hall') setFilter('seminarHall', '')
  }

  const handleReset = () => {
    setAiQuery('')
    resetFilters()
    fetchItems()
  }

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.area !== 'all' ||
    filters.dateFilter !== 'all' ||
    filters.search !== ''

  return (
    <div className="space-y-4">

      {/* ── AI Smart Search ──────────────────────────── */}
      <form onSubmit={handleSmartSearch} className="relative">
        <div className="flex items-center gap-2 border border-slate-300 rounded-xl bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-blue-900 focus-within:border-transparent transition-all">
          {aiLoading
            ? <Sparkles className="w-4 h-4 text-blue-900 animate-pulse flex-shrink-0" />
            : <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            placeholder="Search… e.g. 'blue bottle found near library today'"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          />
          {aiQuery && (
            <button type="button" onClick={clearSearch} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiLoading ? 'Searching…' : 'AI Search'}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1 ml-1">
          Use natural language — AI will extract filters automatically
        </p>
      </form>

      {/* ── Filter chips row ─────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full border border-red-200 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* ── Category ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => { applyFilter('category', c.value); fetchItems() }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filters.category === c.value
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Location ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map(l => (
            <button
              key={l.value}
              onClick={() => { applyFilter('area', l.value); fetchItems() }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filters.area === l.value
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Seminar Hall sub-filter */}
        {filters.area === 'Seminar Hall' && (
          <div className="flex gap-2 mt-2 pl-3 border-l-2 border-blue-200">
            {SEMINAR_HALLS.map(s => (
              <button
                key={s.value}
                onClick={() => { setFilter('seminarHall', s.value); fetchItems() }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                  ${filters.seminarHall === s.value
                    ? 'bg-blue-800 text-white border-blue-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Date ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date Found</p>
        <div className="flex flex-wrap gap-2">
          {DATE_FILTERS.filter(d => d.value !== 'custom').map(d => (
            <button
              key={d.value}
              onClick={() => { applyFilter('dateFilter', d.value); fetchItems() }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filters.dateFilter === d.value
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
            >
              {d.label}
            </button>
          ))}
          <button
            onClick={() => setShowDate(p => !p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1
              ${filters.dateFilter === 'custom'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
          >
            Custom Range
            <ChevronDown className={`w-3 h-3 transition-transform ${showDate ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Custom date range */}
        {showDate && (
          <div className="flex gap-2 mt-2 items-end flex-wrap">
            <div>
              <label className="block text-xs text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilter('startDate', e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilter('endDate', e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <button
              onClick={() => { setFilter('dateFilter', 'custom'); fetchItems() }}
              className="px-4 py-2 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
