import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { BookOpen, Plus, Trash2, Copy } from 'lucide-react'
import type { Prompt } from '@/types'

export function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  const loadPrompts = async () => {
    const data = await api.get<Prompt[]>('/prompts')
    setPrompts(data)
  }

  useEffect(() => {
    loadPrompts()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/prompts', { title, content, category, is_public: true })
    setTitle('')
    setContent('')
    setCategory('general')
    setShowCreate(false)
    loadPrompts()
  }

  const handleDelete = async (id: string) => {
    await api.delete(`/prompts/${id}`)
    loadPrompts()
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-white">Prompt Library</h1>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Prompt
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="bg-dark-800 rounded-xl p-4 mb-6 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt title"
              required
              className="input-field w-full"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Prompt content..."
              required
              rows={4}
              className="input-field w-full resize-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              <option value="general">General</option>
              <option value="coding">Coding</option>
              <option value="writing">Writing</option>
              <option value="analysis">Analysis</option>
              <option value="creative">Creative</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-primary-400" />
                  <h3 className="font-medium text-dark-100">{prompt.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-dark-700 rounded-full text-dark-400">
                    {prompt.category}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleCopy(prompt.content)} className="p-1.5 hover:bg-dark-700 rounded-lg">
                    <Copy size={14} className="text-dark-400" />
                  </button>
                  <button onClick={() => handleDelete(prompt.id)} className="p-1.5 hover:bg-dark-700 rounded-lg">
                    <Trash2 size={14} className="text-dark-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-300 line-clamp-2">{prompt.content}</p>
            </div>
          ))}
          {prompts.length === 0 && (
            <p className="text-center text-dark-400 py-8">No prompts yet. Create reusable prompts to speed up your workflow.</p>
          )}
        </div>
      </div>
    </div>
  )
}
