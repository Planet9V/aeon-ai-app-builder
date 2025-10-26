# Implementation Plan
## OpenCode Development Platform

**Version:** 1.0  
**Date:** 2024-10-25  
**Timeline:** 20 weeks (5 months)  
**Related:** [PRD.md](./PRD.md), [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)

---

## Overview

This implementation plan breaks down the OpenCode Platform MVP into **6 phases** over 20 weeks, with clear deliverables, dependencies, and success criteria for each phase.

**Total Effort:** ~20 weeks | **Team Size:** 2-3 developers

---

## Phase Summary

| Phase | Duration | Key Deliverable | Status |
|-------|----------|-----------------|--------|
| **Phase 1** | Weeks 1-4 | Core IDE (Editor + Files) | 📋 Planned |
| **Phase 2** | Weeks 5-6 | AI Chat Integration | 📋 Planned |
| **Phase 3** | Weeks 7-10 | BMAD Foundation | 📋 Planned |
| **Phase 4** | Weeks 11-14 | Knowledge Graph | 📋 Planned |
| **Phase 5** | Weeks 15-16 | Supporting Features | 📋 Planned |
| **Phase 6** | Weeks 17-20 | Polish & Launch | 📋 Planned |

---

## Phase 1: Core IDE (Weeks 1-4)

### Goal
Build functional web-based code editor with file management

### Tasks

#### Week 1: Project Setup
- [ ] **1.1** Initialize monorepo structure (Turborepo/Nx)
  - Estimated: 2 days
  - Assignee: Tech Lead
  - Output: `package.json`, workspace config

- [ ] **1.2** Set up frontend (React + Vite)
  - Estimated: 1 day
  - Dependencies: 1.1
  - Output: Running React app

- [ ] **1.3** Set up backend (Bun + Hono)
  - Estimated: 1 day
  - Dependencies: 1.1
  - Output: API server responding

- [ ] **1.4** Configure Docker Compose (dev environment)
  - Estimated: 1 day
  - Dependencies: 1.2, 1.3
  - Output: `docker-compose.yml`

#### Week 2: Monaco Editor Integration
- [ ] **2.1** Install Monaco Editor React wrapper
  - Estimated: 0.5 days
  - Output: Editor renders in UI

- [ ] **2.2** Implement language detection
  - Estimated: 0.5 days
  - Output: Correct syntax highlighting

- [ ] **2.3** Configure editor options (theme, font, etc.)
  - Estimated: 1 day
  - Output: Customizable editor

- [ ] **2.4** Add keyboard shortcuts (VS Code compatible)
  - Estimated: 1 day
  - Output: Shortcuts documentation

- [ ] **2.5** Implement save functionality
  - Estimated: 1 day
  - Dependencies: Backend file API
  - Output: Files saved to disk

#### Week 3: File System
- [ ] **3.1** Design file tree component
  - Estimated: 1 day
  - Output: Component mockup

- [ ] **3.2** Implement backend file API
  - Estimated: 2 days
  - Endpoints: GET, POST, PUT, DELETE `/api/files`
  - Output: RESTful file API

- [ ] **3.3** Build file tree UI
  - Estimated: 2 days
  - Dependencies: 3.1, 3.2
  - Output: Interactive file tree

#### Week 4: File Operations
- [ ] **4.1** Create file/folder
  - Estimated: 1 day
  - Output: Right-click → New File works

- [ ] **4.2** Delete file/folder
  - Estimated: 0.5 days
  - Output: Delete with confirmation

- [ ] **4.3** Rename file/folder
  - Estimated: 0.5 days
  - Output: Inline rename

- [ ] **4.4** File search/filter
  - Estimated: 1 day
  - Output: Search bar in file tree

- [ ] **4.5** Multi-file tabs in editor
  - Estimated: 1 day
  - Output: Tab bar with multiple files

### Deliverables
✅ Working web IDE  
✅ File editing and management  
✅ Save to local filesystem  
✅ Multi-file editing  

