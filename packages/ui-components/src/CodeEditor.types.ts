import type { editor } from "monaco-editor"

export type EditorTheme = "vs-dark" | "light"

export type SupportedLanguage =
  | "typescript"
  | "javascript"
  | "json"
  | "markdown"
  | "html"
  | "css"
  | "python"
  | "rust"
  | "go"
  | "yaml"
  | "toml"
  | "sql"

export interface CodeEditorProps {
  value: string
  language?: SupportedLanguage
  theme?: EditorTheme
  readOnly?: boolean
  onChange?: (value: string) => void
  onSave?: (value: string) => void
  path?: string
  height?: string | number
  options?: editor.IStandaloneEditorConstructionOptions
}

export interface EditorState {
  isDirty: boolean
  cursorPosition: { line: number; column: number }
  selectedText: string
  totalLines: number
}

export interface KeyBinding {
  key: string
  handler: () => void
  when?: string
}
