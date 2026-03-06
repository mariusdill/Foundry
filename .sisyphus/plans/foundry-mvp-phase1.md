# Foundry MVP Implementation Plan

## TL;DR

> **Build a premium dark-first knowledge workspace with markdown-backed storage, draft-first agent workflows, and comprehensive audit trails.**
> 
> **Deliverables**: Production-ready MVP with 5 phases covering infrastructure, core features, draft workflows, agent access, and deployment
> 
> **Estimated Effort**: XL (80-120 hours)
> **Parallel Execution**: YES - 4-6 waves per phase
> **Critical Path**: Infrastructure → Storage Layer → Core Models → UI Shell → Draft Flow → API/MCP → Polish

---

## Context

### Original Request
Build "Foundry" - a modern knowledge workspace for humans and AI agents that feels premium, is dark-first, and implements a draft-first workflow where agents cannot directly edit stable content.

### Analysis Summary
The SPEC.md (1629 lines) provides excellent product vision but has implementation gaps:
- Database connection string missing in Prisma schema
- No environment configuration template
- Underspecified features (mermaid, attachments, profile settings)
- High-risk dual-storage model (Postgres + filesystem)
- Complex draft-promotion workflow not fully defined

### Metis Review Findings
**Identified Gaps** (addressed in this plan):
- ✅ Database schema fix included in Phase 1
- ✅ Environment configuration as first deliverable
- ✅ Docker Compose setup prioritized
- ✅ Markdown storage contract defined before implementation
- ✅ Simplified Phase 1 (no auth initially)
- ✅ Risk mitigation for dual-storage model
- ✅ Deferred complex features to later phases

---

## Work Objectives

### Core Objective
Implement a production-ready MVP of Foundry that passes all 15 acceptance criteria from SPEC.md, with working dual-storage (Postgres + markdown files), draft-first workflows, and agent-safe API/MCP access.

### Concrete Deliverables
- Docker Compose setup with Postgres + web services
- Next.js web app with dark-first design system
- REST API with OpenAPI spec
- MCP server package (stdio transport)
- Database schema with Prisma
- Markdown storage layer with YAML frontmatter
- Token management UI with scoped permissions
- Audit log for all write operations
- Comprehensive documentation

### Definition of Done
- [ ] `docker-compose up` starts everything on clean machine
- [ ] All 15 acceptance criteria pass via automated verification
- [ ] Dark mode UI with premium feel
- [ ] Agents can read but only write to drafts
- [ ] Audit log shows all writes with attribution

### Must Have
- Spaces and nested pages
- Markdown-backed storage
- Draft-first workflow
- Token-based API access with scopes
- Audit logging
- Search (even if simplified)
- MCP server tools
- Docker deployment

### Must NOT Have (Guardrails)
- ❌ Realtime collaboration (SPEC explicitly excludes)
- ❌ Graph visualizations (SPEC explicitly excludes)
- ❌ Notion-like databases (SPEC explicitly excludes)
- ❌ Semantic search (SPEC excludes for v1)
- ❌ Team chat/notifications (SPEC excludes)
- ❌ Over-engineered abstractions
- ❌ Features from "Do NOT implement" list

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (node_modules, pnpm-lock.yaml present)
- **Automated tests**: Tests-after (not TDD)
- **Framework**: bun test (already configured)
- **If TDD**: Each task includes test cases as part of acceptance criteria

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Database**: Use Prisma CLI — Query, verify data integrity
- **Filesystem**: Use Bash (ls/cat) — Verify file creation, content, structure

---

## Execution Strategy

### Parallel Execution Waves

**Maximize throughput** by grouping independent tasks into parallel waves. Each wave completes before the next begins. Target: 5-8 tasks per wave.

