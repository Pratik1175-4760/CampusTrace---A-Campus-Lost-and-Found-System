import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Home, MessageSquare, ShieldCheck, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/',         icon: Home,          label: 'Home'     },
    { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/admin',    icon: ShieldCheck,   label: 'Admin',   subtle: true },
  ]

  return (
    <header className="sticky top-0 z-40">
      {/* Gradient top bar */}
      <div
        style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)' }}
        className="text-white text-xs py-1.5"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="opacity-90 tracking-wide truncate">
            Pune Institute of Computer Technology, Pune
          </span>
          <span
            className="opacity-60 font-medium tracking-widest uppercase text-[10px] hidden sm:inline"
          >
            Autonomous Institute
          </span>
        </div>
      </div>

      {/* Main header — glass white */}
      <div
        className="glass-white shadow-sm border-b border-white/60"
        style={{ borderBottom: '1px solid rgba(226,232,240,0.8)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo + Title */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group" id="nav-logo">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
              >
                <MapPin className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                  Campus Trace
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 leading-tight font-medium tracking-wide">
                  PICT Lost & Found Portal
                </div>
              </div>
            </Link>

            {/* Desktop Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label, subtle }) => {
                const isActive = pathname === to || (to !== '/' && pathname.startsWith(to))
                return (
                  <Link
                    key={to}
                    to={to}
                    id={`nav-${label.toLowerCase()}`}
                    className={`
                      flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : subtle
                          ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 -mr-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              id="mobile-menu-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col scale-in"
            style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
                >
                  <MapPin className="text-white w-4 h-4" />
                </div>
                <span className="font-display font-bold text-slate-900 text-sm">Campus Trace</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navLinks.map(({ to, icon: Icon, label, subtle }) => {
                const isActive = pathname === to || (to !== '/' && pathname.startsWith(to))
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : subtle
                          ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-auto" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                PICT Lost & Found Portal
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
