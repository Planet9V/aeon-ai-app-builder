import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SupportedLanguage } from "@opencode/ui-components"

export interface OpenFile {
  id: string
  path: string
  name: string
  content: string
  language: SupportedLanguage
  isDirty: boolean
  savedContent: string
}

interface EditorStore {
  openFiles: OpenFile[]
  activeFileId: string | null

  openFile: (file: Omit<OpenFile, "isDirty" | "savedContent">) => void
  closeFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string) => void
  saveFile: (fileId: string) => void
  saveAllFiles: () => void
  closeAllFiles: () => void
  getActiveFile: () => OpenFile | null
  hasUnsavedChanges: () => boolean
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      openFiles: [],
      activeFileId: null,

      openFile: (file) => {
        const exists = get().openFiles.find((f) => f.id === file.id)
        if (exists) {
          set({ activeFileId: file.id })
          return
        }

        const newFile: OpenFile = {
          ...file,
          isDirty: false,
          savedContent: file.content,
        }

        set((state) => ({
          openFiles: [...state.openFiles, newFile],
          activeFileId: file.id,
        }))
      },

      closeFile: (fileId) => {
        set((state) => {
          const newFiles = state.openFiles.filter((f) => f.id !== fileId)
          let newActiveId = state.activeFileId

          if (state.activeFileId === fileId) {
            newActiveId = newFiles.length > 0 ? newFiles[newFiles.length - 1].id : null
          }

          return {
            openFiles: newFiles,
            activeFileId: newActiveId,
          }
        })
      },

      setActiveFile: (fileId) => {
        set({ activeFileId: fileId })
      },

      updateFileContent: (fileId, content) => {
        set((state) => ({
          openFiles: state.openFiles.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  content,
                  isDirty: content !== file.savedContent,
                }
              : file,
          ),
        }))
      },

      saveFile: (fileId) => {
        set((state) => ({
          openFiles: state.openFiles.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  savedContent: file.content,
                  isDirty: false,
                }
              : file,
          ),
        }))
      },

      saveAllFiles: () => {
        set((state) => ({
          openFiles: state.openFiles.map((file) => ({
            ...file,
            savedContent: file.content,
            isDirty: false,
          })),
        }))
      },

      closeAllFiles: () => {
        set({ openFiles: [], activeFileId: null })
      },

      getActiveFile: () => {
        const state = get()
        return state.openFiles.find((f) => f.id === state.activeFileId) || null
      },

      hasUnsavedChanges: () => {
        return get().openFiles.some((f) => f.isDirty)
      },
    }),
    {
      name: "editor-storage",
      partialize: (state) => ({
        openFiles: state.openFiles.map((f) => ({
          id: f.id,
          path: f.path,
          name: f.name,
          language: f.language,
        })),
        activeFileId: state.activeFileId,
      }),
    },
  ),
)