```
PHASE 1: Infrastructure & Foundation
Wave 1 (Foundation - unblock everything):
├── Task 1: Fix Prisma schema (connection string)
├── Task 2: Create .env.example
├── Task 3: Create docker-compose.yml
└── Task 4: Verify Docker setup works

Wave 2 (Storage Layer):
├── Task 5: Define markdown storage contract
├── Task 6: Implement markdown helpers (read/write/parse)
├── Task 7: Create storage integration tests
└── Task 8: Add folder structure utilities

Wave 3 (Design System):
├── Task 9: Complete design token system (CSS variables)
├── Task 10: Create theme provider
├── Task 11: Build app shell (sidebar + topbar)
└── Task 12: Create dashboard shell

Wave 4 (Core Models - API only):
├── Task 13: Space CRUD API endpoints
├── Task 14: Page CRUD API endpoints (no auth)
├── Task 15: Basic listing endpoints
└── Task 16: Integration tests for dual-storage sync

Critical Path: 1→2→3→5→6→13→14→16
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix

**Phase 1 Dependencies:**
- **1-4**: — — 5-8, 2
- **5-8**: — — 9-12, 3
- **9-12**: — — 13-16, 4
- **13-16**: 5-8, 1-4 — Phase 2, 5

**Phase 2 Dependencies:**
- **17-20**: 13-16 — 21-24, 6
- **21-24**: 17-20 — Phase 3, 7

**Phase 3 Dependencies:**
- **25-28**: 21-24 — 29-32, 8
- **29-32**: 25-28 — Phase 4, 9

**Phase 4 Dependencies:**
- **33-36**: 29-32 — 37-40, 10
- **37-40**: 33-36 — Phase 5, 11

**Phase 5 Dependencies:**
- **41-45**: 37-40 — Final Verification, 12

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

### PHASE 1: Infrastructure & Foundation

- [ ] 1. Fix Prisma Database Schema

  **What to do**:
  - Add `url = env("DATABASE_URL")` to datasource block in `/packages/database/prisma/schema.prisma`
  - Verify Prisma can generate client
  - Run initial migration
  - Document the schema structure

  **Must NOT do**:
  - Change any model definitions
  - Add new fields or relations
  - Modify existing migrations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
    - Simple Prisma configuration fix
  - **Skills Evaluated but Omitted**:
    - None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 5-16, Phase 2
  - **Blocked By**: None

  **References**:
  - `/packages/database/prisma/schema.prisma:7-8` - Where to add connection string
  - Prisma docs: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#datasource

  **Acceptance Criteria**:
  - [ ] `DATABASE_URL` environment variable used in schema
  - [ ] `bun run db:generate` succeeds
  - [ ] `bun run db:migrate` succeeds (creates tables)

  **QA Scenarios**:
  ```
  Scenario: Prisma client generates successfully
    Tool: Bash
    Steps:
      1. cd /packages/database && bun run db:generate
      2. Verify node_modules/.prisma/client/index.js exists
    Expected Result: Generation completes without errors
    Evidence: .sisyphus/evidence/task-1-prisma-generate.txt
  
  Scenario: Database connects and migrates
    Tool: Bash
    Preconditions: Docker Compose running with Postgres
    Steps:
      1. DATABASE_URL="postgresql://postgres:postgres@localhost:5432/foundry" bun run db:migrate
      2. psql $DATABASE_URL -c "\dt" | grep -i space
    Expected Result: Migration succeeds, tables created
    Evidence: .sisyphus/evidence/task-1-migrate.txt
  ```

  **Evidence to Capture**:
  - [ ] Prisma generate output
  - [ ] Migration success output
  - [ ] Table list showing created tables

  **Commit**: YES
  - Message: `fix(db): add DATABASE_URL to Prisma schema`
  - Files: `/packages/database/prisma/schema.prisma`
  - Pre-commit: `bun run db:generate`

- [ ] 2. Create Environment Configuration Template

  **What to do**:
  - Create `.env.example` in project root
  - Include all required environment variables
  - Document each variable's purpose
  - Add sensible defaults where safe

  **Must NOT do**:
  - Include real secrets or passwords
  - Add variables not yet implemented
  - Make .env.example executable

  **Required Variables**:
  ```
  # Database
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foundry
  
  # NextAuth
  NEXTAUTH_SECRET=change-me-in-production
  NEXTAUTH_URL=http://localhost:3000
  
  # Storage
  DATA_PATH=./data
  
  # Optional: Trusted reverse proxy auth
  # TRUSTED_HEADER_USER=X-Forwarded-User
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1, 3, 4)
  - **Parallel Group**: Wave 1
  - **Blocks**: All database-dependent tasks
  - **Blocked By**: None

  **References**:
  - Current files needing env vars: schema.prisma, auth config (future)

  **Acceptance Criteria**:
  - [ ] `.env.example` exists in project root
  - [ ] All required variables documented
  - [ ] Can copy to `.env` and start services

  **QA Scenarios**:
  ```
  Scenario: Environment template is complete
    Tool: Bash
    Steps:
      1. cat .env.example | grep -E "^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|DATA_PATH)"
    Expected Result: All required vars present with examples
    Evidence: .sisyphus/evidence/task-2-env-template.txt
  
  Scenario: Template can be used to start services
    Tool: Bash
    Steps:
      1. cp .env.example .env
      2. docker-compose up -d
      3. sleep 5 && docker-compose ps
    Expected Result: Postgres container running
    Evidence: .sisyphus/evidence/task-2-docker-ps.txt
  ```

  **Commit**: YES (with Task 1)
  - Message: `chore(config): add .env.example with required variables`
  - Files: `.env.example`

