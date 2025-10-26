# Technical Specifications
## OpenCode Development Platform

**Version:** 1.0  
**Date:** 2024-10-25  
**Status:** Draft  
**Related:** [PRD.md](./PRD.md), [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Component Specifications](#component-specifications)
4. [Data Models](#data-models)
5. [API Specifications](#api-specifications)
6. [Database Schemas](#database-schemas)
7. [Security Specifications](#security-specifications)
8. [Performance Specifications](#performance-specifications)

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │  Editor  │ │   Chat   │ │  Graph   │ │ Terminal │ │ │
│  │  │ (Monaco) │ │   (AI)   │ │  (D3.js) │ │ (xterm)  │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         State Management (Zustand)               │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                    WebSocket + HTTP/2                        │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    Backend Server (Bun)                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 HTTP Server (Hono)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌─────────────┬──────────┴───────────┬──────────────────┐ │
│  │             │                      │                  │ │
│  │  File API   │   AI Service         │  Graph Service   │ │
│  │             │                      │                  │ │
│  └─────────────┴──────────────────────┴──────────────────┘ │
│         │               │                       │           │
│         │               │                       │           │
│    ┌────────┐    ┌─────────────┐        ┌─────────────┐   │
│    │  FS    │    │ OpenRouter  │        │  Memgraph   │   │
│    │ (disk) │    │     API     │        │   (Docker)  │   │
│    └────────┘    └─────────────┘        └─────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SQLite (Taskmaster)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action (e.g., "Open file")
      ↓
React Component (FileTree)
      ↓
Zustand Store (dispatch action)
      ↓
API Call (HTTP/WebSocket)
      ↓
Hono Router (backend)
      ↓
File Service (read from disk)
      ↓
Response (file content)
      ↓
Zustand Store (update state)
      ↓
React Component (re-render)
      ↓
Monaco Editor (display content)
```

---

## Technology Stack

### Frontend Stack

```typescript
{
  // Core
  "framework": "React 18.2+",
  "language": "TypeScript 5.0+",
  "bundler": "Vite 5.0+",
  
  // Editor
  "editor": "@monaco-editor/react 4.6+",
  "syntax": "monaco-editor 0.45+",
  
  // UI
  "styling": "tailwindcss 3.4+",
  "components": "shadcn/ui",
  "icons": "lucide-react 0.294+",
  
  // State
  "state-management": "zustand 4.4+",
  "queries": "@tanstack/react-query 5.0+",
  
  // Graph Visualization
  "graph-lib": "d3.js 7.8+",
  "graph-layout": "d3-force",
  
  // Terminal
  "terminal": "xterm 5.3+",
  "terminal-addon": "xterm-addon-fit, xterm-addon-web-links",
  
  // Utilities
  "routing": "react-router-dom 6.20+",
  "markdown": "react-markdown 9.0+",
  "code-highlighting": "prismjs 1.29+"
}
```

### Backend Stack

```typescript
{
  // Runtime
  "runtime": "bun 1.0+",
  
  // Framework
  "web-framework": "hono 3.11+",
  "websocket": "hono websocket helper",
  
  // Database
  "relational": "better-sqlite3 9.2+",
  "graph": "memgraph 2.12+",
  "graph-client": "neo4j-driver 5.15+",
  
  // AI
  "ai-sdk": "openrouter (custom SDK)",
  
  // File System
  "fs": "node:fs/promises",
  "watch": "chokidar 3.5+",
  
  // Git
  "git": "isomorphic-git 1.25+",
  
  // Utilities
  "validation": "zod 3.22+",
  "logging": "pino 8.16+",
  "env": "dotenv 16.3+"
}
```

### Infrastructure

```yaml
development:
  platform: Docker Compose
  services:
    - memgraph:2.12
    - opencode-backend:latest
    
production:
  platform: Docker
  orchestration: Optional Kubernetes
  reverse-proxy: Caddy/Nginx
  ssl: Let's Encrypt
```

---

## Component Specifications

### 1. Monaco Editor Component

```typescript
/**
 * Main code editor component using Monaco Editor
 */
interface EditorComponentProps {
  file: FileNode | null
  onSave: (content: string) => Promise<void>
  onClose: () => void
  theme: 'vs-dark' | 'vs-light'
}

interface EditorState {
  content: string
  language: string
  isDirty: boolean
  cursorPosition: { line: number; column: number }
  selection: { start: Position; end: Position } | null
}

// Monaco Editor Configuration
const editorConfig: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily: 'Fira Code, monospace',
  lineNumbers: 'on',
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  suggest: {
    showWords: true,
    showSnippets: true,
  },
}

// Language Detection
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'md': 'markdown',
    'py': 'python',
    'go': 'go',
    'rs': 'rust',
  }
  return languageMap[ext || ''] || 'plaintext'
}
```

### 2. File Tree Component

```typescript
/**
 * File tree explorer with drag-drop and context menu
 */
interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  size?: number
  modified?: Date
}

interface FileTreeProps {
  root: string
  onFileSelect: (node: FileNode) => void
  onFileCreate: (parent: FileNode, name: string, type: 'file' | 'directory') => Promise<void>
  onFileDelete: (node: FileNode) => Promise<void>
  onFileRename: (node: FileNode, newName: string) => Promise<void>
  onFileMove: (source: FileNode, target: FileNode) => Promise<void>
}

interface FileTreeState {
  tree: FileNode
  expanded: Set<string>
  selected: string | null
  filter: string
  contextMenu: {
    show: boolean
    x: number
    y: number
    node: FileNode | null
  }
}

// File System Operations
class FileSystemService {
  async readDirectory(path: string): Promise<FileNode[]>
  async readFile(path: string): Promise<string>
  async writeFile(path: string, content: string): Promise<void>
  async createFile(path: string): Promise<void>
  async createDirectory(path: string): Promise<void>
  async deleteFile(path: string): Promise<void>
  async renameFile(oldPath: string, newPath: string): Promise<void>
  async moveFile(source: string, destination: string): Promise<void>
}
```

### 3. AI Chat Component

```typescript
/**
 * Chat interface for AI assistance
 */
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: {
    file?: string
    selection?: string
    project?: string
  }
}

interface ChatComponentProps {
  projectId: string
  currentFile: string | null
  onCodeInsert: (code: string) => void
}

interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  currentAgent: 'general' | 'analyst' | 'architect'
  context: ChatContext
}

