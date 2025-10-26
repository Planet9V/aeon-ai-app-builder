import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  model?: string
  tokens?: number
}

export interface ChatConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  model: string
}

interface ChatState {
  conversations: ChatConversation[]
  currentConversationId: string | null
  isLoading: boolean
  error: string | null

  createConversation: (title?: string, model?: string) => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
  addMessage: (content: string, role: "user" | "assistant" | "system", metadata?: Partial<ChatMessage>) => void
  clearMessages: () => void
  updateConversationTitle: (id: string, title: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      error: null,

      createConversation: (title = "New Chat", model = "anthropic/claude-3-sonnet") => {
        const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const conversation: ChatConversation = {
          id,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          model,
        }

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }))

        return id
      },

      deleteConversation: (id) => {
        set((state) => {
          const conversations = state.conversations.filter((c) => c.id !== id)
          const currentConversationId =
            state.currentConversationId === id
              ? conversations.length > 0
                ? conversations[0].id
                : null
              : state.currentConversationId

          return { conversations, currentConversationId }
        })
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      addMessage: (content, role, metadata = {}) => {
        const { currentConversationId, conversations } = get()
        if (!currentConversationId) return

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role,
          content,
          timestamp: new Date(),
          ...metadata,
        }

        set({
          conversations: conversations.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date(),
                  title:
                    conv.messages.length === 0 && role === "user"
                      ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
                      : conv.title,
                }
              : conv,
          ),
        })
      },

      clearMessages: () => {
        const { currentConversationId, conversations } = get()
        if (!currentConversationId) return

        set({
          conversations: conversations.map((conv) =>
            conv.id === currentConversationId ? { ...conv, messages: [], updatedAt: new Date() } : conv,
          ),
        })
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv,
          ),
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "opencode-chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
      }),
    },
  ),
)