- [ ] 3. Create Docker Compose Configuration

  **What to do**:
  - Create `docker-compose.yml` with Postgres + web services
  - Configure volume mounts for /data directory
  - Add health checks
  - Set up networking between services
  - Document startup process

  **Must NOT do**:
  - Add Redis (not needed per SPEC)
  - Add vector DB (not needed per SPEC)
  - Use complex orchestration (keep it simple)

  **Services Required**:
  - `postgres`: PostgreSQL 15+ with persistent volume
  - `web`: Next.js app with hot reload for dev

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1, 2, 4)
  - **Parallel Group**: Wave 1
  - **Blocks**: All tasks requiring database
  - **Blocked By**: None

  **References**:
  - SPEC.md:1401-1420 - Deployment requirements
  - Standard Docker Compose patterns for Next.js + Postgres

  **Acceptance Criteria**:
  - [ ] `docker-compose up -d` starts Postgres
  - [ ] Web service starts and connects to Postgres
  - [ ] Volume persists data across restarts
  - [ ] Health checks pass

  **QA Scenarios**:
  ```
  Scenario: Docker Compose starts successfully
    Tool: Bash
    Steps:
      1. docker-compose down -v  # Clean slate
      2. docker-compose up -d
      3. sleep 10
      4. docker-compose ps
    Expected Result: Both services running and healthy
    Evidence: .sisyphus/evidence/task-3-compose-up.txt
  
  Scenario: Postgres persists data
    Tool: Bash
    Steps:
      1. docker-compose exec postgres psql -U postgres -c "CREATE TABLE test (id INT);"
      2. docker-compose restart postgres
      3. docker-compose exec postgres psql -U postgres -c "SELECT * FROM test;"
    Expected Result: Table still exists after restart
    Evidence: .sisyphus/evidence/task-3-persist.txt
  ```

  **Commit**: YES (with Tasks 1-2)
  - Message: `chore(deploy): add docker-compose with postgres and web services`
  - Files: `docker-compose.yml`

