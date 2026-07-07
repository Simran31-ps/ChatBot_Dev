import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  FolderOpen,
  BookOpen,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { useChatStore, useAuthStore, useUIStore } from '@/store'
import clsx from 'clsx'

export function Sidebar() {
  const navigate = useNavigate()
  const { conversations, loadConversations, createConversation, selectConversation, deleteConversation, currentConversation } = useChatStore()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleNewChat = async () => {
    const conv = await createConversation()
    await selectConversation(conv.id)
    navigate('/')
  }

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id)
    navigate('/')
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteConversation(id)
  }

  if (!sidebarOpen) {
    return null
  }

  return (
    <aside className="w-72 h-screen bg-dark-950 border-r border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">OpenChat AI</h1>
        <button onClick={toggleSidebar} className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors">
          <ChevronLeft size={18} className="text-dark-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 border border-dark-600 rounded-lg
            hover:bg-dark-800 transition-colors text-dark-200 text-sm"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group text-sm',
                currentConversation?.id === conv.id
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
              )}
            >
              <MessageSquare size={14} className="shrink-0" />
              <span className="truncate flex-1">{conv.title}</span>
              {hoveredId === conv.id && (
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="p-1 hover:bg-dark-600 rounded transition-colors"
                >
                  <Trash2 size={12} className="text-dark-400 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-dark-700 p-2 space-y-0.5">
        <NavItem icon={FolderOpen} label="Workspaces" onClick={() => navigate('/workspaces')} />
        <NavItem icon={BookOpen} label="Prompts" onClick={() => navigate('/prompts')} />
        {user?.is_admin && (
          <NavItem icon={LayoutDashboard} label="Admin" onClick={() => navigate('/admin')} />
        )}
        <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
        <NavItem icon={LogOut} label="Logout" onClick={logout} />
      </div>

      {/* User */}
      <div className="p-3 border-t border-dark-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.username}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-dark-300
        hover:bg-dark-800 hover:text-dark-100 transition-colors text-sm"
    >
      <Icon size={16} />
      {label}
    </button>
  )
}