interface ChatContext {
  project: {
    name: string
    files: string[]
    brief?: string
    architecture?: string
  }
  editor: {
    currentFile: string | null
    selection: string | null
    cursorPosition: Position | null
  }
}

// AI Service
class AIService {
  async sendMessage(
    message: string, 
    context: ChatContext, 
    agent: AgentType
  ): Promise<AsyncIterableIterator<string>>
  
  async generateBrief(
    conversation: ChatMessage[]
  ): Promise<string>
  
  async generateArchitecture(
    brief: string, 
    conversation: ChatMessage[]
  ): Promise<string>
}
```

### 4. Knowledge Graph Component

```typescript
/**
 * Graph visualization using D3.js
 */
interface GraphNode {
  id: string
  label: string
  type: 'file' | 'component' | 'function' | 'document' | 'feature'
  properties: Record<string, any>
  x?: number
  y?: number
}

interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'imports' | 'uses' | 'implements' | 'spawns' | 'guides'
  properties?: Record<string, any>
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface GraphComponentProps {
  projectId: string
  filter?: {
    nodeTypes?: string[]
    edgeTypes?: string[]
    search?: string
  }
  onNodeClick: (node: GraphNode) => void
  onNodeDoubleClick: (node: GraphNode) => void
}

// Graph Service
class GraphService {
  async getProjectGraph(projectId: string): Promise<GraphData>
  async updateGraph(projectId: string): Promise<void>
  async queryGraph(cypher: string): Promise<GraphNode[]>
  async addNode(node: GraphNode): Promise<void>
  async addEdge(edge: GraphEdge): Promise<void>
  async deleteNode(nodeId: string): Promise<void>
}

// D3 Force Simulation Config
const simulationConfig = {
  forces: {
    charge: d3.forceManyBody().strength(-500),
    link: d3.forceLink().distance(100),
    center: d3.forceCenter(),
    collision: d3.forceCollide().radius(50),
  },
  alpha: 1,
  alphaDecay: 0.02,
  velocityDecay: 0.4,
}
```

### 5. Terminal Component

```typescript
/**
 * Embedded terminal using xterm.js
 */
interface TerminalComponentProps {
  projectPath: string
  onCommand: (command: string) => void
}

interface TerminalState {
  terminals: TerminalTab[]
  activeTab: string
}