- [ ] 4. Verify Development Environment Setup

  **What to do**:
  - Test complete setup from clean state
  - Document any additional prerequisites
  - Create quick-start instructions
  - Verify all package installations work

  **Must NOT do**:
  - Assume user's environment matches yours
  - Skip testing on actual clean state

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 1-3)
  - **Parallel Group**: Wave 1
  - **Blocks**: None (verification task)
  - **Blocked By**: Tasks 1-3 (conceptually)

  **Acceptance Criteria**:
  - [ ] Fresh clone + setup works end-to-end
  - [ ] All services start and communicate
  - [ ] Database migrations run successfully
  - [ ] Web app is accessible

  **QA Scenarios**:
  ```
  Scenario: Fresh setup works
    Tool: Bash
    Steps:
      1. Verify .env exists (cp .env.example .env)
      2. docker-compose up -d
      3. bun install
      4. bun run db:migrate
      5. curl -s http://localhost:3000 | head -20
    Expected Result: Web app responds with HTML
    Evidence: .sisyphus/evidence/task-4-fresh-setup.html
  ```

  **Commit**: NO (verification only)

### Wave 2: Storage Layer

- [ ] 5. Define Markdown Storage Contract

  **What to do**:
  - Document file naming conventions
  - Define folder structure
  - Specify YAML frontmatter schema
  - Document encoding and line endings
  - Define path resolution logic

  **Storage Contract**:
  ```
  Base Path: {DATA_PATH}/{spaceSlug}/
  Page File: {basePath}/{pagePath}/{slug}.md
  Draft File: {DATA_PATH}/drafts/{draftId}.md
  
  Frontmatter Schema:
  ---
  id: <uuid>
  title: <string>
  slug: <string>
  space: <string>
  path: <string>
  status: draft|stable|archived
  tags: [<string>]
  updatedBy: <string>
  updatedAt: <ISO8601>
  source: human|agent
  pinned: boolean
  ---
  
  Content: Markdown body after frontmatter
  ```

  **Must NOT do**:
  - Change the contract without updating all consumers
  - Use different conventions in different places

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - This is architecture documentation

  **Parallelization**:
  - **Can Run In Parallel**: NO (must complete before Task 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 6-8, 13-16
  - **Blocked By**: Tasks 1-4

  **References**:
  - SPEC.md:951-1000 - Content model section
  - SPEC.md:955-960 - Folder structure

  **Acceptance Criteria**:
  - [ ] Contract documented in `/docs/storage-contract.md`
  - [ ] All SPEC requirements captured
  - [ ] Path resolution logic defined
  - [ ] Frontmatter schema validated

  **QA Scenarios**:
  ```
  Scenario: Contract is complete and clear
    Tool: Bash
    Steps:
      1. cat docs/storage-contract.md | wc -l
      2. grep -E "(id|title|slug|space|path|status|tags|updatedBy|updatedAt|source|pinned)" docs/storage-contract.md
    Expected Result: Document exists with all required fields
    Evidence: .sisyphus/evidence/task-5-contract.txt
  ```

  **Commit**: YES
  - Message: `docs: define markdown storage contract`
  - Files: `/docs/storage-contract.md`

- [ ] 6. Implement Markdown Storage Helpers

  **What to do**:
  - Create `/packages/database/src/markdown.ts`
  - Implement readPage(slug): returns {frontmatter, content}
  - Implement writePage(slug, data): writes file with YAML frontmatter
  - Implement parseFrontmatter(yaml): validates and parses
  - Implement serializeFrontmatter(data): converts to YAML
  - Handle file system errors gracefully

  **Must NOT do**:
  - Use sync methods (use async/await)
  - Skip error handling
  - Hardcode paths (use configurable DATA_PATH)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - File system operations
    - YAML parsing

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 7-8, 13-16
  - **Blocked By**: Task 5

  **References**:
  - Contract from Task 5
  - YAML libraries: yaml, js-yaml
  - Node.js fs/promises API

  **Acceptance Criteria**:
  - [ ] Can read markdown file with frontmatter
  - [ ] Can write markdown file with frontmatter
  - [ ] Frontmatter is validated against schema
  - [ ] Errors are handled and reported

  **QA Scenarios**:
  ```
  Scenario: Write and read roundtrip works
    Tool: Bash (Node.js REPL)
    Steps:
      1. Create test script that uses markdown.ts
      2. Write page with frontmatter
      3. Read page back
      4. Compare input/output
    Expected Result: Data matches after roundtrip
    Evidence: .sisyphus/evidence/task-6-roundtrip.json
  
  Scenario: Invalid frontmatter rejected
    Tool: Bash (Node.js REPL)
    Steps:
      1. Try to parse frontmatter with missing required field
      2. Verify error is thrown
    Expected Result: Validation error with clear message
    Evidence: .sisyphus/evidence/task-6-validation-error.txt
  ```

  **Commit**: YES
  - Message: `feat(storage): implement markdown read/write helpers`
  - Files: `/packages/database/src/markdown.ts`

- [ ] 7. Create Storage Integration Tests

  **What to do**:
  - Test dual-storage sync (DB + filesystem)
  - Test concurrent writes
  - Test error recovery
  - Test file system edge cases (missing files, permissions)

  **Must NOT do**:
  - Test implementation details (test behavior)
  - Skip cleanup after tests

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Testing dual-storage is complex

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 13-16
  - **Blocked By**: Task 6

  **Acceptance Criteria**:
  - [ ] All storage operations have tests
  - [ ] Dual-storage consistency verified
  - [ ] Error cases covered

  **QA Scenarios**:
  ```
  Scenario: Storage tests pass
    Tool: Bash
    Steps:
      1. bun test packages/database/src/markdown.test.ts
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-7-tests.txt
  ```

  **Commit**: YES (with Task 6)
  - Message: `test(storage): add integration tests for markdown storage`
  - Files: `/packages/database/src/markdown.test.ts`

- [ ] 8. Add Folder Structure Utilities

  **What to do**:
  - Implement ensureFolder(path): creates if not exists
  - Implement listFolders(basePath): returns space folders
  - Implement deleteFolder(path): with safety checks
  - Implement moveFolder(oldPath, newPath): for space rename

  **Must NOT do**:
  - Allow deletion of non-empty folders without checks
  - Use rm -rf without confirmation

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 13-16
  - **Blocked By**: Task 6

  **Acceptance Criteria**:
  - [ ] Folders can be created
  - [ ] Folder listing works
  - [ ] Safety checks prevent accidental deletion

  **QA Scenarios**:
  ```
  Scenario: Folder operations work
    Tool: Bash
    Steps:
      1. Create test folder
      2. List and verify
      3. Delete and verify cleanup
    Expected Result: All operations succeed safely
    Evidence: .sisyphus/evidence/task-8-folders.txt
  ```

  **Commit**: YES (with Tasks 6-7)
  - Message: `feat(storage): add folder structure utilities`
  - Files: `/packages/database/src/folders.ts`

### Wave 3: Design System

- [ ] 9. Complete Design Token System

  **What to do**:
  - Create CSS variables for all design tokens
  - Implement dark mode as default
  - Add light mode support
  - Create token documentation

  **Required Tokens** (from SPEC.md:371-452):
  ```css
  :root {
    --background: #0a0a0b;
    --surface-1: #141416;
    --surface-2: #1c1c1f;
    --surface-3: #232326;
    --border-subtle: #27272a;
    --border-strong: #3f3f46;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --text-muted: #71717a;
    --accent: #6366f1;
    --accent-agent: #8b5cf6;
    --accent-draft: #f59e0b;
    --accent-stable: #22c55e;
  }
  ```

  **Must NOT do**:
  - Use hardcoded colors
  - Skip accessibility checks

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
    - CSS expertise needed

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 10-12)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 11-12, Phase 2 UI tasks
  - **Blocked By**: Tasks 1-8

  **Acceptance Criteria**:
  - [ ] All tokens defined in CSS
  - [ ] Dark mode works
  - [ ] Tokens used consistently

  **QA Scenarios**:
  ```
  Scenario: Design tokens are applied
    Tool: Playwright
    Steps:
      1. Navigate to any page
      2. Screenshot
      3. Verify dark background color
    Expected Result: Dark theme applied
    Evidence: .sisyphus/evidence/task-9-theme.png
  ```

  **Commit**: YES
  - Message: `feat(ui): implement complete design token system`
  - Files: `/apps/web/styles/tokens.css`

