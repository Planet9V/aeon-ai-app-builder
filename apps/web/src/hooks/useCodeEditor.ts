import { useState, useCallback, useEffect } from "react"
import type { SupportedLanguage } from "@opencode/ui-components"

export interface UseCodeEditorOptions {
  initialValue?: string
  language?: SupportedLanguage
  onSave?: (value: string) => void | Promise<void>
  autoSaveDelay?: number
}

export interface UseCodeEditorReturn {
  value: string
  isDirty: boolean
  isSaving: boolean
  language: SupportedLanguage
  setValue: (value: string) => void
  save: () => Promise<void>
  reset: () => void
}

export function useCodeEditor({
  initialValue = "",
  language = "typescript",
  onSave,
  autoSaveDelay = 3000,
}: UseCodeEditorOptions = {}): UseCodeEditorReturn {
  const [value, setValue] = useState(initialValue)
  const [originalValue, setOriginalValue] = useState(initialValue)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  const handleSetValue = useCallback((newValue: string) => {
    setValue(newValue)
    setIsDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!isDirty || !onSave) return

    setIsSaving(true)
    try {
      await onSave(value)
      setOriginalValue(value)
      setIsDirty(false)
    } catch (error) {
      console.error("Failed to save:", error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [value, isDirty, onSave])

  const reset = useCallback(() => {
    setValue(originalValue)
    setIsDirty(false)
  }, [originalValue])

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (isDirty && autoSaveDelay > 0) {
      const timer = setTimeout(() => {
        save()
      }, autoSaveDelay)
      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [value, isDirty, autoSaveDelay])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  return {
    value,
    isDirty,
    isSaving,
    language,
    setValue: handleSetValue,
    save,
    reset,
  }
}