interface TerminalTab {
  id: string
  title: string
  cwd: string
  history: string[]
}

// Terminal Service
class TerminalService {
  async createTerminal(cwd: string): Promise<string>
  async executeCommand(terminalId: string, command: string): Promise<void>
  async sendInput(terminalId: string, input: string): Promise<void>
  async resize(terminalId: string, cols: number, rows: number): Promise<void>
  async destroy(terminalId: string): Promise<void>
}

// WebSocket Protocol for Terminal
interface TerminalMessage {
  type: 'output' | 'input' | 'resize' | 'exit'
  data: string | { cols: number; rows: number }
  terminalId: string
}
```

---

## Data Models

### Project Model

```typescript
interface Project {
  id: string
  name: string
  path: string
  type: 'react' | 'vue' | 'vanilla' | 'node'
  created: Date
  updated: Date
  config: ProjectConfig
  metadata: ProjectMetadata
}

interface ProjectConfig {
  entry: string // e.g., 'src/index.ts'
  buildCommand: string // e.g., 'npm run build'
  devCommand: string // e.g., 'npm run dev'
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  port: number
  aiModel: string
  cacheEnabled: boolean
}

interface ProjectMetadata {
  documentsPath: string // '.opencode/docs'
  graphDataPath: string // '.opencode/knowledge'
  taskmasterDbPath: string // '.opencode/taskmaster.db'
  lastOpened: Date
  fileCount: number
  lineCount: number
}
```

### Document Model

```typescript
interface Document {
  id: string
  projectId: string
  type: 'brief' | 'architecture' | 'story' | 'wiki'
  title: string
  content: string // markdown
  author: string
  created: Date
  updated: Date
  version: number
  metadata: DocumentMetadata
}

interface DocumentMetadata {
  tags: string[]
  status: 'draft' | 'review' | 'approved'
  relatedDocs: string[]
  linkedFiles: string[]
  wordCount: number
}

// Brief Document Structure
interface Brief extends Document {
  type: 'brief'
  sections: {
    goal: string
    scope: string
    users: string
    successCriteria: string
    outOfScope: string
  }
}

// Architecture Document Structure
interface Architecture extends Document {
  type: 'architecture'
  sections: {
    overview: string
    techStack: TechStack
    components: ComponentSpec[]
    dataModels: DataModel[]
    apiSpecs: APISpec[]
    deployment: string
  }
}

interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  infrastructure: string[]
  thirdParty: string[]
}
```

### Graph Node Models

```typescript
// File Node
interface FileGraphNode {
  id: string // file path
  type: 'file'
  properties: {
    name: string
    path: string
    language: string
    size: number
    linesOfCode: number
    lastModified: Date
  }
}

// Component Node
interface ComponentGraphNode {
  id: string // component identifier
  type: 'component'
  properties: {
    name: string
    filePath: string
    componentType: 'class' | 'function' | 'hook'
    exported: boolean
    props?: Record<string, string>
  }
}

// Document Node
interface DocumentGraphNode {
  id: string // document ID
  type: 'document'
  properties: {
    title: string
    docType: 'brief' | 'architecture' | 'story'
    status: string
    author: string
    created: Date
  }
}

// Relationship Types
type GraphRelationship = 
  | { type: 'IMPORTS', from: string, to: string }
  | { type: 'USES', from: string, to: string }
  | { type: 'IMPLEMENTS', from: string, to: string }
  | { type: 'SPAWNS', from: string, to: string }
  | { type: 'GUIDES', from: string, to: string }
  | { type: 'AUTHORED', from: string, to: string }
  | { type: 'CALLS', from: string, to: string }
```

---

## API Specifications

### REST API Endpoints

#### File Operations

```typescript
// GET /api/projects/:projectId/files
interface GetFilesRequest {
  projectId: string
  path?: string // optional subdirectory
}
interface GetFilesResponse {
  files: FileNode[]
}

// GET /api/projects/:projectId/files/content
interface GetFileContentRequest {
  projectId: string
  path: string
}
interface GetFileContentResponse {
  content: string
  encoding: 'utf-8'
  size: number
}

// POST /api/projects/:projectId/files
interface CreateFileRequest {
  projectId: string
  path: string
  type: 'file' | 'directory'
  content?: string
}
interface CreateFileResponse {
  success: boolean
  file: FileNode
}

