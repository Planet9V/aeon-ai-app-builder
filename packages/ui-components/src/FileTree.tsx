import { useState } from "react"

export interface FileTreeNode {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  children?: FileTreeNode[]
  isExpanded?: boolean
}

interface FileTreeNodeProps {
  node: FileTreeNode
  level: number
  onSelect: (node: FileTreeNode) => void
  onToggle: (node: FileTreeNode) => void
  onContextMenu?: (e: React.MouseEvent, node: FileTreeNode) => void
  selectedPath: string | null
  expandedPaths: Set<string>
}

function TreeNode({ node, level, onSelect, onToggle, onContextMenu, selectedPath, expandedPaths }: FileTreeNodeProps) {
  const isSelected = selectedPath === node.path
  const isExpanded = expandedPaths.has(node.path)
  const hasChildren = node.children && node.children.length > 0

  const icon = node.type === "directory" ? (isExpanded ? "📂" : "📁") : getFileIcon(node.name)

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === "directory") {
            onToggle(node)
          } else {
            onSelect(node)
          }
        }}
        onContextMenu={(e) => onContextMenu?.(e, node)}
        className={`w-full text-left px-2 py-1 text-sm flex items-center gap-2 transition ${
          isSelected ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === "directory" && <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>}
        <span>{icon}</span>
        <span className="flex-1 truncate">{node.name}</span>
      </button>

      {node.type === "directory" && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FileTreeProps {
  nodes: FileTreeNode[]
  onSelectFile: (node: FileTreeNode) => void
  onToggleDirectory: (node: FileTreeNode) => void
  onContextMenu?: (e: React.MouseEvent, node: FileTreeNode) => void
  selectedPath: string | null
  expandedPaths: Set<string>
}

export function FileTree({
  nodes,
  onSelectFile,
  onToggleDirectory,
  onContextMenu,
  selectedPath,
  expandedPaths,
}: FileTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        <p>No files to display</p>
      </div>
    )
  }

  return (
    <div className="select-none">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelectFile}
          onToggle={onToggleDirectory}
          onContextMenu={onContextMenu}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
        />
      ))}
    </div>
  )
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()

  const iconMap: Record<string, string> = {
    ts: "📘",
    tsx: "📘",
    js: "📙",
    jsx: "📙",
    json: "📋",
    md: "📝",
    html: "🌐",
    css: "🎨",
    py: "🐍",
    rs: "🦀",
    go: "🐹",
    yaml: "⚙️",
    yml: "⚙️",
    toml: "⚙️",
    sql: "🗄️",
    png: "🖼️",
    jpg: "🖼️",
    svg: "🖼️",
    git: "🔀",
    lock: "🔒",
  }

  return iconMap[ext || ""] || "📄"
}

export default FileTree
