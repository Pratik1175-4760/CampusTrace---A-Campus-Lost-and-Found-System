import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_STORAGE_KEY = 'admin_token' // Consistent token storage key

const api = axios.create({ baseURL: BASE })

// Attach JWT for admin routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
    }
    return Promise.reject(err)
  }
)

// ── Items ──────────────────────────────────────────────────────────────────
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  report: (formData) => api.post('/items/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  collect: (id, data) => api.post(`/items/${id}/collect`, data),
  verify: (id) => api.patch(`/items/${id}/verify`),
  updateStatus: (id, data) => api.patch(`/items/${id}/status`, data),
}

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminAPI = {
  login: (creds) => api.post('/admin/login', creds),
  getItems: (params) => api.get('/admin/items', { params }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getStats: () => api.get('/admin/stats'),
}

export const aiAPI = {
  // formData is a FormData object with field 'image' = the raw File
  analyzeImage: (formData) =>
    api.post('/ai/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  smartSearch: (query) => api.post('/ai/smart-search', { query }),
}

// ── Feedback ───────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  getById: (id) => api.get(`/feedback/${id}`),
  updateStatus: (id, data) => api.patch(`/feedback/${id}/status`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
  getStats: () => api.get('/feedback/stats/overview'),
}

export default api