// PUT /api/projects/:projectId/files
interface UpdateFileRequest {
  projectId: string
  path: string
  content: string
}
interface UpdateFileResponse {
  success: boolean
  updated: Date
}

// DELETE /api/projects/:projectId/files
interface DeleteFileRequest {
  projectId: string
  path: string
}
interface DeleteFileResponse {
  success: boolean
}
```

#### AI Operations

```typescript
// POST /api/ai/chat
interface ChatRequest {
  projectId: string
  message: string
  context: ChatContext
  agent: 'general' | 'analyst' | 'architect'
  stream: boolean
}
interface ChatResponse {
  // If stream: false
  response: string
  tokens: { input: number; output: number }
  
  // If stream: true (SSE)
  // data: <chunk>
  // data: <chunk>
  // data: [DONE]
}

// POST /api/ai/generate-brief
interface GenerateBriefRequest {
  projectId: string
  conversation: ChatMessage[]
}
interface GenerateBriefResponse {
  brief: Brief
  saved: boolean
}

// POST /api/ai/generate-architecture
interface GenerateArchitectureRequest {
  projectId: string
  briefId: string
  conversation: ChatMessage[]
}
interface GenerateArchitectureResponse {
  architecture: Architecture
  saved: boolean
}
```

#### Graph Operations

```typescript
// GET /api/projects/:projectId/graph
interface GetGraphRequest {
  projectId: string
  filter?: {
    nodeTypes?: string[]
    edgeTypes?: string[]
    depth?: number
  }
}
interface GetGraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
  stats: {
    nodeCount: number
    edgeCount: number
  }
}

// POST /api/projects/:projectId/graph/query
interface GraphQueryRequest {
  projectId: string
  cypher: string
  params?: Record<string, any>
}
interface GraphQueryResponse {
  results: any[]
  stats: {
    nodesCreated: number
    relationshipsCreated: number
    propertiesSet: number
  }
}

// PUT /api/projects/:projectId/graph/sync
interface SyncGraphRequest {
  projectId: string
  full: boolean // full re-index or incremental
}
interface SyncGraphResponse {
  success: boolean
  nodesAdded: number
  edgesAdded: number
  duration: number
}
```

### WebSocket API

```typescript
// Terminal WebSocket
// ws://localhost:3000/ws/terminal/:terminalId

interface TerminalWSMessage {
  type: 'input' | 'output' | 'resize' | 'exit'
  data: string | { cols: number; rows: number }
}

// File Watcher WebSocket
// ws://localhost:3000/ws/files/:projectId

interface FileWatchMessage {
  type: 'change' | 'create' | 'delete'
  path: string
  content?: string
}

// AI Stream WebSocket (alternative to SSE)
// ws://localhost:3000/ws/ai/stream

interface AIStreamMessage {
  type: 'chunk' | 'done' | 'error'
  content?: string
  error?: string
  tokens?: { input: number; output: number }
}
```

---

## Database Schemas

### SQLite Schema (Taskmaster)

```sql
-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  config JSON NOT NULL,
  metadata JSON NOT NULL
);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  metadata JSON,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Document versions (for history)
CREATE TABLE document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  author TEXT,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE (document_id, version)
);

-- File index (for quick search)
CREATE TABLE file_index (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  language TEXT,
  size INTEGER,
  lines_of_code INTEGER,
  last_modified TEXT,
  content_hash TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (project_id, path)
);

CREATE INDEX idx_file_index_project ON file_index(project_id);
CREATE INDEX idx_file_index_name ON file_index(name);
CREATE INDEX idx_documents_project ON documents(project_id);
```

### Memgraph Schema (Cypher)

```cypher
-- Node constraints
CREATE CONSTRAINT ON (f:File) ASSERT f.id IS UNIQUE;
CREATE CONSTRAINT ON (c:Component) ASSERT c.id IS UNIQUE;
CREATE CONSTRAINT ON (d:Document) ASSERT d.id IS UNIQUE;
CREATE CONSTRAINT ON (func:Function) ASSERT func.id IS UNIQUE;

-- Indexes for performance
CREATE INDEX ON :File(path);
CREATE INDEX ON :Component(name);
CREATE INDEX ON :Document(type);
CREATE INDEX ON :Function(name);

-- Sample data model
// File node
CREATE (f:File {
  id: '/src/App.tsx',
  name: 'App.tsx',
  path: '/src/App.tsx',
  language: 'typescript',
  size: 1024,
  linesOfCode: 50,
  lastModified: datetime()
})

