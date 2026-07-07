import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import type { Workspace } from '@/types'

export function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const loadWorkspaces = async () => {
    const data = await api.get<Workspace[]>('/workspaces')
    setWorkspaces(data)
  }

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/workspaces', { name, description: description || null })
    setName('')
    setDescription('')
    setShowCreate(false)
    loadWorkspaces()
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/workspaces/${id}`)
    loadWorkspaces()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-white">Workspaces</h1>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Workspace
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="bg-dark-800 rounded-xl p-4 mb-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name"
              required
              className="input-field w-full"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="input-field w-full"
            />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-dark-800 rounded-xl p-4 flex items-center justify-between hover:bg-dark-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <FolderOpen size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-dark-100">{ws.name}</p>
                  {ws.description && <p className="text-sm text-dark-400">{ws.description}</p>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(ws.id)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <Trash2 size={16} className="text-dark-400 hover:text-red-400" />
              </button>
            </div>
          ))}
          {workspaces.length === 0 && (
            <p className="text-center text-dark-400 py-8">No workspaces yet. Create one to organize your conversations.</p>
          )}
        </div>
      </div>
    </div>
  )
}
