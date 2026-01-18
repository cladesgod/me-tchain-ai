import { create } from 'zustand'
import { WS_CHAT_ENDPOINT, IS_DEV } from '@/lib/config'
import { parseWebSocketMessage } from '@/lib/schemas'

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

    if (IS_DEV) {
      console.log('[ChatStore] Connecting to WebSocket:', WS_CHAT_ENDPOINT)
    }

    const socket = new WebSocket(WS_CHAT_ENDPOINT)

    socket.onopen = () => {
      set({ isConnected: true, ws: socket })
      if (IS_DEV) {
        console.log('[ChatStore] WebSocket connected!')
      }
    }

    socket.onmessage = (event) => {
      const message = parseWebSocketMessage(event.data)
      if (!message) return // Invalid message, already logged by parseWebSocketMessage

      switch (message.type) {
        case 'system':
          // Welcome message
          set({ sessionId: message.session_id ?? null })
          get().addMessage({
            id: crypto.randomUUID(),
            content: message.content,
            role: 'assistant',
            timestamp: new Date(),
          })
          break

        case 'typing':
          // Persona is typing
          get().setTypingPersona(message.persona as PersonaType | null)
          // Add placeholder message for this persona if not already streaming
          const lastMessage = get().messages[get().messages.length - 1]
          if (!lastMessage || lastMessage.persona !== message.persona || !lastMessage.isStreaming) {
            get().addMessage({
              id: crypto.randomUUID(),
              content: '',
              role: 'assistant',
              persona: message.persona as PersonaType,
              timestamp: new Date(),
              isStreaming: true,
            })
            set({ currentStreamingPersona: message.persona as PersonaType })
          }
          break

        case 'stream':
          // Streaming content from persona
          get().setTypingPersona(null)
          get().updateLastMessage(message.content, message.persona as PersonaType | undefined)
          break

        case 'done':
          // Persona finished
          get().setStreaming(false)
          set({ currentStreamingPersona: null, typingPersona: null })
          break

        case 'error':
          get().addMessage({
            id: crypto.randomUUID(),
            content: message.content,
            role: 'assistant',
            timestamp: new Date(),
          })
          break
      }
    }

    socket.onclose = (event) => {
      set({ isConnected: false, ws: null })
      if (IS_DEV) {
        console.log('[ChatStore] WebSocket disconnected. Code:', event.code, 'Reason:', event.reason)
      }
      // Attempt to reconnect after 3 seconds
      setTimeout(() => get().connect(), 3000)
    }

    socket.onerror = (error) => {
      if (IS_DEV) {
        console.error('[ChatStore] WebSocket error:', error)
      }
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
      // Find the last message from this persona (if specified) or last assistant message
      let targetIndex = state.messages.length - 1
      if (persona) {
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'assistant' && state.messages[i].persona === persona && state.messages[i].isStreaming) {
            targetIndex = i
            break
          }
        }
      }
      const lastMessage = state.messages[targetIndex]
      if (lastMessage && lastMessage.role === 'assistant') {
        // Create a new array with a new message object to avoid mutation
        const messages = [...state.messages]
        messages[targetIndex] = {
          ...lastMessage,
          content: lastMessage.content + content
        }
        return { messages }
      }
      return state
    })
  },

  setStreaming: (isStreaming: boolean) => {
    set((state) => {
      if (state.messages.length === 0) return state
      const lastMessage = state.messages[state.messages.length - 1]
      if (lastMessage) {
        // Create a new array with a new message object to avoid mutation
        const messages = [...state.messages.slice(0, -1), {
          ...lastMessage,
          isStreaming
        }]
        return { messages }
      }
      return state
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
