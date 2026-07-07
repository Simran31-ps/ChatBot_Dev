import { useAuthStore } from '@/store'
import { Settings, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { api } from '@/services/api'
import type { Document } from '@/types'

export function SettingsPage() {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)

  const loadDocuments = async () => {
    const docs = await api.get<Document[]>('/documents')
    setDocuments(docs)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.upload('/documents', file)
      await loadDocuments()
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  useState(() => {
    loadDocuments()
  })

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Settings size={20} className="text-primary-400" />
          <h1 className="text-xl font-semibold text-white">Settings</h1>
        </div>

        {/* Profile */}
        <section className="bg-dark-800 rounded-xl p-5 mb-4">
          <h2 className="font-medium text-dark-100 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-dark-400">Username</label>
              <p className="text-sm text-dark-100">{user?.username}</p>
            </div>
            <div>
              <label className="text-xs text-dark-400">Email</label>
              <p className="text-sm text-dark-100">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs text-dark-400">Full Name</label>
              <p className="text-sm text-dark-100">{user?.full_name || 'Not set'}</p>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-dark-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-dark-100">Documents (RAG)</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <p className="text-sm text-dark-100">{doc.filename}</p>
                  <p className="text-xs text-dark-400">{doc.chunk_count} chunks | {(doc.file_size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-sm text-dark-400">No documents uploaded. Upload PDF, TXT, MD, or DOCX files for RAG.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
