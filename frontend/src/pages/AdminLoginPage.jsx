import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../store/adminStore.js'

export default function AdminLoginPage() {
  const navigate                       = useNavigate()
  const { login, isLoading, token }    = useAdminStore()
  const [form, setForm]                = useState({ username: '', password: '' })
  const [showPwd, setShowPwd]          = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    if (token) navigate('/admin', { replace: true })
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Enter username and password'); return }
    const res = await login(form.username, form.password)
    if (res.success) {
      toast.success('Welcome back, Admin!')
      navigate('/admin', { replace: true })
    } else {
      toast.error(res.message || 'Invalid credentials')
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col noise"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }}
      />
      <div
        className="fixed -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }}
      />

      {/* Top bar */}
      <div className="relative bg-black/20 text-white/70 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>Pune Institute of Computer Technology, Pune</span>
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Portal
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div
            className="rounded-3xl p-8 scale-in"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center float"
                style={{
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
                }}
              >
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-white text-center mb-1 tracking-tight">
              Admin Login
            </h1>
            <p className="text-sm text-blue-200 text-center mb-7">
              Access the Lost & Found management panel
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 w-4 h-4"
                    style={{ color: focusedField === 'username' ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}
                  />
                  <input
                    id="admin-username"
                    type="text"
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: focusedField === 'username'
                        ? '1.5px solid rgba(96,165,250,0.8)'
                        : '1.5px solid rgba(255,255,255,0.15)',
                      boxShadow: focusedField === 'username' ? '0 0 12px rgba(96,165,250,0.2)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 w-4 h-4"
                    style={{ color: focusedField === 'password' ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}
                  />
                  <input
                    id="admin-password"
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder:text-white/30 transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: focusedField === 'password'
                        ? '1.5px solid rgba(96,165,250,0.8)'
                        : '1.5px solid rgba(255,255,255,0.15)',
                      boxShadow: focusedField === 'password' ? '0 0 12px rgba(96,165,250,0.2)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: isLoading
                    ? 'rgba(255,255,255,0.15)'
                    : 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  color: '#1e3a8a',
                  boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-blue-300/60 mt-5">
            PICT Lost & Found — Admin Portal
          </p>
        </div>
      </div>
    </div>
  )
}
