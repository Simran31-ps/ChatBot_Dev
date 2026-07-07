import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeWorkspaceId: string | null
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveWorkspace: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeWorkspaceId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
}))