// Component node
CREATE (c:Component {
  id: 'App',
  name: 'App',
  filePath: '/src/App.tsx',
  componentType: 'function',
  exported: true
})

// Relationship
CREATE (f)-[:CONTAINS]->(c)

// Document node
CREATE (d:Document {
  id: 'brief-001',
  title: 'User Authentication',
  docType: 'brief',
  status: 'approved',
  created: datetime()
})

// Feature node
CREATE (feat:Feature {
  id: 'auth',
  name: 'User Authentication',
  status: 'in_progress'
})

// Relationships
CREATE (d)-[:DESCRIBES]->(feat)
CREATE (feat)-[:IMPLEMENTED_IN]->(c)
```

---

## Security Specifications

### Authentication & Authorization

```typescript
// Session management (for future team features)
interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// API Key encryption
class SecureStorage {
  encrypt(value: string): string
  decrypt(encrypted: string): string
  store(key: string, value: string): void
  retrieve(key: string): string | null
}

// Implementation uses crypto
import { createCipher, createDecipher } from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = process.env.ENCRYPTION_KEY // 32-byte key
```

### Input Validation

```typescript
import { z } from 'zod'

// File path validation
const filePathSchema = z.string()
  .regex(/^[a-zA-Z0-9\/\._-]+$/)
  .max(1024)

// Project validation
const projectSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().regex(/^[a-zA-Z0-9\/\._-]+$/),
  type: z.enum(['react', 'vue', 'vanilla', 'node']),
})

// Chat message validation
const chatMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  context: z.object({
    file: z.string().optional(),
    selection: z.string().max(50000).optional(),
  }),
})
```

### CORS Configuration

```typescript
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}
```

### Rate Limiting

```typescript
interface RateLimitConfig {
  windowMs: number // time window
  max: number // max requests per window
}

const rateLimits: Record<string, RateLimitConfig> = {
  '/api/ai/chat': { windowMs: 60000, max: 30 }, // 30 per minute
  '/api/files': { windowMs: 60000, max: 300 }, // 300 per minute
  '/api/graph': { windowMs: 60000, max: 60 }, // 60 per minute
}
```

---

## Performance Specifications

### Caching Strategy

```typescript
// Multi-level caching
interface CacheConfig {
  memory: {
    enabled: boolean
    maxSize: number // in bytes
    ttl: number // in seconds
  }
  disk: {
    enabled: boolean
    path: string
    maxSize: number
  }
}

// Cache implementation
class CacheService {
  // L1: In-memory cache (LRU)
  private memCache: Map<string, CacheEntry>
  
  // L2: Disk cache (SQLite)
  private diskCache: Database
  
  async get(key: string): Promise<any>
  async set(key: string, value: any, ttl?: number): Promise<void>
  async invalidate(pattern: string): Promise<number>
}

// What to cache
const cacheStrategy = {
  'ai-responses': { ttl: 3600, storage: 'disk' },
  'file-content': { ttl: 60, storage: 'memory' },
  'graph-queries': { ttl: 300, storage: 'memory' },
  'project-config': { ttl: 600, storage: 'memory' },
}
```

### Lazy Loading

```typescript
// Code splitting
const Editor = lazy(() => import('./components/Editor'))
const Graph = lazy(() => import('./components/Graph'))
const Terminal = lazy(() => import('./components/Terminal'))

// File tree virtualization
interface VirtualizedTreeProps {
  itemHeight: number // fixed height per item
  overscan: number // number of items to render outside viewport
  windowHeight: number
}

// Monaco editor lazy model loading
const loadModel = async (uri: string) => {
  const model = monaco.editor.getModel(uri)
  if (!model) {
    const content = await fetchFileContent(uri)
    return monaco.editor.createModel(content, language, uri)
  }
  return model
}
```

### Optimization Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| File open | < 500ms | Time to render in editor |
| File save | < 200ms | Write complete |
| Graph render (1000 nodes) | < 3s | Initial display |
| AI first token | < 1s | SSE first chunk |
| File tree update | < 100ms | Re-render |
| Search (1000 files) | < 500ms | Results displayed |

---

## Error Handling

### Error Types

```typescript
class OpenCodeError extends Error {
  code: string
  statusCode: number
  isOperational: boolean
}

