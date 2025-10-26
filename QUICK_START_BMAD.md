# Quick Start: OpenSPG with BMAD + Memgraph

## 🚀 5-Minute Setup

### Prerequisites

```bash
# Required
- Node.js >= 18
- Bun >= 1.0
- Docker (for Memgraph + Graphlytic)

# Optional but recommended
- VS Code with OpenCode extension
```

### Installation

```bash
# 1. Clone and install
git clone https://github.com/Planet9V/openspg-bmad
cd openspg-bmad
bun install

# 2. Start databases
docker-compose up -d

# 3. Initialize system
bun run init:enhanced

# 4. Start development server
bun dev
```

## 🎯 Your First Project (15 minutes)

### Step 1: Create Project

```bash
# CLI method
npx openspg bmad init "Task Manager App"

# Or in UI
http://localhost:3000 → New Project
```

### Step 2: Planning Phase (BMAD)

```typescript
// 1. Talk to Analyst Agent
"I want to build a task management app with:
- User authentication
- Task lists with drag-and-drop
- Team collaboration
- Real-time updates"

// Analyst creates Brief.md

// 2. PM Agent creates PRD
"Based on the brief, create a detailed PRD"

// PM creates PRD.md with:
// - Features
// - User stories
// - Success criteria

// 3. Architect designs system
"Design the technical architecture"

// Architect creates Architecture.md with:
// - System components
// - Data models
// - API design
// - Technology choices
```

### Step 3: Story Creation

```bash
# Scrum Master shards PRD into stories
npx openspg bmad shard \
  --prd docs/PRD.md \
  --arch docs/Architecture.md

# Creates:
# - stories/001-user-auth.md
# - stories/002-task-lists.md
# - stories/003-drag-drop.md
# - stories/004-collaboration.md
# - stories/005-realtime.md
```

### Step 4: Development

```bash
# Work on a story
npx openspg bmad dev stories/001-user-auth.md

# Dev Agent:
# 1. Reads full story context
# 2. Understands requirements
# 3. Implements feature
# 4. Creates tests

# QA Agent:
# 1. Reviews implementation
# 2. Runs tests
# 3. Provides feedback
```

### Step 5: Visual Exploration

```bash
# Open Graphlytic
open http://localhost:8080

# See:
# - Project structure
# - Story dependencies
# - Code relationships
# - Team collaboration
```

## 📊 Understanding the System

### Database Structure

```
SQLite (Taskmaster)
├─ projects
├─ tasks
├─ documents
└─ progress

Memgraph (Relationships)
├─ (PRD)-[:SPAWNS]->(Story)
├─ (Story)-[:IMPLEMENTS]->(Component)
├─ (User)-[:AUTHORED]->(Document)
└─ (File)-[:IMPORTS]->(File)
```

### Document Flow

```
Brief → PRD → Architecture
  ↓       ↓        ↓
  └───> Stories ←──┘
          ↓
        Tasks
          ↓
    Implementation
          ↓
        Testing
```

## 🎨 Key Features

### 1. Context-Rich Stories

Every story contains:

- **Full requirements** from PRD
- **Technical guidance** from Architecture
- **Acceptance criteria**
- **Related stories**
- **All context AI needs**

### 2. Visual Knowledge Graph

See relationships:

- What depends on what
- Who worked on what
- How things connect
- Impact of changes

### 3. AI Agents Everywhere

- **Analyst**: Requirements gathering
- **PM**: Product documentation
- **Architect**: Technical design
- **Scrum Master**: Story creation
- **Dev**: Implementation
- **QA**: Testing

### 4. Real-Time Collaboration

- Live updates in Graphlytic
- Team analytics
- Code ownership
- Collaboration patterns

## 🔧 Common Commands

```bash
# BMAD Workflow
npx openspg bmad analyst      # Start with analyst
npx openspg bmad pm           # Create PRD
npx openspg bmad architect    # Design architecture
npx openspg bmad shard        # Create stories
npx openspg bmad dev          # Implement story
npx openspg bmad qa           # Test implementation

# Taskmaster
npx taskmaster project:create "Project Name"
npx taskmaster task:create "Task Title"
npx taskmaster status
npx taskmaster project:status <id>

# Document Management
npx openspg docs create --type prd
npx openspg docs search "authentication"
npx openspg docs graph <doc-id>

# Graph Queries
npx openspg graph query "MATCH (s:Story) RETURN s"
npx openspg graph impact <file-path>
npx openspg graph dependencies <component>
```

## 📈 Visualizations in Graphlytic

### Available Dashboards

1. **Project Overview**
   - All components
   - Story status
   - Dependencies
   - Critical path

2. **Impact Analysis**
   - Select any node
   - See what it affects
   - See what affects it
   - Make informed decisions

3. **Team Collaboration**
   - Who worked on what
   - Collaboration network
   - Code ownership
   - Review patterns

4. **Knowledge Graph**
   - Document relationships
   - Code dependencies
   - Test coverage
   - API connections

