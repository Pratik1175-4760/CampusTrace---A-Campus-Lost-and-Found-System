import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm:  'max-w-md',
    md:  'max-w-xl',
    lg:  'max-w-2xl',
    xl:  'max-w-4xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white w-full ${sizes[size]} flex flex-col scale-in
          rounded-t-3xl sm:rounded-2xl
          max-h-[92vh] sm:max-h-[90vh]`}
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.1)' }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center py-2 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 flex-shrink-0 sm:rounded-t-2xl"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          }}
        >
          <h2 className="text-sm sm:text-base font-display font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            id="modal-close-btn"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
