import Navbar from '../components/common/Navbar.jsx'
import FeedbackForm from '../components/common/FeedbackForm'

const FeedbackPage = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      {/* Hero strip */}
      <div
        className="relative overflow-hidden noise"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
          paddingTop: '2.5rem',
          paddingBottom: '4rem',
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
            Share Your Feedback
          </h1>
          <p className="text-blue-200 text-base max-w-md mx-auto">
            Help us make Campus Trace better. Your thoughts, suggestions, and bug reports are always welcome.
          </p>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-10 block">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="rgb(241,245,249)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <FeedbackForm />
      </div>
    </div>
  )
}

export default FeedbackPage
