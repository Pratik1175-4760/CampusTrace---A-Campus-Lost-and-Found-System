import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { adminAPI } from '../services/api.js'

// Standard token key for consistency across application
const TOKEN_STORAGE_KEY = 'admin_token'

export const useAdminStore = create(
  persist(
    (set) => ({
      token: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { data } = await adminAPI.login({ username, password })
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
          set({ token: data.token, isLoading: false })
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        set({ token: null })
      },
    }),
    { name: 'admin-auth', partialize: (s) => ({ token: s.token }) }
  )
)

export { TOKEN_STORAGE_KEY }
