# OpenSPG (Opencode Framework) - Project Wiki

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Core Packages](#core-packages)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Development Setup](#development-setup)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

**OpenSPG** (Opencode Framework 2.0) is an enterprise-grade AI development platform that brings universal AI capabilities directly into React applications. Created by Jim McKenney as part of the Project AEON AI Initiative, this framework doubles traditional capabilities while maintaining simplicity.

### Key Objectives

- **Universal AI Integration**: One-line AI integration in any React component
- **Enterprise-Grade**: Production-ready with analytics, collaboration, and cost management
- **Performance**: 2x faster with smart caching and optimization
- **Team-First**: Real-time collaboration with shared AI sessions
- **Developer-Centric**: AI-powered code suggestions, review, and generation

### Project Metadata

- **Author**: Jim McKenney ([@Planet9V](https://github.com/Planet9V))
- **License**: MIT
- **Initiative**: Project AEON AI
- **Version**: 2.0
- **Repository**: Opencode_Template

---

## Project Structure

```
openspg/
├── packages/
│   ├── ai-hooks/              # Core AI React hooks
│   │   ├── src/
│   │   │   ├── index.ts       # Main hooks export
│   │   │   ├── useAnalytics.ts
│   │   │   ├── useWorkflow.ts
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── ui-components/         # Pre-built UI components
│   │   ├── src/
│   │   │   ├── AIChat.tsx
│   │   │   ├── WorkflowBuilder.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── CollaborationPanel.tsx
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── openrouter-sdk/        # Multi-model AI gateway
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── taskmaster/            # Task management system
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── database.ts
│   │   │   ├── cli.ts
│   │   │   └── taskmaster-ui.tsx
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── cli-tool/              # CLI utilities
│       └── src/
│           └── index.ts
│
├── examples/
│   └── ai-integrated-app/     # Demo application
│       └── src/
│           └── App.tsx
│
├── README.md
├── AI_INTEGRATION_README.md
├── FRAMEWORK_2.0_IMPLEMENTATION.md
└── .gitignore
```

---

## Core Packages

### 1. @opencode/ai-hooks

**Purpose**: Core AI React hooks for seamless AI integration

**Key Hooks**:

#### Original Hooks (v1.0)

- `useAI()` - Single AI completions
- `useChat()` - Conversational AI
- `useStreamingChat()` - Real-time streaming responses
- `useCodeGeneration()` - Programming assistant
- `useModelSelector()` - Model switching

#### New Hooks (v2.0 - Doubled Capabilities)

- `useWorkflow()` - Multi-agent orchestration
- `useCodeSuggestions()` - AI-powered code intelligence
- `useAnalytics()` - Usage tracking & cost management
- `useCache()` - Smart response caching
- `useCollaboration()` - Real-time team collaboration

**Dependencies**:

- React >= 16.8.0
- @opencode/openrouter-sdk

**Build Commands**:

```bash
bun build        # Build package
bun dev          # Watch mode
bun typecheck    # Type checking
```

---

### 2. @opencode/ui-components

**Purpose**: Beautiful, accessible UI components built with ShadCN UI

**Components**:

#### Original Components

- `AIModelSelector` - Model marketplace with descriptions
- `AIChat` - Ready-to-use chat interface

#### New Components (v2.0)

- `WorkflowBuilder` - Visual workflow creation
- `AnalyticsDashboard` - Enterprise analytics
- `CollaborationPanel` - Team collaboration hub
- `CodeSuggestionsPanel` - AI code intelligence UI
- `APIGateway` - API orchestration
- `DatabaseConnector` - Database integration
- `DeploymentOrchestrator` - Deployment management

**Dependencies**:

- @opencode/ai-hooks
- @radix-ui/react-select, @radix-ui/react-scroll-area
- lucide-react (icons)
- tailwindcss >= 3.0.0

**Build Commands**:

```bash
bun build        # Build package
bun dev          # Watch mode
bun typecheck    # Type checking
```

---

### 3. @opencode/openrouter-sdk

**Purpose**: Multi-model AI gateway for unified access to GPT-4, Claude, Gemini, and more

**Features**:

- Universal OpenRouter.ai integration
- Automatic model switching
- Streaming support
- Rate limiting and retry logic
- Cost tracking

**Supported Models**:

- OpenAI: gpt-4o, gpt-4o-mini
- Anthropic: claude-3.5-sonnet, claude-3-haiku
- Google: gemini-pro-1.5
- Meta: llama-3.1-70b-instruct
- And many more via OpenRouter

**Build Commands**:

```bash
bun build        # Build package
bun dev          # Watch mode
bun typecheck    # Type checking
```

---

### 4. @opencode/taskmaster

**Purpose**: Advanced SQLite-based task management and project orchestration

**Version**: 2.0.0

**Features**:

- SQLite database backend for persistent storage
- Multi-agent orchestration
- Progress tracking and analytics
- Dependency management
- AI-powered task assignment
- CLI interface
- React dashboard component

**Core Capabilities**:

- Project management with phases
- Task creation and assignment
- Dependency tracking (finish-to-start, etc.)
- Agent workload balancing
- Workflow execution
- Project metrics and reporting

**Database Schema**:

- `projects` - Project definitions
- `phases` - Project phases
- `tasks` - Individual tasks
- `task_dependencies` - Task relationships
- `task_progress` - Progress history
- `agents` - AI/development agents
- `workflow_executions` - Workflow runs

**CLI Commands**:

```bash
npx taskmaster init                    # Initialize
npx taskmaster project:create          # Create project
npx taskmaster task:create             # Create task
npx taskmaster task:update             # Update progress
npx taskmaster project:status          # View status
```

**Dependencies**:

- better-sqlite3 - SQLite database
- uuid - ID generation
- date-fns - Date utilities
- zod - Schema validation

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Opencode Framework 2.0                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │  UI Components  │  │   AI Hooks       │  │ Taskmaster ││
│  │  • AIChat       │  │   • useAI        │  │ • Projects ││
│  │  • Workflows    │  │   • useWorkflow  │  │ • Tasks    ││
│  │  • Analytics    │  │   • useAnalytics │  │ • Agents   ││
│  │  • Collab       │  │   • useCache     │  │ • Analytics││
│  └─────────────────┘  └──────────────────┘  └────────────┘│
│           │                    │                    │       │
│           └────────────────────┼────────────────────┘       │
│                                │                            │
│                    ┌───────────────────────┐                │
│                    │ OpenRouter SDK        │                │
│                    │ Multi-Model Gateway   │                │
│                    └───────────────────────┘                │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │
                    ┌────────────────────────┐
                    │   OpenRouter.ai API    │
                    │ GPT-4, Claude, Gemini  │
                    └────────────────────────┘
```

### Data Flow

```
User Interaction
      ↓
UI Component (React)
      ↓
AI Hook (State Management)
      ↓
OpenRouter SDK (API Client)
      ↓
Cache Layer (Optional)
      ↓
OpenRouter.ai API
      ↓
AI Model (GPT-4, Claude, etc.)
      ↓
Response Processing
      ↓
Analytics Tracking
      ↓
UI Update
```

### Multi-Agent Workflow Architecture

```
Workflow Definition
      ↓
Agent Configuration
   (id, role, model, dependencies)
      ↓
Dependency Resolution
      ↓
Sequential Execution
   (respects dependencies)
      ↓
Progress Tracking
      ↓
Result Aggregation
      ↓
Workflow Completion
```

---

## Key Features

### 1. Multi-Agent Workflows

- Complex AI workflows with dependency chains
- Visual workflow builder interface
- Real-time execution monitoring
- Pre-built templates (code review, content creation)
- Error handling and retry logic

### 2. Enterprise Analytics

- Real-time usage metrics
- Cost tracking and budgeting
- Model performance comparison
- Usage trends and forecasting
- Export capabilities

### 3. Real-Time Collaboration

- Shared AI sessions
- Live messaging and model switching
- Session management
- Participant tracking
- Team productivity features

### 4. AI Code Intelligence

- Intelligent code completion
- Refactoring suggestions
- Performance optimization
- Bug detection
- Multi-language support

### 5. Smart Caching System

- Automatic response caching
- TTL management
- Intelligent cache invalidation
- Hit/miss tracking
- Performance optimization

### 6. Task Management System

- SQLite-based persistence
- Multi-agent orchestration
- Progress tracking
- Dependency management
- Project analytics

---

## Technology Stack

### Frontend

- React 18+
- TypeScript 5.0+
- Tailwind CSS
- ShadCN UI Components
- Lucide React (Icons)
- Radix UI (Primitives)

### Backend/SDK

- Bun (Runtime & Package Manager)
- OpenRouter API (Multi-model access)
- Better SQLite3 (Database)
- Date-fns (Date utilities)
- UUID (ID generation)
- Zod (Schema validation)

### Build Tools

- Turbo (Monorepo orchestration)
- tsup (TypeScript bundler)
- TypeScript Compiler
- ESLint (Linting)
- Prettier (Formatting)

### Development

- Hot Module Replacement
- Watch mode compilation
- Type checking
- Automated testing (Vitest)

---

## Development Setup

### Prerequisites

- Bun >= 1.0.0
- Node.js >= 18.0.0 (for compatibility)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Planet9V/Opencode_Template.git
cd Opencode_Template

# Install dependencies
bun install

# Build all packages
bun turbo build

# Run example application
cd examples/ai-integrated-app
bun dev
```

### Environment Variables

Create `.env` file in your project:

```env
OPENROUTER_API_KEY=your-api-key-here
DEFAULT_AI_MODEL=openai/gpt-4o-mini
AI_TEMPERATURE=0.7
```

### Development Commands

```bash
# Build all packages
bun turbo build

# Type check all packages
bun turbo typecheck

# Test all packages
bun turbo test

# Test single file
bun test <file>

# Format code
./script/format.ts
```

### Package Development

```bash
# Work on ai-hooks
cd packages/ai-hooks
bun dev          # Watch mode
bun build        # Build
bun typecheck    # Type check

# Work on ui-components
cd packages/ui-components
bun dev
bun build
bun typecheck

# Work on taskmaster
cd packages/taskmaster
bun dev
bun test
bun run cli -- --help
```

---

## Testing & Quality

### Test Framework

- **Vitest** for unit and integration tests
- **Bun:test** for runtime tests

### Test Commands

```bash
# Run all tests
bun turbo test

# Run specific package tests
cd packages/ai-hooks && bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Code Quality

#### Linting

```bash
# Lint all packages
bun turbo lint

# Fix linting issues
bun turbo lint:fix
```

#### Type Checking

```bash
# Type check all packages
bun turbo typecheck
```

#### Formatting

```bash
# Format all files
./script/format.ts
```

**Prettier Config**:

- No semicolons
- Print width: 120
- Single quotes
- Trailing commas: all

---

## Deployment

### Cloud Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel deploy
```

#### Netlify

```bash
# Build
bun turbo build

# Deploy dist/ folder
netlify deploy --prod
```

#### AWS Amplify

```bash
# Configure amplify.yml
# Connect repository
# Auto-deploy on push
```

### Docker Deployment

```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install
RUN bun turbo build

EXPOSE 3000
CMD ["bun", "dev"]
```

### Enterprise Solutions

- Kubernetes orchestration
- Azure App Service
- Private cloud deployment
- On-premise installation

---

## Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards

- **TypeScript**: Strict typing, avoid `any`
- **Testing**: 80%+ code coverage
- **Documentation**: JSDoc comments for all public APIs
- **Formatting**: Prettier with project config
- **Linting**: ESLint with TypeScript rules

### Development Workflow

1. Run `bun install` after pulling changes
2. Use `bun dev` for watch mode during development
3. Run `bun typecheck` before committing
4. Run `bun test` to ensure tests pass
5. Format code with `./script/format.ts`

### Commit Message Format

```
type(scope): subject

body (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:

- `feat(ai-hooks): add useCollaboration hook`
- `fix(ui-components): resolve WorkflowBuilder rendering issue`
- `docs(wiki): update architecture diagram`

---

## Additional Resources

### Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Workflow Examples](./docs/workflows.md)
- [Enterprise Setup](./docs/enterprise.md)

### Community

- [GitHub Issues](https://github.com/Planet9V/Opencode_Template/issues)
- [GitHub Discussions](https://github.com/Planet9V/Opencode_Template/discussions)
- [Discord Community](https://discord.gg/opencode)
- Email: support@opencode.dev

### Learning Resources

- Framework Overview Video (Coming Soon)
- Building Your First AI Workflow
- Enterprise Analytics Setup
- Team Collaboration Best Practices

---

## Project Roadmap

### Q1 2024

- [ ] Advanced workflow templates library
- [ ] Real-time collaboration WebSocket integration
- [ ] Enhanced analytics with ML insights
- [ ] Mobile SDK for React Native

### Q2 2024

- [ ] Enterprise SSO integration
- [ ] Advanced security and compliance features
- [ ] AI model fine-tuning capabilities
- [ ] GraphQL API layer

### Q3 2024

- [ ] Visual workflow marketplace
- [ ] Advanced team management features
- [ ] Multi-tenant architecture support
- [ ] Advanced monitoring and alerting

---

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

**Built with ❤️ by:**

- **Jim McKenney** - Creator and lead architect
- **Project AEON** - AI initiative
- **OpenRouter** - Multi-model infrastructure
- **Vercel** - Deployment platform
- **ShadCN** - UI component library

---

**Last Updated**: 2024
**Maintained By**: Opencode Team
**Status**: Active Development
