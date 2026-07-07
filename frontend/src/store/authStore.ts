import { create } from 'zustand'
import { api } from '@/services/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: () => {
    const token = localStorage.getItem('token')
    if (token) {
      api.setToken(token)
      set({ token })
      get().loadUser()
    } else {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const data = await api.post<{ access_token: string }>('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    api.setToken(data.access_token)
    set({ token: data.access_token })
    await get().loadUser()
  },

  register: async (email, username, password, fullName) => {
    await api.post('/auth/register', {
      email,
      username,
      password,
      full_name: fullName,
    })
    await get().login(email, password)
  },

  logout: () => {
    localStorage.removeItem('token')
    api.setToken(null)
    set({ user: null, token: null })
  },

  loadUser: async () => {
    try {
      const user = await api.get<User>('/auth/me')
      set({ user, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      api.setToken(null)
      set({ user: null, token: null, isLoading: false })
    }
  },
}))
