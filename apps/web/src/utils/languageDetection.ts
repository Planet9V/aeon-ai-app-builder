import type { SupportedLanguage } from "@opencode/ui-components"

const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  html: "html",
  htm: "html",
  css: "css",
  scss: "css",
  sass: "css",
  py: "python",
  rs: "rust",
  go: "go",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sql: "sql",
}

export function detectLanguageFromPath(path: string): SupportedLanguage {
  const extension = path.split(".").pop()?.toLowerCase()
  if (!extension) return "typescript"

  return LANGUAGE_MAP[extension] || "typescript"
}

export function getLanguageIcon(language: SupportedLanguage): string {
  const icons: Record<SupportedLanguage, string> = {
    typescript: "📘",
    javascript: "📙",
    json: "📋",
    markdown: "📝",
    html: "🌐",
    css: "🎨",
    python: "🐍",
    rust: "🦀",
    go: "🐹",
    yaml: "⚙️",
    toml: "⚙️",
    sql: "🗄️",
  }

  return icons[language] || "📄"
}

export function getLanguageDisplayName(language: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    json: "JSON",
    markdown: "Markdown",
    html: "HTML",
    css: "CSS",
    python: "Python",
    rust: "Rust",
    go: "Go",
    yaml: "YAML",
    toml: "TOML",
    sql: "SQL",
  }

  return names[language] || language
}
