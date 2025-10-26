# OpenCode Development Platform - Architecture

## 🎯 Vision: AI-Enhanced Web Development Platform

**What This Is:**
A **web-based IDE/development platform** where developers build their applications with:

- AI assistance at every step
- Knowledge graphs tracking project semantics
- Taskmaster organizing development workflow
- BMAD methodology for consistent quality
- Local execution, independent from actual user projects

**What This Is NOT:**

- ❌ A React framework (like OpenSPG)
- ❌ A library developers import
- ❌ Something that runs in production apps

**Think:** Cursor IDE + Replit + Knowledge Graphs + BMAD Method = OpenCode Platform

---

## 🏗️ Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  OpenCode Platform (Web)                    │
│                  [The Development Environment]              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   Web IDE      │  │  AI Assistants │  │  Knowledge   │ │
│  │   • Editor     │  │  • BMAD Agents │  │  Graph       │ │
│  │   • Terminal   │  │  • Code AI     │  │  • Semantic  │ │
│  │   • Preview    │  │  • Chat        │  │  • Relations │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│          │                   │                    │         │
│          └───────────────────┼────────────────────┘         │
│                              │                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Platform Services Layer                   │  │
│  │  • Taskmaster (Workflow)                            │  │
│  │  • Memgraph (Knowledge)                             │  │
│  │  • File System (User Projects)                      │  │
│  │  • Build System (Dev Server)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │  User's Application │
                    │  (Their Code)       │
                    │  • React/Vue/etc    │
                    │  • Backend API      │
                    │  • Database         │
                    └─────────────────────┘
                    [Completely Separate]
```

---

## 🎨 Platform Components

### 1. Web IDE (Frontend)

**Monaco Editor** (VS Code's editor)

```typescript
// Core IDE features
interface WebIDE {
  editor: MonacoEditor
  fileTree: FileExplorer
  terminal: XTerm
  preview: LivePreview
  git: GitIntegration

  // AI-enhanced features
  aiCompletion: CodeCompletion
  aiChat: ChatPanel
  aiRefactor: RefactorAssistant
  aiReview: CodeReviewer
}
```

**Key Features:**

- Multi-file editing
- Syntax highlighting (all languages)
- IntelliSense (AI-powered)
- Terminal access
- Live preview
- Git integration
- Split views

### 2. AI Assistant Layer

**BMAD Agents** (Platform's AI Team)

```typescript
// These run IN THE PLATFORM, help developer
interface PlatformAgents {
  analyst: {
    role: "Help plan features"
    when: "Developer starts new feature"
    output: "Feature brief, requirements"
  }

  architect: {
    role: "Design system architecture"
    when: "Developer needs structure"
    output: "Architecture docs, patterns"
  }

  developer: {
    role: "Generate/modify code"
    when: "Developer asks for implementation"
    output: "Code, tests, docs"
  }

  reviewer: {
    role: "Review code quality"
    when: "Developer commits code"
    output: "Feedback, suggestions"
  }

  debugger: {
    role: "Help fix bugs"
    when: "Developer encounters errors"
    output: "Root cause, fixes"
  }
}
```

### 3. Knowledge Graph (Semantic Layer)

**What Goes in Knowledge Graph:**

```cypher
// USER'S PROJECT SEMANTICS (not OpenCode itself)

// Code Structure
(File)-[:IMPORTS]->(File)
(Component)-[:USES]->(Component)
(Function)-[:CALLS]->(Function)
(Class)-[:EXTENDS]->(Class)

// Feature Development
(Feature)-[:IMPLEMENTED_IN]->(File)
(Bug)-[:FIXED_BY]->(Commit)
(Test)-[:COVERS]->(Function)

// Development History
(Commit)-[:MODIFIES]->(File)
(Developer)-[:AUTHORED]->(Commit)
(Issue)-[:RESOLVED_BY]->(PR)