- [ ] 10. Create Theme Provider

  **What to do**:
  - Create React context for theme
  - Implement theme toggle
  - Persist theme preference
  - Apply theme class to document

  **Must NOT do**:
  - Use localStorage without SSR handling

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 9, 11-12)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 1-8

  **Commit**: YES (with Task 9)
  - Message: `feat(ui): add theme provider and toggle`
  - Files: `/apps/web/components/theme-provider.tsx`

- [ ] 11. Build App Shell (Sidebar + Topbar)

  **What to do**:
  - Implement sidebar with sections from SPEC.md:531-558
  - Implement top bar with breadcrumbs from SPEC.md:561-574
  - Make layout responsive
  - Add keyboard navigation

  **Must NOT do**:
  - Implement actual navigation logic (just UI)
  - Add animations yet

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
    - Layout components

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 12, Phase 2 UI
  - **Blocked By**: Task 9

  **Commit**: YES
  - Message: `feat(ui): build app shell with sidebar and topbar`
  - Files: `/apps/web/components/sidebar.tsx`, `/apps/web/components/topbar.tsx`

- [ ] 12. Create Dashboard Shell

  **What to do**:
  - Implement dashboard layout from SPEC.md:601-638
  - Add placeholder sections
  - Style according to design system

  **Must NOT do**:
  - Connect to real data yet
  - Implement full dashboard features

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 11)
  - **Parallel Group**: Wave 3
  - **Blocks**: Phase 2 dashboard implementation
  - **Blocked By**: Task 11

  **Commit**: YES (with Task 11)
  - Message: `feat(ui): create dashboard shell layout`
  - Files: `/apps/web/app/dashboard/page.tsx`

