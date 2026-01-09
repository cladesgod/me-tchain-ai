import { create } from 'zustand'

interface Message {
  content: string
  role: 'user' | 'assistant'
  isStreaming?: boolean
}

interface ChatState {
  messages: Message[]
  isConnected: boolean
  sessionId: string | null
  ws: WebSocket | null

  // Actions
  connect: () => void
  disconnect: () => void
  sendMessage: (content: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setStreaming: (isStreaming: boolean) => void
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/chat'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isConnected: false,
  sessionId: null,
  ws: null,

  connect: () => {
    const { ws } = get()
    if (ws) return // Already connected

    const socket = new WebSocket(WS_URL)

    socket.onopen = () => {
      set({ isConnected: true, ws: socket })
      console.log('WebSocket connected')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'system') {
          // Welcome message
          set({ sessionId: data.session_id })
          get().addMessage({ content: data.content, role: 'assistant' })
        } else if (data.type === 'stream') {
          if (data.done) {
            get().setStreaming(false)
          } else {
            get().updateLastMessage(data.content)
          }
        } else if (data.type === 'error') {
          get().addMessage({ content: data.content, role: 'assistant' })
        }
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    socket.onclose = () => {
      set({ isConnected: false, ws: null })
      console.log('WebSocket disconnected')
      // Attempt to reconnect after 3 seconds
      setTimeout(() => get().connect(), 3000)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  },

  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, isConnected: false })
    }
  },

  sendMessage: (content: string) => {
    const { ws, isConnected } = get()
    if (!ws || !isConnected) {
      get().connect()
      return
    }

    // Add user message
    get().addMessage({ content, role: 'user' })

    // Add placeholder for assistant response
    get().addMessage({ content: '', role: 'assistant', isStreaming: true })

    // Send to server
    ws.send(JSON.stringify({ type: 'message', content }))
  },

  addMessage: (message: Message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  updateLastMessage: (content: string) => {
    set((state) => {
      const messages = [...state.messages]
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += content
      }
      return { messages }
    })
  },

  setStreaming: (isStreaming: boolean) => {
    set((state) => {
      const messages = [...state.messages]
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        lastMessage.isStreaming = isStreaming
      }
      return { messages }
    })
  },
}))

// Auto-connect on import
if (typeof window !== 'undefined') {
  useChatStore.getState().connect()
}
