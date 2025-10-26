import { useEffect, useState } from "react"
import {
  CodeEditor,
  FileTree,
  TabBar,
  ContextMenu,
  AIChat,
  CodeSuggestionsPanel,
  type FileTreeNode,
  type TabItem,
  type MenuItem,
} from "@opencode/ui-components"
import { useEditorStore } from "../stores/useEditorStore"
import { useFileTreeStore } from "../stores/useFileTreeStore"
import { useChatStore } from "../stores/useChatStore"
import { useAIStore } from "../stores/useAIStore"
import { useBMADWorkflow } from "@opencode/ai-hooks"
import { detectLanguageFromPath, getLanguageIcon } from "../utils/languageDetection"
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts"
import { filesApi } from "../api/files"
import { FileOperationDialog, type FileOperationDialogProps } from "../components/FileOperationDialog"

function EditorPage() {
  const { openFiles, activeFileId, openFile, updateFileContent, saveFile, getActiveFile, closeFile, saveAllFiles } =
    useEditorStore()
  const {
    rootNodes,
    selectedPath,
    expandedPaths,
    setRootNodes,
    toggleExpand,
    selectNode,
    addNode,
    removeNode,
    renameNode,
  } = useFileTreeStore()
  const { createConversation, currentConversationId } = useChatStore()
  const { selectedModel } = useAIStore()
  const { executeWorkflow, state: workflowState } = useBMADWorkflow()
  const activeFile = getActiveFile()
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode | null } | null>(null)
  const [dialog, setDialog] = useState<Omit<FileOperationDialogProps, "onConfirm" | "onCancel"> | null>(null)
  const [rightSidebarTab, setRightSidebarTab] = useState<"chat" | "suggestions" | "bmad">("chat")
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)

  useEffect(() => {
    loadFileTree()
    if (!currentConversationId) {
      createConversation("Code Assistant", selectedModel)
    }
  }, [])

  const loadFileTree = async () => {
    setIsLoadingFiles(true)
    try {
      const files = await filesApi.list("/")
      const nodes: FileTreeNode[] = files.map((f) => ({
        id: f.path,
        name: f.name,
        path: f.path,
        type: f.type,
        children: f.type === "directory" ? [] : undefined,
      }))
      setRootNodes(nodes)
    } catch (error) {
      console.error("Failed to load files:", error)
    } finally {
      setIsLoadingFiles(false)
    }
  }

  const handleSelectFile = async (node: FileTreeNode) => {
    if (node.type === "file") {
      try {
        const fileContent = await filesApi.read(node.path)
        openFile({
          id: node.path,
          path: node.path,
          name: node.name,
          content: fileContent.content,
          language: detectLanguageFromPath(node.path),
        })
        selectNode(node.path)
      } catch (error) {
        console.error("Failed to open file:", error)
      }
    }
  }

  const handleToggleDirectory = async (node: FileTreeNode) => {
    toggleExpand(node.path)

    const currentNode = findNodeByPath(rootNodes, node.path)
    if (currentNode && (!currentNode.children || currentNode.children.length === 0)) {
      try {
        const files = await filesApi.list(node.path)
        const children: FileTreeNode[] = files.map((f) => ({
          id: f.path,
          name: f.name,
          path: f.path,
          type: f.type,
          children: f.type === "directory" ? [] : undefined,
        }))

        useFileTreeStore.getState().loadChildren(node.path, children)
      } catch (error) {
        console.error("Failed to load directory:", error)
      }
    }
  }

  const findNodeByPath = (nodes: FileTreeNode[], path: string): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findNodeByPath(node.children, path)
        if (found) return found
      }
    }
    return null
  }

  const handleContextMenu = (e: React.MouseEvent, node: FileTreeNode | null) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const getContextMenuItems = (): MenuItem[] => {
    if (!contextMenu?.node) {
      return [
        {
          id: "new-file",
          label: "New File",
          icon: "📄",
          onClick: () => setDialog({ type: "new-file", currentPath: "/" }),
        },
        {
          id: "new-folder",
          label: "New Folder",
          icon: "📁",
          onClick: () => setDialog({ type: "new-folder", currentPath: "/" }),
        },
      ]
    }

    const node = contextMenu.node
    const items: MenuItem[] = []

    if (node.type === "directory") {
      items.push(
        {
          id: "new-file",
          label: "New File",
          icon: "📄",
          onClick: () => setDialog({ type: "new-file", currentPath: node.path }),
        },
        {
          id: "new-folder",
          label: "New Folder",
          icon: "📁",
          onClick: () => setDialog({ type: "new-folder", currentPath: node.path }),
        },
        { id: "sep-1", label: "", separator: true },
      )
    }

    items.push(
      {
        id: "rename",
        label: "Rename",
        icon: "✏️",
        onClick: () => setDialog({ type: "rename", currentName: node.name, currentPath: node.path }),
      },
      {
        id: "delete",
        label: "Delete",
        icon: "🗑️",
        danger: true,
        onClick: () => setDialog({ type: "delete", currentName: node.name, currentPath: node.path }),
      },
      { id: "sep-2", label: "", separator: true },
      { id: "copy-path", label: "Copy Path", icon: "📋", onClick: () => navigator.clipboard.writeText(node.path) },
    )

    return items
  }

  const handleFileOperation = async (operation: FileOperationDialogProps["type"], value: string) => {
    try {
      const basePath = dialog?.currentPath || contextMenu?.node?.path || "/"

      switch (operation) {
        case "new-file": {
          const filePath = basePath === "/" ? value : `${basePath}/${value}`
          await filesApi.create(filePath, "", "file")
          const newNode: FileTreeNode = {
            id: filePath,
            name: value,
            path: filePath,
            type: "file",
          }
          addNode(basePath, newNode)
          break
        }

        case "new-folder": {
          const folderPath = basePath === "/" ? value : `${basePath}/${value}`
          await filesApi.create(folderPath, "", "directory")
          const newNode: FileTreeNode = {
            id: folderPath,
            name: value,
            path: folderPath,
            type: "directory",
            children: [],
          }
          addNode(basePath, newNode)
          break
        }

        case "rename": {
          const oldPath = dialog?.currentPath || ""
          const newPath = oldPath.includes("/") ? oldPath.substring(0, oldPath.lastIndexOf("/") + 1) + value : value
          await filesApi.rename(oldPath, newPath)
          renameNode(oldPath, newPath)
          break
        }

        case "delete": {
          const path = dialog?.currentPath || ""
          await filesApi.delete(path)
          removeNode(path)
          const openFile = openFiles.find((f) => f.path === path)
          if (openFile) {
            closeFile(openFile.id)
          }
          break
        }
      }

      setDialog(null)
      setContextMenu(null)
    } catch (error) {
      console.error("File operation failed:", error)
      alert(error instanceof Error ? error.message : "Operation failed")
    }
  }

  useKeyboardShortcuts([
    {
      key: "s",
      meta: true,
      handler: () => {
        if (activeFile) {
          saveFile(activeFile.id)
          console.log("Saved:", activeFile.path)
        }
      },
      description: "Save current file",
    },
    {
      key: "s",
      meta: true,
      shift: true,
      handler: () => {
        saveAllFiles()
        console.log("Saved all files")
      },
      description: "Save all files",
    },
    {
      key: "w",
      meta: true,
      handler: () => {
        if (activeFile) {
          if (activeFile.isDirty) {
            if (confirm(`File "${activeFile.name}" has unsaved changes. Close anyway?`)) {
              closeFile(activeFile.id)
            }
          } else {
            closeFile(activeFile.id)
          }
        }
      },
      description: "Close current file",
    },
    {
      key: "Tab",
      ctrl: true,
      handler: () => {
        const currentIndex = openFiles.findIndex((f) => f.id === activeFileId)
        if (currentIndex !== -1 && openFiles.length > 1) {
          const nextIndex = (currentIndex + 1) % openFiles.length
          useEditorStore.getState().setActiveFile(openFiles[nextIndex].id)
        }
      },
      description: "Next tab",
    },
    {
      key: "Tab",
      ctrl: true,
      shift: true,
      handler: () => {
        const currentIndex = openFiles.findIndex((f) => f.id === activeFileId)
        if (currentIndex !== -1 && openFiles.length > 1) {
          const prevIndex = currentIndex === 0 ? openFiles.length - 1 : currentIndex - 1
          useEditorStore.getState().setActiveFile(openFiles[prevIndex].id)
        }
      },
      description: "Previous tab",
    },
    {
      key: "k",
      meta: true,
      shift: true,
      handler: () => {
        setIsRightSidebarOpen(!isRightSidebarOpen)
      },
      description: "Toggle AI sidebar",
    },
    {
      key: "b",
      meta: true,
      shift: true,
      handler: () => {
        if (activeFile) {
          handleBMADWorkflow()
        }
      },
      description: "Run BMAD workflow",
    },
  ])

  useEffect(() => {
    if (openFiles.length === 0) {
      openFile({
        id: "welcome",
        path: "welcome.md",
        name: "Welcome",
        content: `# Welcome to OpenCode Platform

A modern web-based IDE with AI assistance.

## Features

- 🎨 Monaco Editor - VS Code quality editing
- 📁 File Management - Full CRUD operations
- 🤖 AI Assistance - BMAD workflow integration
- 🔍 Knowledge Graph - Semantic code understanding

Start by creating a new file or opening an existing one.

**Keyboard Shortcuts:**
- \`Cmd/Ctrl + S\` - Save file
- \`Cmd/Ctrl + P\` - Command palette (coming soon)
- \`Cmd/Ctrl + F\` - Find
- \`Cmd/Ctrl + H\` - Replace
`,
        language: "markdown",
      })
    }
  }, [])

  const handleSave = async (content: string) => {
    if (!activeFile) return

    try {
      await filesApi.update(activeFile.path, content)
      saveFile(activeFile.id)
      console.log("Saved:", activeFile.path)
    } catch (error) {
      console.error("Failed to save file:", error)
    }
  }

  const handleBMADWorkflow = async () => {
    if (!activeFile) return

    const requirement = `Implement a feature for the file ${activeFile.path}. Current code:\n\n${activeFile.content}`

    setRightSidebarTab("bmad")
    await executeWorkflow(requirement, {
      filePath: activeFile.path,
      language: activeFile.language,
      existingCode: activeFile.content,
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">File Explorer</h2>
          </div>

          <div className="flex-1 overflow-y-auto" onContextMenu={(e) => handleContextMenu(e, null)}>
            {isLoadingFiles ? (
              <div className="p-4 text-gray-400 text-sm">Loading files...</div>
            ) : (
              <FileTree
                nodes={rootNodes}
                onSelectFile={handleSelectFile}
                onToggleDirectory={handleToggleDirectory}
                onContextMenu={handleContextMenu}
                selectedPath={selectedPath}
                expandedPaths={expandedPaths}
              />
            )}
          </div>

          <div className="border-t border-gray-700 p-2">
            <div className="text-xs text-gray-400">{rootNodes.length} items</div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
            <TabBar
              tabs={openFiles.map(
                (file): TabItem => ({
                  id: file.id,
                  title: file.name,
                  isDirty: file.isDirty,
                  icon: getLanguageIcon(file.language),
                  isActive: file.id === activeFileId,
                }),
              )}
              activeTabId={activeFileId}
              onTabClick={(tabId) => useEditorStore.getState().setActiveFile(tabId)}
              onTabClose={(tabId) => {
                const file = openFiles.find((f) => f.id === tabId)
                if (file?.isDirty) {
                  if (confirm(`File "${file.name}" has unsaved changes. Close anyway?`)) {
                    closeFile(tabId)
                  }
                } else {
                  closeFile(tabId)
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleBMADWorkflow}
                disabled={!activeFile}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Run BMAD Workflow"
              >
                🤖 AI Workflow
              </button>
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                title="Toggle AI Panel"
              >
                {isRightSidebarOpen ? "Hide AI" : "Show AI"}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-gray-900">
            {activeFile ? (
              <CodeEditor
                value={activeFile.content}
                language={activeFile.language}
                theme="vs-dark"
                onChange={(value) => updateFileContent(activeFile.id, value)}
                onSave={handleSave}
                path={activeFile.path}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Select a file to start editing</p>
              </div>
            )}
          </div>
        </main>

        {isRightSidebarOpen && (
          <aside className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setRightSidebarTab("chat")}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  rightSidebarTab === "chat"
                    ? "bg-gray-900 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setRightSidebarTab("suggestions")}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  rightSidebarTab === "suggestions"
                    ? "bg-gray-900 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💡 Suggestions
              </button>
              <button
                onClick={() => setRightSidebarTab("bmad")}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  rightSidebarTab === "bmad"
                    ? "bg-gray-900 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🚀 BMAD
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightSidebarTab === "chat" && (
                <div className="h-full p-4">
                  <AIChat title="Code Assistant" compact className="h-full" />
                </div>
              )}
              {rightSidebarTab === "suggestions" && (
                <div className="h-full p-4 overflow-y-auto">
                  <CodeSuggestionsPanel />
                </div>
              )}
              {rightSidebarTab === "bmad" && (
                <div className="h-full p-4 overflow-y-auto text-white">
                  <h3 className="text-lg font-bold mb-4">BMAD Workflow</h3>
                  {workflowState.isRunning ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Running workflow...</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Current Phase: {workflowState.currentPhase}</div>
                        <div className="text-sm text-gray-400">
                          Progress: {Math.round(workflowState.progress * 100)}%
                        </div>
                      </div>
                    </div>
                  ) : workflowState.result ? (
                    <div className="space-y-4">
                      <div className="text-green-500 font-medium">✓ Workflow Complete</div>
                      {workflowState.result.requirements && (
                        <div>
                          <h4 className="font-medium mb-2">Requirements</h4>
                          <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(workflowState.result.requirements, null, 2)}
                          </pre>
                        </div>
                      )}
                      {workflowState.result.code && (
                        <div>
                          <h4 className="font-medium mb-2">Generated Code</h4>
                          <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(workflowState.result.code, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <p>Click "AI Workflow" button to run BMAD workflow on the current file.</p>
                      <p className="mt-2">The workflow will:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Analyze requirements</li>
                        <li>Design technical approach</li>
                        <li>Create architecture</li>
                        <li>Generate code</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <StatusBar />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {dialog && (
        <FileOperationDialog
          {...dialog}
          onConfirm={(value) => handleFileOperation(dialog.type, value)}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}

import { StatusBar } from "../components/StatusBar"

export default EditorPage