## 💡 Best Practices

### 1. Always Start with Planning

```
✅ DO: Analyst → PM → Architect → Stories
❌ DON'T: Jump straight to coding
```

### 2. Keep Context in Stories

```
✅ DO: Link stories to PRD and Architecture
❌ DON'T: Create isolated stories
```

### 3. Use Visual Exploration

```
✅ DO: Check impact before making changes
❌ DON'T: Change blindly
```

### 4. Trust the AI Agents

```
✅ DO: Let agents handle their specialties
❌ DON'T: Try to do everything yourself
```

### 5. Keep Graph Updated

```
✅ DO: Documents sync automatically
❌ DON'T: Manual graph updates needed
```

## 🐛 Troubleshooting

### Memgraph not connecting

```bash
# Check if running
docker ps | grep memgraph

# Restart if needed
docker restart memgraph

# Check logs
docker logs memgraph
```

### Graphlytic not showing data

```bash
# Verify connection in Graphlytic UI
Settings → Connections → Test Connection

# Check Memgraph has data
npx openspg graph query "MATCH (n) RETURN count(n)"
```

### Story context missing

```bash
# Re-sync documents to graph
npx openspg docs sync

# Re-shard PRD
npx openspg bmad shard --force
```

### Agent not responding

```bash
# Check API key
echo $OPENROUTER_API_KEY

# Check agent config
cat .opencode.json | jq .bmad.agents

# Test agent directly
npx openspg bmad test-agent analyst
```

## 📚 Next Steps

### Learn More

1. **Read Full Documentation**
   - `BMAD_MEMGRAPH_ENHANCEMENT_PLAN.md` - Complete architecture
   - `WIKI.md` - Project wiki
   - `TECHNICAL_REFERENCE.md` - API reference

2. **Watch Video Tutorials**
   - "BMAD Method Overview" (15 min)
   - "Your First Project" (30 min)
   - "Visual Exploration" (20 min)

3. **Join Community**
   - Discord: #openspg-bmad
   - GitHub Discussions
   - Weekly office hours

### Advanced Features

```bash
# Export project to other tools
npx openspg export --format jira
npx openspg export --format github-issues

# Generate reports
npx openspg report velocity
npx openspg report health
npx openspg report team-analytics

# Custom visualizations
npx openspg graph custom-query query.cypher
```

## 🎯 Success Checklist

After 1 week, you should:

- [ ] Have 1 complete project planned
- [ ] Understand BMAD workflow
- [ ] Created stories from PRD
- [ ] Implemented 1-2 stories
- [ ] Explored graph in Graphlytic
- [ ] Feel comfortable with CLI

After 1 month, your team should:

- [ ] Complete 1 project using BMAD
- [ ] Consistently use visual exploration
- [ ] Track metrics in dashboards
- [ ] Onboard new member in < 1 day
- [ ] Average < 5 min to find related code
- [ ] Rarely ask "where do I start?"

## 🌟 Tips for Small Teams

### 2-3 Developers

```
- One person: Planning (Analyst + PM + Architect)
- Everyone: Reviews planning docs
- Scrum Master: Shards together
- Developers: Pick stories from board
```

### 4-5 Developers

```
- Dedicated planning role rotates
- Stories created in advance
- Regular graph reviews
- Weekly impact analysis sessions
```

### Remote Teams

```
- Use Graphlytic for async exploration
- Document decisions in graph
- Record context in stories
- Visual standups in graph
```

## 🚦 Quick Reference

### Project Structure

```
my-project/
├── .opencode/
│   ├── opencode.json       # Configuration
│   └── bmad/               # BMAD settings
├── docs/
│   ├── Brief.md            # Project brief
│   ├── PRD.md              # Requirements
│   ├── Architecture.md     # Design
│   └── wiki/               # Knowledge base
├── stories/
│   ├── 001-feature-a.md
│   ├── 002-feature-b.md
│   └── ...
├── src/                    # Your code
└── taskmaster.db           # SQLite database
```

### Environment Variables

```bash
# Required
OPENROUTER_API_KEY=sk-or-...

# Memgraph
MEMGRAPH_HOST=localhost
MEMGRAPH_PORT=7687
MEMGRAPH_USER=memgraph
MEMGRAPH_PASSWORD=

# Graphlytic
GRAPHLYTIC_URL=http://localhost:8080

# OpenSPG
DEFAULT_AI_MODEL=openai/gpt-4o-mini
AI_TEMPERATURE=0.7
```

### Keyboard Shortcuts (UI)

```
Ctrl+K         - Command palette
Ctrl+Shift+P   - BMAD agent selector
Ctrl+G         - Open graph explorer
Ctrl+D         - Search documents
Ctrl+/         - Open quick help
```

---

**Ready to transform your team's development process?**

Start your first project now: `npx openspg bmad init "My App"`

---

_For help: Discord #openspg-bmad | Docs: https://docs.openspg.dev/bmad_