### Success Criteria
- [ ] Can open project directory
- [ ] Can edit any text file
- [ ] Changes persist to disk
- [ ] No lag when typing
- [ ] < 2s load time

### Dependencies
- None (foundation phase)

### Risks
- Monaco performance with large files
- Browser storage limitations

**Mitigation:** Lazy loading, file size warnings

---

## Phase 2: AI Chat Integration (Weeks 5-6)

### Goal
Add AI chat sidebar with context awareness

### Tasks

#### Week 5: Chat UI
- [ ] **5.1** Design chat interface
  - Estimated: 1 day
  - Output: Figma/mockup

- [ ] **5.2** Build chat component
  - Estimated: 2 days
  - Output: Chat sidebar renders

- [ ] **5.3** Implement message list (virtualized)
  - Estimated: 1 day
  - Output: Scrollable message history

- [ ] **5.4** Add markdown rendering
  - Estimated: 0.5 days
  - Library: `react-markdown`
  - Output: Rich text messages

- [ ] **5.5** Code block syntax highlighting
  - Estimated: 0.5 days
  - Library: `prismjs`
  - Output: Highlighted code in chat

#### Week 6: AI Integration
- [ ] **6.1** Set up OpenRouter SDK
  - Estimated: 0.5 days
  - Output: SDK configured

- [ ] **6.2** Implement streaming responses
  - Estimated: 1 day
  - Protocol: SSE or WebSocket
  - Output: Real-time streaming

- [ ] **6.3** Context extraction (current file, selection)
  - Estimated: 1 day
  - Output: Context sent with prompts

- [ ] **6.4** Code insertion from chat
  - Estimated: 1 day
  - Output: Click code → inserts in editor

- [ ] **6.5** Error handling and retries
  - Estimated: 0.5 days
  - Output: Graceful error UX

### Deliverables
✅ Working AI chat  
✅ Streaming responses  
✅ Context-aware suggestions  
✅ Code insertion  

### Success Criteria
- [ ] Chat responds < 2s
- [ ] Code context included
- [ ] No dropped messages
- [ ] Error handling works
- [ ] Code insertion smooth

### Dependencies
- Phase 1 (Editor must be working)

### Risks
- API costs
- Rate limiting

**Mitigation:** Caching, rate limits, cost monitoring

---

## Phase 3: BMAD Foundation (Weeks 7-10)

### Goal
Implement Analyst and Architect agents with document system

### Tasks

#### Week 7: Document System
- [ ] **7.1** Design document storage (`.opencode/docs/`)
  - Estimated: 1 day
  - Output: Directory structure

- [ ] **7.2** Create document templates
  - Estimated: 1 day
  - Templates: Brief, Architecture
  - Output: Markdown templates

- [ ] **7.3** Build document API
  - Estimated: 2 days
  - Endpoints: CRUD for documents
  - Output: Document REST API

- [ ] **7.4** Integrate docs with file tree
  - Estimated: 1 day
  - Output: Docs visible in tree

#### Week 8: Analyst Agent
- [ ] **8.1** Design Analyst conversation flow
  - Estimated: 1 day
  - Output: Flow diagram

- [ ] **8.2** Implement Analyst agent mode
  - Estimated: 2 days
  - Output: `/analyst` command works

- [ ] **8.3** Clarifying questions logic
  - Estimated: 1 day
  - Output: Agent asks smart questions

- [ ] **8.4** Brief generation
  - Estimated: 1 day
  - Output: Structured Brief.md created

#### Week 9: Architect Agent
- [ ] **9.1** Design Architect conversation flow
  - Estimated: 1 day
  - Output: Flow diagram

- [ ] **9.2** Implement Architect agent mode
  - Estimated: 2 days
  - Output: `/architect` command works

- [ ] **9.3** Architecture generation
  - Estimated: 2 days
  - Input: Brief
  - Output: Architecture.md with diagrams

#### Week 10: BMAD Workflow
- [ ] **10.1** Agent switching UI
  - Estimated: 1 day
  - Output: Switch between agents

