export interface EditorContext {
  filePath: string
  language: string
  content: string
  selection?: string
  cursorPosition?: { line: number; column: number }
  surroundingCode?: string
}

export interface ProjectContext {
  openFiles: string[]
  currentFile: string
  fileTree: string[]
  totalFiles: number
}

export function extractEditorContext(
  content: string,
  filePath: string,
  language: string,
  selection?: { start: number; end: number },
  cursorLine?: number,
): EditorContext {
  const context: EditorContext = {
    filePath,
    language,
    content,
  }

  if (selection) {
    context.selection = content.slice(selection.start, selection.end)
  }

  if (cursorLine !== undefined) {
    const lines = content.split("\n")
    const startLine = Math.max(0, cursorLine - 5)
    const endLine = Math.min(lines.length, cursorLine + 5)
    context.surroundingCode = lines.slice(startLine, endLine).join("\n")
  }

  return context
}

export function extractProjectContext(openFiles: string[], currentFile: string, fileTree: string[]): ProjectContext {
  return {
    openFiles,
    currentFile,
    fileTree,
    totalFiles: fileTree.length,
  }
}

export function buildAIPromptContext(editorContext: EditorContext, projectContext?: ProjectContext): string {
  let prompt = `File: ${editorContext.filePath}\nLanguage: ${editorContext.language}\n\n`

  if (editorContext.selection) {
    prompt += `Selected Code:\n\`\`\`${editorContext.language}\n${editorContext.selection}\n\`\`\`\n\n`
  }

  if (editorContext.surroundingCode) {
    prompt += `Surrounding Code:\n\`\`\`${editorContext.language}\n${editorContext.surroundingCode}\n\`\`\`\n\n`
  } else {
    const truncatedContent = editorContext.content.slice(0, 2000)
    prompt += `Code:\n\`\`\`${editorContext.language}\n${truncatedContent}${
      editorContext.content.length > 2000 ? "\n... (truncated)" : ""
    }\n\`\`\`\n\n`
  }

  if (projectContext) {
    prompt += `Project Context:\n`
    prompt += `- Current File: ${projectContext.currentFile}\n`
    prompt += `- Open Files: ${projectContext.openFiles.length}\n`
    prompt += `- Total Files: ${projectContext.totalFiles}\n`
  }

  return prompt
}

export function extractCodeForSuggestions(
  content: string,
  language: string,
  maxLines: number = 50,
): { code: string; isTruncated: boolean } {
  const lines = content.split("\n")
  const isTruncated = lines.length > maxLines

  return {
    code: isTruncated ? lines.slice(0, maxLines).join("\n") : content,
    isTruncated,
  }
}

export function extractImportsAndTypes(content: string, language: string): string[] {
  const imports: string[] = []
  const lines = content.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()

    if (language === "typescript" || language === "javascript") {
      if (
        trimmed.startsWith("import ") ||
        trimmed.startsWith("export ") ||
        trimmed.startsWith("type ") ||
        trimmed.startsWith("interface ")
      ) {
        imports.push(trimmed)
      }
    } else if (language === "python") {
      if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
        imports.push(trimmed)
      }
    } else if (language === "java") {
      if (trimmed.startsWith("import ") || trimmed.startsWith("package ")) {
        imports.push(trimmed)
      }
    }
  }

  return imports
}