### Wave 4: Core Models (API Only)

- [ ] 13. Space CRUD API Endpoints

  **What to do**:
  - POST /api/spaces - create space
  - GET /api/spaces - list spaces
  - GET /api/spaces/:id - get space
  - PATCH /api/spaces/:id - update space
  - DELETE /api/spaces/:id - delete space
  - Integrate with markdown storage

  **Must NOT do**:
  - Add auth middleware yet
  - Implement UI for these endpoints

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
    - API design
    - Database operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 14)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 15-16, Phase 2
  - **Blocked By**: Tasks 5-8

  **References**:
  - SPEC.md:1273-1299 - API requirements
  - Prisma schema for Space model

  **Acceptance Criteria**:
  - [ ] All CRUD endpoints work
  - [ ] Creating space creates folder on disk
  - [ ] Deleting space removes folder

  **QA Scenarios**:
  ```
  Scenario: Space CRUD works
    Tool: Bash (curl)
    Steps:
      1. POST /api/spaces -d '{"name":"Test","slug":"test"}'
      2. Verify response has id
      3. Verify folder created: ls data/test/
      4. GET /api/spaces - verify in list
      5. DELETE /api/spaces/{id}
      6. Verify folder removed
    Expected Result: Full CRUD cycle works
    Evidence: .sisyphus/evidence/task-13-space-crud.json
  ```

  **Commit**: YES
  - Message: `feat(api): add Space CRUD endpoints`
  - Files: `/apps/web/app/api/spaces/route.ts`, `/apps/web/app/api/spaces/[id]/route.ts`

