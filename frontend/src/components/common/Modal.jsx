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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col scale-in`}
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.22), 0 8px 20px rgba(0,0,0,0.1)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 rounded-t-2xl"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          }}
        >
          <h2 className="text-base font-display font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            id="modal-close-btn"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