- [ ] **10.2** Document preview panel
  - Estimated: 1 day
  - Output: View docs in IDE

- [ ] **10.3** Document editing
  - Estimated: 1 day
  - Output: Edit docs like code

- [ ] **10.4** Workflow indicators
  - Estimated: 1 day
  - Output: Progress visual (Brief → Arch)

- [ ] **10.5** Testing and refinement
  - Estimated: 1 day
  - Output: End-to-end BMAD flow works

### Deliverables
✅ Analyst agent working  
✅ Architect agent working  
✅ Documents stored  
✅ BMAD workflow complete  

### Success Criteria
- [ ] Can create Brief via Analyst
- [ ] Can create Architecture via Architect
- [ ] Documents saved correctly
- [ ] Workflow is smooth
- [ ] Quality of outputs high

### Dependencies
- Phase 2 (AI Chat required)
- Phase 1 (File system required)

### Risks
- Agent prompt engineering complexity
- Document quality variability

**Mitigation:** Iterative prompt tuning, human review step

---

## Phase 4: Knowledge Graph (Weeks 11-14)

### Goal
Build semantic graph representation of projects

### Tasks

#### Week 11: Memgraph Setup
- [ ] **11.1** Deploy Memgraph container
  - Estimated: 0.5 days
  - Output: Memgraph running

- [ ] **11.2** Configure Neo4j driver
  - Estimated: 0.5 days
  - Output: Connection established

- [ ] **11.3** Design graph schema
  - Estimated: 1 day
  - Output: Node/relationship types defined

- [ ] **11.4** Build graph API
  - Estimated: 2 days
  - Endpoints: Query, update graph
  - Output: Graph REST API

#### Week 12: Code Analysis
- [ ] **12.1** Implement AST parser (TypeScript)
  - Estimated: 2 days
  - Library: TypeScript Compiler API
  - Output: Parse TS files

- [ ] **12.2** Extract imports/exports
  - Estimated: 1 day
  - Output: Dependency graph

- [ ] **12.3** Extract components/functions
  - Estimated: 1 day
  - Output: Component nodes

- [ ] **12.4** Store in Memgraph
  - Estimated: 1 day
  - Output: Code → graph

#### Week 13: Graph Builder
- [ ] **13.1** File watcher integration
  - Estimated: 1 day
  - Library: Chokidar
  - Output: Auto-update graph

- [ ] **13.2** Incremental graph updates
  - Estimated: 2 days
  - Output: Only changed files re-parsed

- [ ] **13.3** Document → graph integration
  - Estimated: 1 day
  - Output: Docs as graph nodes

- [ ] **13.4** Relationship inference
  - Estimated: 1 day
  - Output: Smart relationship detection

#### Week 14: Graph Visualization
- [ ] **14.1** Design graph UI
  - Estimated: 1 day
  - Output: Mockup

- [ ] **14.2** Implement D3 force layout
  - Estimated: 2 days
  - Output: Interactive graph

- [ ] **14.3** Node filtering and search
  - Estimated: 1 day
  - Output: Filter controls

- [ ] **14.4** Click handlers (node → file)
  - Estimated: 1 day
  - Output: Navigation works

### Deliverables
✅ Memgraph integrated  
✅ Code parsed to graph  
✅ Visual graph explorer  
✅ Auto-updating graph  

### Success Criteria
- [ ] Graph updates on file change
- [ ] Visualization renders < 3s
- [ ] Click node → opens file
- [ ] Relationships accurate
- [ ] 1000+ nodes performant

### Dependencies
- Phase 1 (File system required)
- Phase 3 (Documents required)

### Risks
- AST parsing complexity
- Graph performance at scale

**Mitigation:** Incremental parsing, graph pagination

---

## Phase 5: Supporting Features (Weeks 15-16)

### Goal
Add terminal, preview, and git integration

### Tasks