// AI Assistance
(Question)-[:ANSWERED_BY]->(AIResponse)
(Code)-[:GENERATED_BY]->(AIAgent)
(Refactor)-[:SUGGESTED_BY]->(AIAgent)

// BMAD Workflow
(Brief)-[:SPAWNS]->(Story)
(Story)-[:IMPLEMENTS]->(Feature)
(Architecture)-[:GUIDES]->(Implementation)
```

**Key Point:** Knowledge graph tracks **USER'S application**, not OpenCode platform

### 4. Taskmaster (Workflow Engine)

**Project-Specific Workflow:**

```typescript
// Each user project has its own workflow
interface ProjectWorkflow {
  // Planning
  briefs: Brief[] // Feature ideas
  stories: Story[] // BMAD stories
  architecture: ArchDoc[] // Design docs

  // Development
  tasks: Task[] // Granular tasks
  commits: Commit[] // Version history
  reviews: Review[] // Code reviews

  // Quality
  tests: Test[] // Test cases
  bugs: Bug[] // Issues
  docs: Document[] // Documentation

  // Analytics (per project)
  velocity: Velocity
  quality: QualityMetrics
  coverage: TestCoverage
}
```

---

## 🚀 How It Works: Developer's Journey

### Scenario: Building a Todo App

```
1. CREATE PROJECT
   Developer: "New project: Todo App"
   Platform: Creates workspace, initializes git, starts taskmaster

2. PLANNING (BMAD Analyst)
   Developer: Chat with Analyst agent
   "I want a todo app with user auth and real-time sync"

   Analyst Agent:
   - Asks clarifying questions
   - Creates Brief.md in project docs/
   - Updates knowledge graph with feature nodes

3. ARCHITECTURE (BMAD Architect)
   Developer: "Design the architecture"

   Architect Agent:
   - Analyzes brief
   - Proposes tech stack (React + Firebase)
   - Creates Architecture.md
   - Adds component relationships to graph

4. STORY CREATION (BMAD Scrum Master)
   Developer: "Break into stories"

   Scrum Master:
   - Creates stories in Taskmaster
   - Links Brief → Stories in graph
   - Prioritizes and estimates

5. DEVELOPMENT (AI + Developer)
   Developer: Picks story "User Authentication"

   Platform:
   - Opens story in IDE
   - Shows full context (brief, architecture)
   - AI suggests file structure

   Developer: "Generate auth component"

   Dev Agent:
   - Generates React component
   - Adds tests
   - Updates graph: (Story)-[:IMPLEMENTS]->(Component)

6. CODE REVIEW (AI Reviewer)
   Developer: Commits code

   Reviewer Agent:
   - Analyzes code
   - Checks against architecture
   - Suggests improvements
   - Updates quality metrics

7. VISUAL EXPLORATION
   Developer: Opens graph view

   Sees:
   - Feature → Stories → Components → Files
   - Dependencies and relationships
   - Who worked on what
   - Test coverage gaps
```

---

## 🗂️ File System Structure

```
/Users/developer/opencode-workspace/
│
├── platform/                    # OpenCode Platform (separate)
│   ├── web-ide/                # IDE frontend
│   ├── ai-agents/              # BMAD agents
│   ├── taskmaster/             # Workflow engine
│   ├── knowledge-graph/        # Memgraph instance
│   └── services/               # Platform services
│
└── projects/                    # User projects (separate)
    │
    ├── todo-app/               # Example project
    │   ├── src/               # User's source code
    │   │   ├── components/
    │   │   ├── pages/
    │   │   └── utils/
    │   │
    │   ├── .opencode/          # Platform data (per project)
    │   │   ├── taskmaster.db   # Project workflow
    │   │   ├── knowledge/      # Project graph data
    │   │   ├── docs/           # BMAD documents
    │   │   │   ├── Brief.md
    │   │   │   ├── Architecture.md
    │   │   │   └── stories/
    │   │   └── config.json     # Project settings
    │   │
    │   ├── package.json        # User's dependencies
    │   └── ...                 # User's files
    │
    └── another-project/
        └── ...
