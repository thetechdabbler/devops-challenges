import { create } from 'zustand'
import { fetchMe, logout as logoutApi, User } from '../api/auth.api'

interface AuthState {
  user: User | null
  loading: boolean
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchMe: async () => {
    try {
      const user = await fetchMe()
      set({ user, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },
  logout: async () => {
    await logoutApi()
    set({ user: null })
  },
}))
