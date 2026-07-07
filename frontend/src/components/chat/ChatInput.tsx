import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, StopCircle } from 'lucide-react'
import { useChatStore } from '@/store'

export function ChatInput() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isStreaming } = useChatStore()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-dark-700 p-4 bg-dark-900">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-dark-800 rounded-xl border border-dark-600
          focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all">
          <button
            type="button"
            className="p-3 text-dark-400 hover:text-dark-200 transition-colors"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent py-3 px-1 text-dark-100 placeholder-dark-500
              resize-none focus:outline-none text-sm max-h-[200px]"
          />
          <button
            type={isStreaming ? 'button' : 'submit'}
            disabled={!input.trim() && !isStreaming}
            className="p-3 text-dark-400 hover:text-primary-400 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isStreaming ? <StopCircle size={18} /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-dark-500 text-center mt-2">
          OpenChat AI uses open-source models. Responses may be inaccurate.
        </p>
      </form>
    </div>
  )
}