#### Week 15: Terminal + Preview
- [ ] **15.1** Integrate xterm.js
  - Estimated: 1 day
  - Output: Terminal renders

- [ ] **15.2** WebSocket terminal backend
  - Estimated: 1 day
  - Output: Commands execute

- [ ] **15.3** Terminal tabs
  - Estimated: 0.5 days
  - Output: Multiple terminals

- [ ] **15.4** Live preview iframe
  - Estimated: 1 day
  - Output: Preview panel

- [ ] **15.5** Hot reload for preview
  - Estimated: 1.5 days
  - Integration: Vite HMR
  - Output: Live updates

#### Week 16: Git Integration
- [ ] **16.1** Initialize git repo
  - Estimated: 0.5 days
  - Output: `.git` created

- [ ] **16.2** View changed files
  - Estimated: 1 day
  - Library: isomorphic-git
  - Output: Git status UI

- [ ] **16.3** Stage/unstage files
  - Estimated: 1 day
  - Output: Checkbox to stage

- [ ] **16.4** Commit with message
  - Estimated: 1 day
  - Output: Commit UI

- [ ] **16.5** Basic commit history
  - Estimated: 1.5 days
  - Output: Commit log view

### Deliverables
✅ Working terminal  
✅ Live preview  
✅ Git integration  

### Success Criteria
- [ ] Terminal executes commands
- [ ] Preview updates live
- [ ] Git operations work
- [ ] No blocking operations
- [ ] Smooth UX

### Dependencies
- Phase 1 (Core IDE required)

### Risks
- Terminal security
- Preview iframe restrictions

**Mitigation:** Sandboxing, CSP headers

---

## Phase 6: Polish & Launch (Weeks 17-20)

### Goal
Testing, documentation, and production readiness

### Tasks

#### Week 17: Testing
- [ ] **17.1** Unit tests (80% coverage)
  - Estimated: 3 days
  - Framework: Vitest
  - Output: Test suite

- [ ] **17.2** Integration tests
  - Estimated: 2 days
  - Output: API tests

#### Week 18: E2E Testing
- [ ] **18.1** Playwright setup
  - Estimated: 1 day
  - Output: E2E framework

- [ ] **18.2** Critical path tests
  - Estimated: 2 days
  - Scenarios: Create project, edit, save
  - Output: E2E tests passing

- [ ] **18.3** Performance testing
  - Estimated: 1 day
  - Output: Performance benchmarks

- [ ] **18.4** Bug fixes from testing
  - Estimated: 1 day
  - Output: Stable build

#### Week 19: Documentation
- [ ] **19.1** User documentation
  - Estimated: 2 days
  - Output: User guide

- [ ] **19.2** Developer documentation
  - Estimated: 1 day
  - Output: API docs

- [ ] **19.3** Video tutorials (3-5 videos)
  - Estimated: 2 days
  - Output: YouTube videos

#### Week 20: Launch Prep
- [ ] **20.1** Production deployment setup
  - Estimated: 1 day
  - Output: Deploy scripts

- [ ] **20.2** Marketing site
  - Estimated: 2 days
  - Output: Landing page

- [ ] **20.3** Beta user testing
  - Estimated: 1 day
  - Output: Feedback collected

- [ ] **20.4** Final bug fixes
  - Estimated: 1 day
  - Output: Production-ready

- [ ] **20.5** Launch! 🚀
  - Estimated: 0 days
  - Output: Public release

### Deliverables
✅ Test coverage > 80%  
✅ Complete documentation  
✅ Production deployment  
✅ Public launch  

### Success Criteria
- [ ] All tests passing
- [ ] Docs complete
- [ ] Performance targets met
- [ ] Beta feedback positive
- [ ] Launch successful

### Dependencies
- All previous phases

### Risks
- Launch delays
- Critical bugs discovered

**Mitigation:** Buffer time, beta testing

---

## Dependency Graph