```

**Key Separation:**

- **Platform code** never mixes with **user code**
- Each project has its own `.opencode/` directory
- Knowledge graph is project-specific
- Taskmaster DB is project-specific

---

## 🧠 Semantic Development Workflow

### 1. Semantic Code Understanding

```typescript
// Platform analyzes user's code semantically
interface SemanticAnalysis {
  // Extract meaning, not just syntax
  parseCode(file: string): {
    purpose: string // "User authentication component"
    dependencies: string[] // Semantic dependencies
    patterns: Pattern[] // Design patterns used
    quality: QualityScore // Code quality metrics
    testability: number // How testable
    complexity: number // Cognitive complexity
  }

  // Build semantic graph
  updateKnowledgeGraph(): void

  // Answer semantic queries
  query(question: string): Answer
  // "What handles user login?" → Points to auth component
  // "Where is data validated?" → Shows validation layer
}
```

### 2. Progressive Development Flow

```
Phase 1: IDEATION
├─> Chat with AI about idea
├─> AI asks clarifying questions
├─> Creates brief with clear scope
└─> Stores in knowledge graph

Phase 2: ARCHITECTURE
├─> AI proposes architecture
├─> Developer refines
├─> Creates architecture doc
└─> Graph: (Brief)-[:GUIDES]->(Architecture)

Phase 3: BREAKDOWN
├─> AI breaks into stories
├─> Each story is complete context
├─> Stories have clear dependencies
└─> Graph: (Architecture)-[:SPAWNS]->(Stories)

Phase 4: IMPLEMENTATION
├─> Developer picks story
├─> AI generates boilerplate
├─> Developer customizes
├─> AI reviews in real-time
└─> Graph: (Story)-[:IMPLEMENTS]->(Code)

Phase 5: QUALITY
├─> AI generates tests
├─> AI checks coverage
├─> AI suggests improvements
└─> Graph: (Code)-[:TESTED_BY]->(Tests)

Phase 6: DEPLOYMENT
├─> AI checks readiness
├─> Runs final validations
├─> Creates deployment plan
└─> Graph: (Code)-[:DEPLOYED_AS]->(Version)
```

### 3. Peer Review with AI

```typescript
// Collaborative review
interface PeerReview {
  // Human reviewer
  human: {
    reviews: Review[]
    comments: Comment[]
    approvals: Approval[]
  }

  // AI assistant during review
  ai: {
    // Highlights potential issues
    analyzeChanges(): Issue[]

    // Explains code to reviewer
    explainCode(selection: string): Explanation

    // Suggests test cases
    suggestTests(): TestCase[]

    // Checks against architecture
    validateAgainstArch(): ValidationResult
  }

  // Knowledge graph tracks review
  graph: {
    (Developer)-[:REVIEWED]->(PR)
    (AI)-[:ASSISTED]->(Review)
    (Issue)-[:FOUND_IN]->(Code)
    (Suggestion)-[:APPLIED_TO]->(Code)
  }
}
```

---

## 💻 Technical Stack

### Frontend (Web IDE)

```typescript
// Modern web technologies
{
  "editor": "Monaco Editor (VS Code)",
  "terminal": "xterm.js",
  "ui": "React + Tailwind + ShadCN",
  "state": "Zustand",
  "routing": "React Router",
  "preview": "iframe sandbox",
  "ai-chat": "Custom streaming UI"
}
```

### Backend (Platform Services)

```typescript
{
  "runtime": "Bun",
  "api": "Hono (fast web framework)",
  "database": "SQLite (Taskmaster)",
  "graph": "Memgraph",
  "files": "Node fs with chokidar (watch)",
  "git": "isomorphic-git",
  "build": "Vite",
  "ai": "OpenRouter SDK"
}
```

### Infrastructure

```typescript
{
  "deployment": "Docker containers",
  "storage": "Local filesystem",
  "scaling": "Single user (local first)",
  "auth": "Optional (for cloud version)",
  "sync": "Git-based (for teams)"
}
```

---

## 🎯 Key Features

### 1. Semantic Code Search

```typescript
// Not just text search
"Show me where authentication happens"
→ Traverses graph: (Feature:Auth)-[:IMPLEMENTS]->(Component)

