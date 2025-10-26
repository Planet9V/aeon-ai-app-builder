import { useEditorStore } from "../stores/useEditorStore"
import { getLanguageDisplayName } from "../utils/languageDetection"

export function StatusBar() {
  const { openFiles, activeFileId } = useEditorStore()
  const activeFile = openFiles.find((f) => f.id === activeFileId)

  const unsavedCount = openFiles.filter((f) => f.isDirty).length

  return (
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        <span className="font-semibold">OpenCode</span>
        {activeFile && (
          <>
            <span>|</span>
            <span>{activeFile.path}</span>
            <span>|</span>
            <span>{getLanguageDisplayName(activeFile.language)}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {unsavedCount > 0 && (
          <span className="bg-yellow-500 text-gray-900 px-2 py-0.5 rounded">
            {unsavedCount} unsaved {unsavedCount === 1 ? "file" : "files"}
          </span>
        )}
        <span>{openFiles.length} files open</span>
        <span>Wave 3 - Core IDE</span>
      </div>
    </div>
  )
}
