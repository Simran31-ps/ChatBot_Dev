import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/store'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 left-3 z-10 p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-dark-300" />
          </button>
        )}
        {children}
      </main>
    </div>
  )
}
