import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { Bot } from 'lucide-react'

export function ChatArea() {
  const { messages, currentConversation, isStreaming, streamingContent } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-6">
          <Bot size={32} className="text-primary-400" />
        </div>
        <h2 className="text-2xl font-semibold text-dark-100 mb-2">OpenChat AI</h2>
        <p className="text-dark-400 text-center max-w-md">
          Start a new conversation or select one from the sidebar.
          Powered by open-source AI models via Ollama.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                model: null,
                tokens_used: null,
                created_at: new Date().toISOString(),
              }}
              isStreaming
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput />
    </div>
  )
}
