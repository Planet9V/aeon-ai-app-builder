const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

export interface FileEntry {
  name: string
  path: string
  type: "file" | "directory"
  size?: number
  modified?: string
  extension?: string
}

export interface FileContent {
  path: string
  content: string
  size: number
  encoding: string
  language?: string
}

export const filesApi = {
  async list(dirPath: string = "/"): Promise<FileEntry[]> {
    const response = await fetch(`${API_BASE}/api/files?path=${encodeURIComponent(dirPath)}`)
    if (!response.ok) throw new Error("Failed to list files")
    const data = await response.json()
    return data.files
  },

  async read(filePath: string): Promise<FileContent> {
    const response = await fetch(`${API_BASE}/api/files/${encodeURIComponent(filePath)}`)
    if (!response.ok) throw new Error("Failed to read file")
    return response.json()
  },

  async create(filePath: string, content: string = "", type: "file" | "directory" = "file"): Promise<void> {
    const response = await fetch(`${API_BASE}/api/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath, content, type }),
    })
    if (!response.ok) throw new Error("Failed to create file")
  },

  async update(filePath: string, content: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/files/${encodeURIComponent(filePath)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (!response.ok) throw new Error("Failed to update file")
  },

  async delete(filePath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/files/${encodeURIComponent(filePath)}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete file")
  },

  async rename(oldPath: string, newPath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/files/${encodeURIComponent(oldPath)}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPath }),
    })
    if (!response.ok) throw new Error("Failed to rename file")
  },
}