"What will break if I change this?"
→ Analyzes: (Component)-[:USED_BY]->(Components)

"Who wrote this originally?"
→ Queries: (Developer)-[:AUTHORED]->(Code)
```

### 2. Context-Aware AI

```typescript
// AI always has full context
{
  "current_file": "src/auth/Login.tsx",
  "related_files": ["auth/types.ts", "api/auth.ts"],
  "architecture": "docs/Architecture.md",
  "story": "stories/003-user-login.md",
  "history": ["recent commits", "reviews"],
  "dependencies": ["graph query results"]
}

// AI can answer:
"How does this fit in the architecture?"
"What's the approved pattern for this?"
"What tests do I need?"
```

### 3. Visual Development

```typescript
// Graph visualizations
interface Visualizations {
  // Architecture view
  showArchitecture(): GraphView
  // Feature → Components → Files

  // Dependency view
  showDependencies(file: string): GraphView
  // What depends on what

  // Feature progress
  showProgress(feature: string): ProgressView
  // Stories → Tasks → Completion

  // Team collaboration
  showCollaboration(): CollabView
  // Who's working on what
}
```

### 4. Repeatable Workflows

```typescript
// BMAD ensures consistency
interface BMADWorkflow {
  // Every feature follows same process
  process: [
    "Brief", // What & why
    "Architecture", // How
    "Stories", // Broken down
    "Implement", // Build
    "Review", // Check
    "Deploy", // Ship
  ]

  // AI guides at each step
  // Nothing gets skipped
  // Quality is built in
}
```

---

## 🔄 Development Cycle (Daily Use)

### Morning: Plan

```bash
# Open OpenCode platform
$ opencode open todo-app

# Chat with Analyst
"Today I want to add user profiles"

# AI creates brief
# Updates taskmaster with stories
# Shows in IDE sidebar
```

### Midday: Implement

```bash
# Pick story from taskmaster
# AI shows full context
# Start coding with AI assistance

# Real-time:
- AI suggests completions
- AI reviews as you type
- AI updates knowledge graph
- AI runs tests automatically
```

### Afternoon: Review

```bash
# Commit code
# AI performs automatic review

# Graph shows:
- What changed
- What's affected
- Test coverage
- Quality metrics

# Request peer review
# AI assists peer reviewer
```

### Evening: Reflect

```bash
# View dashboard
- Velocity chart
- Quality trends
- Knowledge graph growth
- AI assistance metrics

