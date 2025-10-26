import { readdir, readFile, writeFile, mkdir, unlink, rm, stat, rename } from "fs/promises"
import { join, dirname, basename, extname, relative, normalize, sep } from "path"
import { existsSync } from "fs"

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

export class FileSystemService {
  private basePath: string

  constructor(basePath: string = process.cwd()) {
    this.basePath = normalize(basePath)
  }

  private validatePath(requestedPath: string): string {
    const normalized = normalize(join(this.basePath, requestedPath))

    if (!normalized.startsWith(this.basePath)) {
      throw new Error("Path traversal detected")
    }

    return normalized
  }

  private shouldIgnore(name: string): boolean {
    const ignoredPatterns = [
      "node_modules",
      ".git",
      ".DS_Store",
      "dist",
      "build",
      ".next",
      ".turbo",
      "coverage",
      ".env.local",
      ".env.development.local",
      ".env.test.local",
      ".env.production.local",
    ]

    return ignoredPatterns.some((pattern) => name.includes(pattern))
  }

  async listFiles(dirPath: string = "/"): Promise<FileEntry[]> {
    const fullPath = this.validatePath(dirPath)

    try {
      const entries = await readdir(fullPath, { withFileTypes: true })
      const files: FileEntry[] = []

      for (const entry of entries) {
        if (this.shouldIgnore(entry.name)) continue

        const entryPath = join(fullPath, entry.name)
        const relativePath = relative(this.basePath, entryPath)
        const stats = await stat(entryPath)

        files.push({
          name: entry.name,
          path: relativePath,
          type: entry.isDirectory() ? "directory" : "file",
          size: stats.size,
          modified: stats.mtime.toISOString(),
          extension: entry.isFile() ? extname(entry.name).slice(1) : undefined,
        })
      }

      return files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name)
        return a.type === "directory" ? -1 : 1
      })
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        throw new Error(`Directory not found: ${dirPath}`)
      }
      throw error
    }
  }

  async readFile(filePath: string): Promise<FileContent> {
    const fullPath = this.validatePath(filePath)

    try {
      const stats = await stat(fullPath)
      if (stats.isDirectory()) {
        throw new Error("Cannot read directory as file")
      }

      const content = await readFile(fullPath, "utf-8")

      return {
        path: filePath,
        content,
        size: stats.size,
        encoding: "utf-8",
        language: this.detectLanguage(filePath),
      }
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        throw new Error(`File not found: ${filePath}`)
      }
      throw error
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const fullPath = this.validatePath(filePath)
    const dir = dirname(fullPath)

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    await writeFile(fullPath, content, "utf-8")
  }

  async createFile(filePath: string, content: string = ""): Promise<void> {
    const fullPath = this.validatePath(filePath)

    if (existsSync(fullPath)) {
      throw new Error(`File already exists: ${filePath}`)
    }

    await this.writeFile(filePath, content)
  }

  async createDirectory(dirPath: string): Promise<void> {
    const fullPath = this.validatePath(dirPath)

    if (existsSync(fullPath)) {
      throw new Error(`Directory already exists: ${dirPath}`)
    }

    await mkdir(fullPath, { recursive: true })
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = this.validatePath(filePath)

    try {
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        await rm(fullPath, { recursive: true })
      } else {
        await unlink(fullPath)
      }
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        throw new Error(`Path not found: ${filePath}`)
      }
      throw error
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const fullOldPath = this.validatePath(oldPath)
    const fullNewPath = this.validatePath(newPath)

    if (existsSync(fullNewPath)) {
      throw new Error(`Destination already exists: ${newPath}`)
    }

    await rename(fullOldPath, fullNewPath)
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    await this.renameFile(sourcePath, destPath)
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = this.validatePath(filePath)
    return existsSync(fullPath)
  }

  private detectLanguage(filePath: string): string {
    const ext = extname(filePath).toLowerCase()
    const languageMap: Record<string, string> = {
      ".ts": "typescript",
      ".tsx": "typescript",
      ".js": "javascript",
      ".jsx": "javascript",
      ".json": "json",
      ".md": "markdown",
      ".html": "html",
      ".css": "css",
      ".py": "python",
      ".rs": "rust",
      ".go": "go",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".toml": "toml",
      ".sql": "sql",
    }

    return languageMap[ext] || "plaintext"
  }
}

let fsInstance: FileSystemService | null = null

export function getFileSystemService(basePath?: string): FileSystemService {
  if (!fsInstance || basePath) {
    fsInstance = new FileSystemService(basePath)
  }
  return fsInstance
}

export default FileSystemService
