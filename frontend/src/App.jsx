import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import FeedbackPage from './pages/FeedbackPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminItemsPage from './pages/AdminItemsPage.jsx'
import AdminTransactionsPage from './pages/AdminTransactionsPage.jsx'
import AdminFeedbackPage from './pages/AdminFeedbackPage.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import { useAdminStore } from './store/adminStore.js'

const ProtectedRoute = ({ children }) => {
  const { token } = useAdminStore()
  return token ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin protected */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="items" element={<AdminItemsPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