```
Phase 1: Core IDE (Foundation)
    ├─> Phase 2: AI Chat
    │       ├─> Phase 3: BMAD
    │       │       └─> Phase 4: Knowledge Graph
    │       └─> Phase 5: Terminal/Preview
    └─> Phase 5: Git Integration

Phase 6: Polish & Launch (depends on all)
```

### Critical Path

**Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 6**

Total: 18 weeks critical path  
Buffer: 2 weeks (in Phase 6)

---

## Resource Allocation

### Team Structure

| Role | Weeks 1-4 | Weeks 5-10 | Weeks 11-14 | Weeks 15-20 |
|------|-----------|------------|-------------|-------------|
| **Tech Lead** | Architecture, Setup | AI Integration | Graph System | Testing, Launch |
| **Frontend Dev** | Editor, File Tree | Chat UI | Graph Viz | Polish, Docs |
| **Backend Dev** | File API | AI Service | Graph Backend | Terminal, Git |

### Time Allocation (Person-Weeks)

| Phase | Person-Weeks | FTE Required |
|-------|--------------|--------------|
| Phase 1 | 8 | 2 |
| Phase 2 | 4 | 2 |
| Phase 3 | 8 | 2 |
| Phase 4 | 8 | 2 |
| Phase 5 | 4 | 2 |
| Phase 6 | 8 | 2 |
| **Total** | **40** | **2 avg** |

---

## Risk Management

### High Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Monaco performance issues** | Medium | High | Lazy loading, virtual scrolling |
| **AI costs exceed budget** | High | Medium | Aggressive caching, cost limits |
| **Memgraph learning curve** | Medium | Medium | Prototype early, fallback to SQLite |
| **Scope creep** | High | High | Strict phase boundaries, MVP focus |

### Medium Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Browser compatibility** | Low | Medium | Test early, progressive enhancement |
| **Graph viz performance** | Medium | Medium | Pagination, level-of-detail rendering |
| **BMAD prompt quality** | Medium | Medium | Iterative tuning, user feedback |
| **Team availability** | Low | High | Buffer time, flexible scheduling |

---

## Milestones & Reviews

### Major Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| **M1: Core IDE** | End Week 4 | Can edit and save files |
| **M2: AI Working** | End Week 6 | AI chat responds with context |
| **M3: BMAD Complete** | End Week 10 | Full planning workflow |
| **M4: Graph Ready** | End Week 14 | Visual graph exploration works |
| **M5: Feature Complete** | End Week 16 | All MVP features done |
| **M6: Launch** | End Week 20 | Public release |

### Review Points

**Weekly:** Team standup, progress review  
**Bi-weekly:** Demo to stakeholders  
**End of Phase:** Phase review, go/no-go decision

---

## Success Metrics (Post-Launch)

### Week 1 After Launch
- 50+ sign-ups
- 10+ active projects created
- < 5 critical bugs
- Positive feedback (>7/10)

### Month 1 After Launch
- 100+ users
- 50+ projects
- 20% weekly active users
- < 10 support tickets/week

### Month 3 After Launch
- 500+ users
- 200+ projects
- Community forming (Discord)
- First paying customers (if applicable)

---

## Appendix

### Technology Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| **Editor** | CodeMirror, Monaco | **Monaco** | VS Code compatibility, features |
| **Runtime** | Node, Deno, Bun | **Bun** | Speed, built-in TypeScript |
| **Framework** | Express, Fastify, Hono | **Hono** | Modern, fast, TypeScript-first |
| **Graph DB** | Neo4j, Memgraph, ArangoDB | **Memgraph** | Real-time, Cypher support |
| **State** | Redux, Zustand, Jotai | **Zustand** | Simple, performant |

### Development Standards

- **Code Style:** Prettier (no semicolons, 2 spaces)
- **Commits:** Conventional Commits
- **Branches:** `main`, `develop`, `feature/*`
- **Reviews:** Required for all PRs
- **Testing:** 80% coverage minimum

---

**Document Status:** Draft  
**Next Review:** 2024-11-01  
**Approved By:** [Pending]

---

*This plan will be updated weekly based on actual progress.*
