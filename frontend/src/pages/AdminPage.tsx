import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Users, MessageSquare, FileText, FolderOpen, Activity, Shield } from 'lucide-react'
import type { AdminStats, User } from '@/types'

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.get<AdminStats>('/admin/stats').then(setStats)
    api.get<User[]>('/admin/users').then(setUsers)
  }, [])

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    await api.patch(`/admin/users/${userId}`, { is_active: !isActive })
    const updated = await api.get<User[]>('/admin/users')
    setUsers(updated)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} className="text-primary-400" />
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.total_users} />
            <StatCard icon={Activity} label="Active Users" value={stats.active_users} />
            <StatCard icon={MessageSquare} label="Conversations" value={stats.total_conversations} />
            <StatCard icon={MessageSquare} label="Messages" value={stats.total_messages} />
            <StatCard icon={FileText} label="Documents" value={stats.total_documents} />
            <StatCard icon={FolderOpen} label="Workspaces" value={stats.total_workspaces} />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-dark-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-700">
            <h2 className="font-medium text-dark-100">Users</h2>
          </div>
          <div className="divide-y divide-dark-700">
            {users.map((user) => (
              <div key={user.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-100">{user.username}</p>
                  <p className="text-xs text-dark-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {user.is_admin && (
                    <span className="text-xs px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded-full">
                      Admin
                    </span>
                  )}
                  <button
                    onClick={() => toggleUserActive(user.id, user.is_active)}
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      user.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-primary-400" />
        <span className="text-xs text-dark-400">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
    </div>
  )
}
