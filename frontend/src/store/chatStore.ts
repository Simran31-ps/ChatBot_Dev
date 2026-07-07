import { create } from 'zustand'
import { api } from '@/services/api'
import type { Conversation, Message, Model } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  models: Model[]
  selectedModel: string
  isStreaming: boolean
  streamingContent: string
  useRag: boolean

  loadConversations: (workspaceId?: string) => Promise<void>
  createConversation: (title?: string, model?: string, workspaceId?: string) => Promise<Conversation>
  selectConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  loadModels: () => Promise<void>
  setSelectedModel: (model: string) => void
  setUseRag: (value: boolean) => void
  clearStreaming: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  models: [],
  selectedModel: 'llama3.2',
  isStreaming: false,
  streamingContent: '',
  useRag: false,

  loadConversations: async (workspaceId) => {
    const path = workspaceId
      ? `/chat/conversations?workspace_id=${workspaceId}`
      : '/chat/conversations'
    const conversations = await api.get<Conversation[]>(path)
    set({ conversations })
  },

  createConversation: async (title, model, workspaceId) => {
    const conversation = await api.post<Conversation>('/chat/conversations', {
      title: title || 'New Chat',
      model: model || get().selectedModel,
      workspace_id: workspaceId,
    })
    set((state) => ({ conversations: [conversation, ...state.conversations] }))
    return conversation
  },

  selectConversation: async (id) => {
    const data = await api.get<Conversation & { messages: Message[] }>(
      `/chat/conversations/${id}`
    )
    set({
      currentConversation: data,
      messages: data.messages || [],
    })
  },

  deleteConversation: async (id) => {
    await api.delete(`/chat/conversations/${id}`)
    const { currentConversation } = get()
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation: currentConversation?.id === id ? null : currentConversation,
      messages: currentConversation?.id === id ? [] : state.messages,
    }))
  },

  sendMessage: async (content) => {
    const { currentConversation, selectedModel, useRag } = get()
    if (!currentConversation) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      model: null,
      tokens_used: null,
      created_at: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
    }))

    try {
      const response = await api.streamChat(
        currentConversation.id,
        content,
        selectedModel,
        useRag,
        currentConversation.workspace_id || undefined,
      )

      if (!response.ok) {
        throw new Error('Stream failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
                set({ streamingContent: fullContent })
              }
              if (data.done) {
                const assistantMessage: Message = {
                  id: data.message_id || crypto.randomUUID(),
                  role: 'assistant',
                  content: fullContent,
                  model: selectedModel,
                  tokens_used: null,
                  created_at: new Date().toISOString(),
                }
                set((state) => ({
                  messages: [...state.messages, assistantMessage],
                  isStreaming: false,
                  streamingContent: '',
                }))
              }
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
        model: null,
        tokens_used: null,
        created_at: new Date().toISOString(),
      }
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isStreaming: false,
        streamingContent: '',
      }))
    }
  },

  loadModels: async () => {
    try {
      const data = await api.get<{ models: Model[] }>('/models')
      set({ models: data.models })
      if (data.models.length > 0 && !get().selectedModel) {
        set({ selectedModel: data.models[0].name })
      }
    } catch {
      set({ models: [] })
    }
  },

  setSelectedModel: (model) => set({ selectedModel: model }),
  setUseRag: (value) => set({ useRag: value }),
  clearStreaming: () => set({ isStreaming: false, streamingContent: '' }),
}))
