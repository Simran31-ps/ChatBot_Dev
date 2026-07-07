export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  is_active: boolean
  is_admin: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model: string | null
  tokens_used: number | null
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  model: string
  system_prompt: string | null
  workspace_id: string | null
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Workspace {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  filename: string
  file_size: number
  content_type: string
  chunk_count: number
  workspace_id: string | null
  created_at: string
}

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  is_public: boolean
  author_id: string | null
  created_at: string
}

export interface Model {
  name: string
  size: number
  modified_at: string
  digest: string
}

export interface AdminStats {
  total_users: number
  active_users: number
  total_conversations: number
  total_messages: number
  total_documents: number
  total_workspaces: number
}
