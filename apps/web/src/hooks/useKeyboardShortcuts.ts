import { useEffect, useCallback } from "react"

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrl === undefined || event.ctrlKey === shortcut.ctrl
        const shiftMatches = shortcut.shift === undefined || event.shiftKey === shortcut.shift
        const altMatches = shortcut.alt === undefined || event.altKey === shortcut.alt
        const metaMatches = shortcut.meta === undefined || event.metaKey === shortcut.meta

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrl) parts.push(isMac ? "⌃" : "Ctrl")
  if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt")
  if (shortcut.shift) parts.push(isMac ? "⇧" : "Shift")
  if (shortcut.meta) parts.push(isMac ? "⌘" : "Win")

  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? "" : "+")
}
