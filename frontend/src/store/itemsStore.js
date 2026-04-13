import { create } from 'zustand'
import { itemsAPI } from '../services/api.js'

export const useItemsStore = create((set, get) => ({
  items: [],
  total: 0,
  pages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  filters: {
    category: 'all',
    area: 'all',
    seminarHall: '',
    status: 'all',
    dateFilter: 'all',
    startDate: '',
    endDate: '',
    search: '',
  },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value }, currentPage: 1 })),

  resetFilters: () =>
    set({
      filters: {
        category: 'all', area: 'all', seminarHall: '',
        status: 'all', dateFilter: 'all',
        startDate: '', endDate: '', search: '',
      },
      currentPage: 1,
    }),

  fetchItems: async (extraParams = {}) => {
    const { filters, currentPage } = get()
    set({ isLoading: true, error: null })
    try {
      const params = {}
      if (filters.category !== 'all')   params.category   = filters.category
      if (filters.area     !== 'all')   params.area       = filters.area
      if (filters.seminarHall)          params.seminarHall= filters.seminarHall
      if (filters.status   !== 'all')   params.status     = filters.status
      if (filters.dateFilter !== 'all') params.dateFilter = filters.dateFilter
      if (filters.startDate)            params.startDate  = filters.startDate
      if (filters.endDate)              params.endDate    = filters.endDate
      if (filters.search)               params.search     = filters.search
      params.page  = currentPage
      params.limit = 20

      const { data } = await itemsAPI.getAll({ ...params, ...extraParams })
      set({
        items: data.data,
        total: data.pagination.total,
        pages: data.pagination.pages,
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load items', isLoading: false })
    }
  },

  setPage: (page) => set({ currentPage: page }),
}))
