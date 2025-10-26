import { useRef, useEffect, useState, useCallback } from "react"
import Editor, { Monaco, OnMount, BeforeMount } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import type { CodeEditorProps, EditorState } from "./CodeEditor.types"

const DEFAULT_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: "on",
  renderWhitespace: "selection",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: "on",
  formatOnPaste: true,
  formatOnType: true,
  suggest: {
    showKeywords: true,
    showSnippets: true,
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
}

export function CodeEditor({
  value,
  language = "typescript",
  theme = "vs-dark",
  readOnly = false,
  onChange,
  onSave,
  path,
  height = "100%",
  options = {},
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({
    isDirty: false,
    cursorPosition: { line: 1, column: 1 },
    selectedText: "",
    totalLines: 1,
  })

  const handleEditorWillMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme("opencode-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editor.lineHighlightBackground": "#2a2a2a",
        "editorLineNumber.foreground": "#858585",
        "editorCursor.foreground": "#aeafad",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
      },
    })
  }, [])

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    editor.onDidChangeCursorPosition((e) => {
      setEditorState((prev) => ({
        ...prev,
        cursorPosition: {
          line: e.position.lineNumber,
          column: e.position.column,
        },
      }))
    })

    editor.onDidChangeModelContent(() => {
      const model = editor.getModel()
      if (model) {
        setEditorState((prev) => ({
          ...prev,
          isDirty: true,
          totalLines: model.getLineCount(),
        }))
      }
    })

    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel()?.getValueInRange(e.selection)
      setEditorState((prev) => ({
        ...prev,
        selectedText: selection || "",
      }))
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })

    editor.focus()
  }, [])

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined && onChange) {
        onChange(value)
      }
    },
    [onChange],
  )

  const handleSave = useCallback(() => {
    if (editorRef.current && onSave) {
      const value = editorRef.current.getValue()
      onSave(value)
      setEditorState((prev) => ({ ...prev, isDirty: false }))
    }
  }, [onSave])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const disposable = editor.onDidChangeModelContent(() => {
      if (onChange) {
        const value = editor.getValue()
        onChange(value)
      }
    })

    return () => disposable.dispose()
  }, [onChange])

  const mergedOptions: editor.IStandaloneEditorConstructionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    readOnly,
  }

  return (
    <div className="relative h-full w-full">
      <Editor
        height={height}
        language={language}
        theme={theme === "vs-dark" ? "opencode-dark" : theme}
        value={value}
        onChange={handleChange}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={mergedOptions}
        path={path}
      />

      {editorState.isDirty && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-600 text-white text-xs rounded">Unsaved changes</div>
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-4 px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">
        <span>
          Ln {editorState.cursorPosition.line}, Col {editorState.cursorPosition.column}
        </span>
        {editorState.selectedText && <span>{editorState.selectedText.length} selected</span>}
        <span>{editorState.totalLines} lines</span>
        <span className="uppercase">{language}</span>
      </div>
    </div>
  )
}

export default CodeEditor
