import { useChatStore } from '@/store'
import { Database, Sparkles } from 'lucide-react'

export function ChatHeader() {
  const { currentConversation, models, selectedModel, setSelectedModel, useRag, setUseRag } = useChatStore()

  if (!currentConversation) return null

  return (
    <div className="border-b border-dark-700 px-4 py-3 flex items-center justify-between bg-dark-900/50 backdrop-blur-sm">
      <h2 className="text-sm font-medium text-dark-200 truncate max-w-xs">
        {currentConversation.title}
      </h2>
      <div className="flex items-center gap-3">
        {/* Model Selector */}
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-dark-800 border border-dark-600 text-dark-200 text-xs rounded-lg px-2.5 py-1.5
            focus:ring-primary-500 focus:border-primary-500"
        >
          {models.length > 0 ? (
            models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))
          ) : (
            <option value={selectedModel}>{selectedModel}</option>
          )}
        </select>

        {/* RAG Toggle */}
        <button
          onClick={() => setUseRag(!useRag)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            useRag
              ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
              : 'bg-dark-800 text-dark-400 border border-dark-600 hover:text-dark-200'
          }`}
        >
          <Database size={12} />
          RAG
        </button>

        <div className="flex items-center gap-1 text-xs text-dark-500">
          <Sparkles size={12} />
          {selectedModel}
        </div>
      </div>
    </div>
  )
}