class FileNotFoundError extends OpenCodeError {
  constructor(path: string) {
    super(`File not found: ${path}`)
    this.code = 'FILE_NOT_FOUND'
    this.statusCode = 404
    this.isOperational = true
  }
}

class AIServiceError extends OpenCodeError {
  constructor(message: string) {
    super(message)
    this.code = 'AI_SERVICE_ERROR'
    this.statusCode = 503
    this.isOperational = true
  }
}

class GraphQueryError extends OpenCodeError {
  constructor(query: string, originalError: Error) {
    super(`Graph query failed: ${originalError.message}`)
    this.code = 'GRAPH_QUERY_ERROR'
    this.statusCode = 400
    this.isOperational = true
  }
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId: string
  }
}

// Example
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found: /src/missing.ts",
    "details": {
      "path": "/src/missing.ts",
      "project": "my-app"
    },
    "timestamp": "2024-10-25T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Testing Specifications

### Unit Testing

```typescript
// Test framework: Vitest
import { describe, it, expect, beforeEach } from 'vitest'

describe('FileService', () => {
  it('should read file content', async () => {
    const content = await fileService.readFile('/test.ts')
    expect(content).toBeDefined()
  })
  
  it('should throw FileNotFoundError for missing files', async () => {
    await expect(
      fileService.readFile('/missing.ts')
    ).rejects.toThrow(FileNotFoundError)
  })
})
```

### Integration Testing

```typescript
// API integration tests
describe('POST /api/ai/chat', () => {
  it('should return AI response', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'Hello',
        context: {},
        agent: 'general',
      })
    
    expect(response.status).toBe(200)
    expect(response.body.response).toBeDefined()
  })
})
```

### E2E Testing

```typescript
// Playwright tests
import { test, expect } from '@playwright/test'

test('user can create and edit file', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Create file
  await page.click('[data-testid="new-file"]')
  await page.fill('[data-testid="filename"]', 'test.ts')
  await page.click('[data-testid="confirm"]')
  
  // Edit file
  await page.click('[data-testid="file-test.ts"]')
  await page.fill('.monaco-editor textarea', 'const x = 1')
  
  // Save
  await page.keyboard.press('Control+S')
  
  // Verify
  await expect(page.locator('[data-testid="save-indicator"]')).toHaveText('Saved')
})
```

---

## Deployment Specifications

### Docker Configuration

```dockerfile
# Backend Dockerfile
FROM oven/bun:1.0-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

EXPOSE 3000
CMD ["bun", "run", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  memgraph:
    image: memgraph/memgraph:2.12
    ports:
      - "7687:7687"
    volumes:
      - memgraph-data:/var/lib/memgraph
    
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MEMGRAPH_URI=bolt://memgraph:7687
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    depends_on:
      - memgraph
    volumes:
      - ./projects:/app/projects
      
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  memgraph-data:
```

### Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000

# AI Configuration
OPENROUTER_API_KEY=sk-or-...
DEFAULT_AI_MODEL=openai/gpt-4o-mini
AI_TEMPERATURE=0.7

# Database
MEMGRAPH_URI=bolt://localhost:7687
SQLITE_PATH=./data/taskmaster.db

# Security
ENCRYPTION_KEY=...
JWT_SECRET=...

# Features
ENABLE_CACHING=true
CACHE_TTL=3600

# Logging
LOG_LEVEL=info
```

---

## Monitoring & Logging

### Logging Strategy

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
})

// Log formats
logger.info({ module: 'FileService', action: 'read', path: '/src/App.tsx' }, 'File read')
logger.error({ err: error, module: 'AIService' }, 'AI request failed')
```

### Metrics to Track

```typescript
interface Metrics {
  // Performance
  apiResponseTime: Histogram
  fileOperationTime: Histogram
  aiResponseTime: Histogram
  
  // Usage
  apiRequestCount: Counter
  aiRequestCount: Counter
  fileOperationCount: Counter
  
  // Errors
  errorRate: Counter
  aiErrorRate: Counter
  
  // Business
  projectsCreated: Counter
  documentsGenerated: Counter
  graphNodesCreated: Counter
}
```

---

**Document Status:** Draft  
**Next Review:** 2024-11-01  
**Related Documents:**
- [PRD.md](./PRD.md)
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- [OPERATIONS.md](./OPERATIONS.md)

---

*This is a living document and will be updated as implementation progresses.*
