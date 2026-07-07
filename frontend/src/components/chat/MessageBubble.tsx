import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={16} className="text-primary-400" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary-600 text-white'
              : 'bg-dark-800 text-dark-100'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const inline = !match
                    if (inline) {
                      return (
                        <code className="bg-dark-700 px-1.5 py-0.5 rounded text-xs" {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !bg-dark-950 text-xs"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary-400 animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-2 mt-1.5 ml-2">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-dark-700 rounded transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} className="text-dark-500 hover:text-dark-300" />
              )}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center shrink-0 mt-0.5">
          <User size={16} className="text-dark-300" />
        </div>
      )}
    </div>
  )
}
