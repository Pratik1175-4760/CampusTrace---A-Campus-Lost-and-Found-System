import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { itemsAPI } from '../../services/api.js'
import { BRANCHES, DIVISIONS } from '../../utils/constants.js'

export default function CollectForm({ itemId, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', rollNumber: '', division: '', branch: '', contact: '' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.rollNumber || !form.division || !form.branch || !form.contact) {
      toast.error('All fields are required')
      return
    }
    setLoading(true)
    try {
      await itemsAPI.collect(itemId, form)
      toast.success('Item collected successfully!')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to collect item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
      <h3 className="font-semibold text-slate-800 mb-4 text-sm">Fill your details to collect this item</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Pratik Yadav"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Roll Number *</label>
            <input
              type="text"
              value={form.rollNumber}
              onChange={e => set('rollNumber', e.target.value)}
              placeholder="e.g. 23110420"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Division *</label>
            <select
              value={form.division}
              onChange={e => set('division', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
              required
            >
              <option value="">Select division</option>
              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Branch *</label>
            <select
              value={form.branch}
              onChange={e => set('branch', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
              required
            >
              <option value="">Select branch</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number *</label>
            <input
              type="tel"
              value={form.contact}
              onChange={e => set('contact', e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? 'Submitting…' : 'Confirm Collection'}
          </button>
        </div>
      </form>
    </div>
  )
}
