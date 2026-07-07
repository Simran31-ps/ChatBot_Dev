const BASE_URL = '/api/v1'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    if (response.status === 204) return undefined as T
    return response.json()
  }

  get<T>(path: string) {
    return this.request<T>(path)
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete(path: string) {
    return this.request(path, { method: 'DELETE' })
  }

  async upload<T>(path: string, file: File, params?: Record<string, string>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''

    const headers: HeadersInit = {}
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${BASE_URL}${path}${queryString}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    return response.json()
  }

  streamChat(conversationId: string, message: string, model?: string, useRag = false, workspaceId?: string) {
    const body = JSON.stringify({
      message,
      model,
      use_rag: useRag,
      workspace_id: workspaceId,
    })

    return fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body,
    })
  }
}

export const api = new ApiClient()