# Plan tomorrow
# AI suggests next stories
```

---

## 📊 Platform vs Project Data

### Platform Data (Shared Across Projects)

```
/platform-data/
├── ai-models/          # Cached AI models
├── templates/          # Project templates
├── shared-config/      # Platform settings
└── analytics/          # Usage analytics
```

### Project Data (Per Project)

```
/project/.opencode/
├── taskmaster.db       # Workflow state
├── knowledge/          # Memgraph data
│   ├── nodes/
│   └── relationships/
├── docs/              # BMAD documents
│   ├── Brief.md
│   ├── Architecture.md
│   └── stories/
├── cache/             # AI response cache
└── config.json        # Project settings
```

**Clear Separation:**

- Platform manages workflow and AI
- Project contains actual code
- Knowledge graph tracks project semantics
- Easy to version control (git ignore .opencode/cache)

---

## 🚀 MVP Feature Set

### Phase 1: Core IDE (Month 1)

- [ ] Web-based Monaco editor
- [ ] File tree and management
- [ ] Terminal integration
- [ ] Live preview (basic)
- [ ] Git integration (basic)

### Phase 2: AI Integration (Month 2)

- [ ] AI chat sidebar
- [ ] Code completion (AI-powered)
- [ ] BMAD Analyst agent
- [ ] BMAD Architect agent
- [ ] Brief and Architecture docs

### Phase 3: Knowledge Graph (Month 3)

- [ ] Memgraph integration
- [ ] Semantic code analysis
- [ ] Graph visualization (basic)
- [ ] Relationship tracking
- [ ] Impact analysis

### Phase 4: Taskmaster (Month 4)

- [ ] Story management
- [ ] Task breakdown
- [ ] Progress tracking
- [ ] Workflow automation
- [ ] Sprint planning

### Phase 5: Advanced Features (Month 5-6)

- [ ] BMAD Dev agent (code gen)
- [ ] BMAD Reviewer agent
- [ ] Advanced graph viz (Graphlytic)
- [ ] Team collaboration
- [ ] Quality metrics

---

## 🎯 Success Criteria

### For Individual Developers

- Can build full-stack app **2x faster**
- Never lose context ("what was I doing?")
- Visual understanding of entire codebase
- AI assistance feels natural, not forced
- Code quality consistently high

### For Small Teams (2-5)

- Onboard new member in **< 1 day**
- Everyone understands full system
- No "tribal knowledge" problems
- Consistent code patterns
- Clear development workflow

### For Platform

- Works offline (local-first)
- Fast (sub-100ms interactions)
- Stable (no crashes/bugs)
- Extensible (plugin system)
- Maintainable (clean code)

---

## 🔮 Future Vision

### Year 1: Core Platform

- Web IDE with AI
- BMAD workflow
- Knowledge graphs
- Local development

### Year 2: Collaboration

- Real-time collaboration
- Team workspaces
- Cloud sync (optional)
- Shared knowledge bases

### Year 3: Intelligence

- AI learns from your patterns
- Predictive suggestions
- Automated refactoring
- Smart architecture evolution

### Year 4: Ecosystem

- Plugin marketplace
- Community templates
- AI agent marketplace
- Enterprise features

---

## 💡 Key Decisions

### 1. Local-First Architecture

- Platform runs locally
- Fast, private, offline-capable
- Optional cloud sync for teams

### 2. Project Independence

- Each project isolated
- Own knowledge graph
- Own workflow state
- Clean separation

### 3. Semantic Understanding

- Not just syntax highlighting
- True code comprehension
- Relationship tracking
- Meaningful suggestions

### 4. BMAD Integration

- Proven methodology
- Consistent workflow
- Quality built-in
- AI-native process

### 5. Graph-Driven Development

- Relationships are first-class
- Visual exploration
- Impact analysis
- Knowledge discovery

---

## 📝 Next Steps

### Immediate (This Week)

1. **Validate Architecture**
   - Review this document
   - Get feedback
   - Refine approach

2. **Choose Tech Stack**
   - Confirm Monaco editor
   - Decide on backend framework
   - Select graph database config

3. **Create MVP Scope**
   - What's absolutely necessary?
   - What can wait?
   - 90-day plan

### Short Term (Month 1)

1. **Build Core IDE**
   - Editor
   - File system
   - Terminal
   - Basic preview

2. **Integrate First AI**
   - Chat interface
   - Simple completions
   - Context awareness

3. **Test with Real Project**
   - Build something in it
   - Find pain points
   - Iterate quickly

---

**This is a DEVELOPMENT PLATFORM, not a framework.**

**OpenSPG capabilities power the platform, but stay separate from user projects.**

**Knowledge graphs track user's code semantics, not platform internals.**

**BMAD ensures repeatable, high-quality development workflow.**

Ready to build the future of web development? 🚀