- [ ] 14. Page CRUD API Endpoints

  **What to do**:
  - POST /api/pages - create page
  - GET /api/pages - list pages
  - GET /api/pages/:id - get page
  - PATCH /api/pages/:id - update page
  - DELETE /api/pages/:id - delete page
  - Handle markdown read/write

  **Must NOT do**:
  - Handle draft/stable logic yet
  - Add auth

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 13)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 15-16, Phase 2
  - **Blocked By**: Tasks 5-8

  **Acceptance Criteria**:
  - [ ] Page CRUD works
  - [ ] Markdown files created on write
  - [ ] Frontmatter preserved

  **QA Scenarios**:
  ```
  Scenario: Page CRUD with markdown
    Tool: Bash (curl)
    Steps:
      1. Create space first
      2. POST /api/pages -d '{"title":"Test","slug":"test","spaceId":"..."}'
      3. Verify markdown file created: cat data/{space}/test.md
      4. Verify frontmatter has id, title, etc.
      5. GET /api/pages/{id} - verify content
    Expected Result: Page persists to markdown
    Evidence: .sisyphus/evidence/task-14-page-crud.md
  ```

  **Commit**: YES (with Task 13)
  - Message: `feat(api): add Page CRUD endpoints with markdown storage`
  - Files: `/apps/web/app/api/pages/route.ts`, `/apps/web/app/api/pages/[id]/route.ts`

- [ ] 15. Basic Listing Endpoints

  **What to do**:
  - GET /api/spaces/:id/pages - list pages in space
  - GET /api/pages/recent - recent pages
  - GET /api/pages/pinned - pinned pages

  **Must NOT do**:
  - Add pagination yet (can be added later)
  - Add complex filtering

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 13-14)
  - **Parallel Group**: Wave 4
  - **Blocks**: Phase 2 UI
  - **Blocked By**: Tasks 13-14

  **Commit**: YES (with Tasks 13-14)
  - Message: `feat(api): add page listing endpoints`
  - Files: `/apps/web/app/api/spaces/[id]/pages/route.ts`

- [ ] 16. Integration Tests for Dual-Storage Sync

  **What to do**:
  - Test that DB and filesystem stay in sync
  - Test edge cases (DB write succeeds, file write fails)
  - Test recovery scenarios
  - Document reconciliation strategy

  **Must NOT do**:
  - Skip error scenarios
  - Assume perfect filesystem

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []
    - Critical test coverage

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 13-15)
  - **Parallel Group**: Wave 4
  - **Blocks**: Phase 2
  - **Blocked By**: Tasks 13-15

  **Acceptance Criteria**:
  - [ ] Sync verified under normal operation
  - [ ] Error scenarios tested
  - [ ] Recovery documented

  **QA Scenarios**:
  ```
  Scenario: Dual storage consistency
    Tool: Bash (test script)
    Steps:
      1. Create page via API
      2. Verify DB record exists
      3. Verify file exists with same data
      4. Update page
      5. Verify both updated
    Expected Result: Consistency maintained
    Evidence: .sisyphus/evidence/task-16-consistency.txt
  ```

  **Commit**: YES
  - Message: `test(api): add dual-storage integration tests`
  - Files: `/apps/web/tests/integration/storage-sync.test.ts`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Phase Completion Criteria

### Phase 1 Complete When:
- [ ] Docker Compose runs Postgres + web
- [ ] Prisma schema fixed and migrations work
- [ ] Markdown storage helpers tested
- [ ] Space and Page CRUD APIs work
- [ ] Dual-storage sync verified
- [ ] App shell renders with design tokens

### MVP Complete When (All Phases):
- [ ] All 15 acceptance criteria from SPEC.md pass
- [ ] docker-compose up works on clean machine
- [ ] All evidence files captured
- [ ] All 4 final verification agents approve

---

## Commit Strategy

- **Phase 1**: Grouped commits by wave
  - Wave 1: Tasks 1-4
  - Wave 2: Tasks 5-8
  - Wave 3: Tasks 9-12
  - Wave 4: Tasks 13-16
- **Phases 2-5**: To be planned after Phase 1 success

---

## Success Criteria

### Verification Commands
```bash
# Phase 1 verification
docker-compose up -d
curl -s http://localhost:3000/api/spaces | jq '.'
curl -s http://localhost:3000/api/pages | jq '.'
bun test
```

### Final Checklist
- [ ] All 15 SPEC acceptance criteria pass
- [ ] All "Must Have" features present
- [ ] All "Must NOT Have" features absent
- [ ] All tests pass
- [ ] Docker deployment works
- [ ] Evidence files in .sisyphus/evidence/
