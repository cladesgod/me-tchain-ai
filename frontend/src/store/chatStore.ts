import { create } from 'zustand'

export type PersonaType = 'engineer' | 'researcher' | 'speaker' | 'educator'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  persona?: PersonaType
  timestamp: Date
  isStreaming?: boolean
}

interface ChatState {
  messages: Message[]
  isConnected: boolean
  sessionId: string | null
  ws: WebSocket | null
  typingPersona: PersonaType | null
  activePersonas: PersonaType[]
  currentStreamingPersona: PersonaType | null

  // Actions
  connect: () => void
  disconnect: () => void
  sendMessage: (content: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string, persona?: PersonaType) => void
  setStreaming: (isStreaming: boolean) => void
  setTypingPersona: (persona: PersonaType | null) => void
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8001/api/v1/chat'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isConnected: false,
  sessionId: null,
  ws: null,
  typingPersona: null,
  activePersonas: ['engineer', 'researcher', 'speaker', 'educator'],
  currentStreamingPersona: null,

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
          get().addMessage({
            id: crypto.randomUUID(),
            content: data.content,
            role: 'assistant',
            timestamp: new Date(),
          })
        } else if (data.type === 'typing') {
          // Persona is typing
          get().setTypingPersona(data.persona)
          // Add placeholder message for this persona if not already streaming
          const lastMessage = get().messages[get().messages.length - 1]
          if (!lastMessage || lastMessage.persona !== data.persona || !lastMessage.isStreaming) {
            get().addMessage({
              id: crypto.randomUUID(),
              content: '',
              role: 'assistant',
              persona: data.persona,
              timestamp: new Date(),
              isStreaming: true,
            })
            set({ currentStreamingPersona: data.persona })
          }
        } else if (data.type === 'stream') {
          // Streaming content from persona
          get().setTypingPersona(null)
          get().updateLastMessage(data.content, data.persona)
        } else if (data.type === 'done') {
          // Persona finished
          get().setStreaming(false)
          set({ currentStreamingPersona: null, typingPersona: null })
        } else if (data.type === 'error') {
          get().addMessage({
            id: crypto.randomUUID(),
            content: data.content,
            role: 'assistant',
            timestamp: new Date(),
          })
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
    get().addMessage({
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
    })

    // Send to server (backend will handle persona classification)
    ws.send(JSON.stringify({ content }))
  },

  addMessage: (message: Message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  updateLastMessage: (content: string, persona?: PersonaType) => {
    set((state) => {
      const messages = [...state.messages]
      // Find the last message from this persona (if specified) or last assistant message
      let targetIndex = messages.length - 1
      if (persona) {
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'assistant' && messages[i].persona === persona && messages[i].isStreaming) {
            targetIndex = i
            break
          }
        }
      }
      const lastMessage = messages[targetIndex]
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

  setTypingPersona: (persona: PersonaType | null) => {
    set({ typingPersona: persona })
  },
}))

// Auto-connect on import
if (typeof window !== 'undefined') {
  useChatStore.getState().connect()
}
