import { useState, useRef, useEffect } from "react"

export interface FileOperationDialogProps {
  type: "new-file" | "new-folder" | "rename" | "delete"
  currentPath?: string
  currentName?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function FileOperationDialog({
  type,
  currentPath,
  currentName = "",
  onConfirm,
  onCancel,
}: FileOperationDialogProps) {
  const [value, setValue] = useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    if (type === "rename") {
      const dotIndex = currentName.lastIndexOf(".")
      if (dotIndex > 0) {
        inputRef.current?.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current?.select()
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel()
    }
  }

  const getTitle = () => {
    switch (type) {
      case "new-file":
        return "New File"
      case "new-folder":
        return "New Folder"
      case "rename":
        return "Rename"
      case "delete":
        return "Delete"
    }
  }

  const getPlaceholder = () => {
    switch (type) {
      case "new-file":
        return "filename.ts"
      case "new-folder":
        return "folder-name"
      case "rename":
        return "new-name"
      default:
        return ""
    }
  }

  if (type === "delete") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-96">
          <h2 className="text-lg font-semibold text-white mb-4">Delete File</h2>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete <strong>{currentName}</strong>?
            <br />
            <span className="text-sm text-gray-500">This action cannot be undone.</span>
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm("")}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-white mb-4">{getTitle()}</h2>
        {currentPath && <p className="text-sm text-gray-400 mb-3">in: {currentPath}</p>}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === "rename" ? "Rename" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FileOperationDialog
