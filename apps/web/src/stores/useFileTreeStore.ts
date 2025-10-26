import { create } from "zustand"

export interface FileTreeNode {
  id: string
  name: string
  path: string
  type: "file" | "directory"
  children?: FileTreeNode[]
  isExpanded?: boolean
  isLoaded?: boolean
}

interface FileTreeStore {
  rootNodes: FileTreeNode[]
  selectedPath: string | null
  expandedPaths: Set<string>

  setRootNodes: (nodes: FileTreeNode[]) => void
  toggleExpand: (path: string) => void
  selectNode: (path: string) => void
  addNode: (parentPath: string, node: FileTreeNode) => void
  removeNode: (path: string) => void
  renameNode: (oldPath: string, newPath: string) => void
  loadChildren: (path: string, children: FileTreeNode[]) => void
}

export const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  rootNodes: [],
  selectedPath: null,
  expandedPaths: new Set(),

  setRootNodes: (nodes) => set({ rootNodes: nodes }),

  toggleExpand: (path) => {
    set((state) => {
      const newExpanded = new Set(state.expandedPaths)
      if (newExpanded.has(path)) {
        newExpanded.delete(path)
      } else {
        newExpanded.add(path)
      }
      return { expandedPaths: newExpanded }
    })
  },

  selectNode: (path) => set({ selectedPath: path }),

  addNode: (parentPath, node) => {
    set((state) => {
      const addToTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map((n) => {
          if (n.path === parentPath) {
            return {
              ...n,
              children: [...(n.children || []), node].sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name)
                return a.type === "directory" ? -1 : 1
              }),
            }
          }
          if (n.children) {
            return { ...n, children: addToTree(n.children) }
          }
          return n
        })
      }

      return { rootNodes: addToTree(state.rootNodes) }
    })
  },

  removeNode: (path) => {
    set((state) => {
      const removeFromTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes
          .filter((n) => n.path !== path)
          .map((n) => {
            if (n.children) {
              return { ...n, children: removeFromTree(n.children) }
            }
            return n
          })
      }

      return { rootNodes: removeFromTree(state.rootNodes) }
    })
  },

  renameNode: (oldPath, newPath) => {
    set((state) => {
      const renameInTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map((n) => {
          if (n.path === oldPath) {
            return {
              ...n,
              path: newPath,
              name: newPath.split("/").pop() || newPath,
            }
          }
          if (n.children) {
            return { ...n, children: renameInTree(n.children) }
          }
          return n
        })
      }

      return { rootNodes: renameInTree(state.rootNodes) }
    })
  },

  loadChildren: (path, children) => {
    set((state) => {
      const loadInTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map((n) => {
          if (n.path === path) {
            return { ...n, children, isLoaded: true }
          }
          if (n.children) {
            return { ...n, children: loadInTree(n.children) }
          }
          return n
        })
      }

      return { rootNodes: loadInTree(state.rootNodes) }
    })
  },
}))
