import { useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Upload, Sparkles, X, Phone, Mail, MapPin, Calendar, Tag, ChevronDown } from 'lucide-react'
import { itemsAPI, aiAPI } from '../../services/api.js'
import { imageToBase64, getMimeType } from '../../utils/helpers.js'
import {
  CATEGORY_OPTIONS, LOCATIONS, CLASSROOM_BLOCKS, SEMINAR_HALLS,
} from '../../utils/constants.js'

const INITIAL = {
  category: '',
  description: '',
  foundDate: '',
  submissionType: '',
  location: { area: '', block: '', classroomName: '', seminarHall: '' },
  finderContactType: 'phone',
  finderContactValue: '',
  shareContact: false,
}

export default function ReportForm({ onSuccess, onClose }) {
  const [form, setForm]       = useState(INITIAL)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  /* ── helpers ─────────────────────────────────── */
  const setField  = (k, v)    => setForm(p => ({ ...p, [k]: v }))
  const setLoc    = (k, v)    => setForm(p => ({ ...p, location: { ...p.location, [k]: v } }))

  /* ── image pick ──────────────────────────────── */
  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024)    { toast.error('Image must be under 5 MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    // Auto-trigger AI analysis
    await analyzeWithAI(file)
  }

  const onInputChange  = (e) => handleFile(e.target.files[0])
  const onDrop         = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver     = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave    = ()  => setDragOver(false)
  const removeImage    = ()  => { setImageFile(null); setImagePreview(null) }

  /* ── AI analysis ─────────────────────────────── */
  const analyzeWithAI = async (file) => {
    setAiLoading(true)
    try {
      const b64      = await imageToBase64(file)
      const mime     = getMimeType(file)
      const { data } = await aiAPI.analyzeImage(b64, mime)
      const result   = data.data
      if (result.category) setField('category', result.category)
      if (result.description) setField('description', result.description)
      toast.success(`AI detected: ${result.category} (${result.confidence} confidence)`, { icon: '✦' })
    } catch {
      toast('AI analysis unavailable — fill in manually', { icon: 'ℹ️' })
    } finally {
      setAiLoading(false)
    }
  }

  /* ── location change ─────────────────────────── */
  const handleAreaChange = (area) => {
    setForm(p => ({ ...p, location: { area, block: '', classroomName: '', seminarHall: '' } }))
  }

  /* ── submission ──────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageFile)                { toast.error('Please upload an image'); return }
    if (!form.category)            { toast.error('Please select a category'); return }
    if (!form.location.area)       { toast.error('Please select a location'); return }
    if (!form.foundDate)           { toast.error('Please enter the date found'); return }
    if (!form.submissionType)      { toast.error('Please select submission type'); return }

    if (form.location.area === 'Classroom' && !form.location.block) {
      toast.error('Please select a classroom block'); return
    }
    if (form.location.area === 'Seminar Hall' && !form.location.seminarHall) {
      toast.error('Please select the seminar hall'); return
    }
    if (form.submissionType === 'with_finder' && form.shareContact && !form.finderContactValue.trim()) {
      toast.error('Please enter your contact details'); return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('image', imageFile)
      fd.append('category', form.category)
      fd.append('description', form.description)
      fd.append('location', JSON.stringify(form.location))
      fd.append('foundDate', form.foundDate)
      fd.append('submissionType', form.submissionType)

      if (form.submissionType === 'with_finder' && form.shareContact && form.finderContactValue.trim()) {
        fd.append('finderContactType', form.finderContactType)
        fd.append('finderContactValue', form.finderContactValue.trim())
      }

      await itemsAPI.report(fd)
      toast.success('Item reported successfully! Thank you.')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report item')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── today's date max ───────────────────────── */
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Image Upload ─────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Item Photo <span className="text-red-500">*</span>
        </label>

        {!imagePreview ? (
          <div
            className={`upload-zone rounded-xl p-8 text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Click to upload or drag &amp; drop</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Max 5 MB</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                <Sparkles className="w-3.5 h-3.5" />
                AI will auto-fill details from your photo
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={imagePreview} alt="Preview" className="w-full h-56 object-contain bg-slate-100" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white border border-slate-200 rounded-full p-1.5 shadow hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            {aiLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-900 animate-pulse" />
                <span className="text-sm font-medium text-blue-900">AI analyzing image…</span>
              </div>
            )}
            {!aiLoading && (
              <button
                type="button"
                onClick={() => analyzeWithAI(imageFile)}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-blue-900 text-white text-xs px-3 py-1.5 rounded-full shadow hover:bg-blue-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Re-analyze
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Category ─────────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          <Tag className="w-4 h-4 inline mr-1.5 text-blue-900" />
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('category', opt.value)}
              className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center
                ${form.category === opt.value
                  ? 'border-blue-900 bg-blue-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Description ──────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Description
          {aiLoading && <span className="ml-2 text-xs text-blue-600 font-normal">AI filling…</span>}
        </label>
        <textarea
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Describe the item — color, brand, size, any identifiable features"
          rows={3}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
        />
      </div>

      {/* ── Location ─────────────────────────────── */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          <MapPin className="w-4 h-4 inline mr-1.5 text-blue-900" />
          Location Found <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            value={form.location.area}
            onChange={e => handleAreaChange(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white appearance-none pr-10"
          >
            <option value="">Select location area</option>
            {LOCATIONS.filter(l => l.value !== 'all').map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Classroom sub-fields */}
        {form.location.area === 'Classroom' && (
          <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-blue-200">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Block *</label>
              <div className="relative">
                <select
                  value={form.location.block}
                  onChange={e => setLoc('block', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white appearance-none pr-8"
                >
                  <option value="">Select block</option>
                  {CLASSROOM_BLOCKS.map(b => <option key={b} value={b}>Block {b}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Classroom Name</label>
              <input
                type="text"
                value={form.location.classroomName}
                onChange={e => setLoc('classroomName', e.target.value)}
                placeholder="e.g. F1-201"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        )}

        {/* Seminar Hall sub-field */}
        {form.location.area === 'Seminar Hall' && (
          <div className="pl-4 border-l-2 border-blue-200">
            <label className="block text-xs font-medium text-slate-500 mb-1">Which Seminar Hall? *</label>
            <div className="flex gap-2">
              {SEMINAR_HALLS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setLoc('seminarHall', s.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                    ${form.location.seminarHall === s.value
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  {s.value}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Date Found ───────────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1.5 text-blue-900" />
          Date Found <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.foundDate}
          onChange={e => setField('foundDate', e.target.value)}
          max={todayStr}
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        />
      </div>

      {/* ── Submission Type ───────────────────────── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          What will you do with the item? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* With Finder */}
          <button
            type="button"
            onClick={() => setField('submissionType', 'with_finder')}
            className={`p-4 rounded-xl border-2 text-left transition-all
              ${form.submissionType === 'with_finder'
                ? 'border-blue-900 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${form.submissionType === 'with_finder' ? 'border-blue-900' : 'border-slate-300'}`}>
                {form.submissionType === 'with_finder' && (
                  <div className="w-2 h-2 rounded-full bg-blue-900" />
                )}
              </div>
              <span className="font-semibold text-sm text-slate-800">Keep With Me</span>
            </div>
            <p className="text-xs text-slate-500 ml-6">I'll hold onto the item. Owner can contact me directly.</p>
          </button>

          {/* Submitted to Center */}
          <button
            type="button"
            onClick={() => setField('submissionType', 'submitted_to_center')}
            className={`p-4 rounded-xl border-2 text-left transition-all
              ${form.submissionType === 'submitted_to_center'
                ? 'border-blue-900 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${form.submissionType === 'submitted_to_center' ? 'border-blue-900' : 'border-slate-300'}`}>
                {form.submissionType === 'submitted_to_center' && (
                  <div className="w-2 h-2 rounded-full bg-blue-900" />
                )}
              </div>
              <span className="font-semibold text-sm text-slate-800">Submit to Center</span>
            </div>
            <p className="text-xs text-slate-500 ml-6">I'll drop it at the Lost &amp; Found Center. No personal info needed.</p>
          </button>
        </div>
      </div>

      {/* ── Finder Contact (conditional) ─────────── */}
      {form.submissionType === 'with_finder' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.shareContact}
              onChange={e => setField('shareContact', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-blue-900"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">
                Share my contact so the owner can reach me
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Your contact will be visible on the public listing. Only share if you're comfortable.
              </p>
            </div>
          </label>

          {form.shareContact && (
            <div className="space-y-3 pt-1">
              {/* Contact type toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setField('finderContactType', 'phone')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-all
                    ${form.finderContactType === 'phone'
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setField('finderContactType', 'email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-all
                    ${form.finderContactType === 'email'
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>

              <input
                type={form.finderContactType === 'phone' ? 'tel' : 'email'}
                value={form.finderContactValue}
                onChange={e => setField('finderContactValue', e.target.value)}
                placeholder={form.finderContactType === 'phone' ? '10-digit mobile number' : 'your@email.com'}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Submit ───────────────────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || aiLoading}
          className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
        >
          {submitting ? 'Submitting…' : 'Report Found Item'}
        </button>
      </div>
    </form>
  )
}
