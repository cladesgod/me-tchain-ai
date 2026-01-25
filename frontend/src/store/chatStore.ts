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

// Buffer item with persona context
interface BufferItem {
  content: string
  persona: PersonaType | null
}

interface ChatState {
  messages: Message[]
  isConnected: boolean
  sessionId: string | null
  ws: WebSocket | null
  typingPersona: PersonaType | null
  activePersonas: PersonaType[]
  currentStreamingPersona: PersonaType | null
  // Typewriter buffer for smooth streaming - stores content with persona
  typewriterBuffer: BufferItem[]

  // Actions
  connect: () => void
  disconnect: () => void
  sendMessage: (content: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string, persona?: PersonaType) => void
  setStreaming: (isStreaming: boolean, persona?: PersonaType) => void
  setTypingPersona: (persona: PersonaType | null) => void
  // Typewriter actions
  appendToBuffer: (content: string, persona: PersonaType | null) => void
  drainBuffer: (charsPerTick: number) => void
  clearBuffer: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isConnected: false,
  sessionId: null,
  ws: null,
  typingPersona: null,
  activePersonas: ['engineer', 'researcher', 'speaker', 'educator'],
  currentStreamingPersona: null,
  typewriterBuffer: [],

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

        case 'typing': {
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
        }

        case 'stream':
          // Streaming content from persona - add to buffer for smooth typewriter
          get().setTypingPersona(null)
          get().appendToBuffer(message.content, message.persona as PersonaType | null)
          break

        case 'done': {
          // Persona finished - wait for buffer to drain before marking complete
          const finishedPersona = message.persona as PersonaType | undefined
          const checkBufferAndFinish = () => {
            // Check if buffer still has items for this persona
            const hasBufferForPersona = get().typewriterBuffer.some(
              item => item.persona === finishedPersona
            )
            if (!hasBufferForPersona) {
              // Mark THIS persona's message as done streaming
              get().setStreaming(false, finishedPersona)
              // Only clear currentStreamingPersona if it matches
              if (get().currentStreamingPersona === finishedPersona) {
                set({ currentStreamingPersona: null })
              }
              set({ typingPersona: null })
            } else {
              // Buffer not empty yet, check again
              setTimeout(checkBufferAndFinish, 50)
            }
          }
          checkBufferAndFinish()
          break
        }

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
      // Find the last streaming message from this persona
      let targetIndex = -1

      if (persona) {
        // Find message for specific persona
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'assistant' && state.messages[i].persona === persona && state.messages[i].isStreaming) {
            targetIndex = i
            break
          }
        }
      } else {
        // Fallback: find any streaming assistant message
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'assistant' && state.messages[i].isStreaming) {
            targetIndex = i
            break
          }
        }
      }

      // Only update if we found a matching message
      if (targetIndex === -1) return state

      const targetMessage = state.messages[targetIndex]
      const messages = [...state.messages]
      messages[targetIndex] = {
        ...targetMessage,
        content: targetMessage.content + content
      }
      return { messages }
    })
  },

  setStreaming: (isStreaming: boolean, persona?: PersonaType) => {
    set((state) => {
      if (state.messages.length === 0) return state

      // Find the message for the specific persona, or fall back to last message
      let targetIndex = state.messages.length - 1
      if (persona) {
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'assistant' && state.messages[i].persona === persona) {
            targetIndex = i
            break
          }
        }
      }

      const targetMessage = state.messages[targetIndex]
      if (targetMessage && targetMessage.role === 'assistant') {
        const messages = [...state.messages]
        messages[targetIndex] = { ...targetMessage, isStreaming }
        return { messages }
      }
      return state
    })
  },

  setTypingPersona: (persona: PersonaType | null) => {
    set({ typingPersona: persona })
  },

  // Typewriter buffer methods for smooth streaming
  appendToBuffer: (content: string, persona: PersonaType | null) => {
    set((state) => ({
      typewriterBuffer: [...state.typewriterBuffer, { content, persona }]
    }))
  },

  drainBuffer: (charsPerTick: number) => {
    const { typewriterBuffer } = get()
    if (typewriterBuffer.length === 0) return

    // Get the first buffer item
    const [first, ...rest] = typewriterBuffer

    if (first.content.length <= charsPerTick) {
      // Drain entire item
      set({ typewriterBuffer: rest })
      get().updateLastMessage(first.content, first.persona ?? undefined)
    } else {
      // Partial drain - take chars and keep remainder
      const chars = first.content.slice(0, charsPerTick)
      const remaining = first.content.slice(charsPerTick)
      set({
        typewriterBuffer: [{ content: remaining, persona: first.persona }, ...rest]
      })
      get().updateLastMessage(chars, first.persona ?? undefined)
    }
  },

  clearBuffer: () => {
    set({ typewriterBuffer: [] })
  },
}))

// Auto-connect on import
if (typeof window !== 'undefined') {
  useChatStore.getState().connect()
}
