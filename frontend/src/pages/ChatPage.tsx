import { useEffect } from 'react'
import { ChatArea } from '@/components/chat/ChatArea'
import { useChatStore } from '@/store'

export function ChatPage() {
  const { loadModels } = useChatStore()

  useEffect(() => {
    loadModels()
  }, [loadModels])

  return <ChatArea />
}
