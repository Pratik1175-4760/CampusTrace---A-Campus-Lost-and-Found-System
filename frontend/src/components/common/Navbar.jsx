import { Link, useLocation } from 'react-router-dom'
import { MapPin, Home, MessageSquare, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const { pathname } = useLocation()

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
          <span className="opacity-90 tracking-wide">
            Pune Institute of Computer Technology, Pune
          </span>
          <span
            className="opacity-60 font-medium tracking-widest uppercase text-[10px]"
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
          <div className="flex items-center justify-between h-16">

            {/* Logo + Title */}
            <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
              >
                <MapPin className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-slate-900 text-base leading-tight tracking-tight">
                  Campus Trace
                </div>
                <div className="text-[11px] text-slate-400 leading-tight font-medium tracking-wide">
                  PICT Lost & Found Portal
                </div>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
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
          </div>
        </div>
      </div>
    </header>
  )
}
