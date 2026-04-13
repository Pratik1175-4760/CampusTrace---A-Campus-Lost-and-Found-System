import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ClipboardList, MessageSquare, LogOut, MapPin, Menu, X, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAdminStore } from '../../store/adminStore.js'
import { toast } from 'react-hot-toast'

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/items',        icon: Package,         label: 'All Items'             },
  { to: '/admin/transactions', icon: ClipboardList,   label: 'Transactions'          },
  { to: '/admin/feedback',     icon: MessageSquare,   label: 'Feedback'              },
]

export default function AdminLayout() {
  const { logout }      = useAdminStore()
  const navigate        = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className="px-5 py-5 flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">
              L&F Admin
            </div>
            <div className="text-xs text-blue-300 leading-tight">PICT Campus</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 bg-white">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }
              : {}}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
                  style={isActive ? { color: 'white' } : {}}
                />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 bg-white border-t border-slate-100">
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Desktop sidebar */}
      <aside
        className="w-60 hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
        style={{ boxShadow: '2px 0 16px rgba(0,0,0,0.08)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-60 flex flex-col overflow-hidden slide-up"
            style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar */}
        <div
          className="lg:hidden border-b border-slate-200 px-4 h-14 flex items-center gap-3"
          style={{ background: 'linear-gradient(90deg, #0f172a, #1e3a8a)' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-white text-sm">L&F Admin — PICT</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
