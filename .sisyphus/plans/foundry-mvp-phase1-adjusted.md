# Foundry MVP - Phase 1 (ADJUSTED)

## Status Update

**Previous State**: Plan assumed starting from near-zero
**Current State**: ~60% complete - significant high-quality work already committed

**Completed Work** (commit `42b9df2`):
- ✅ Monorepo structure (Turbo + pnpm workspace)
- ✅ Database schema (175-line Prisma schema with all models)
- ✅ Markdown storage helpers (read/write/move with gray-matter)
- ✅ Premium UI shell (sidebar, topbar, dashboard)
- ✅ Design system (dark-first CSS variables)
- ✅ All shared schemas (Zod validation)
- ✅ MCP server package skeleton

**Remaining Work**:
- 🔧 Fix Prisma schema (add DATABASE_URL)
- 📝 Create .env.example
- 🐳 Create docker-compose.yml
- 🔌 API endpoints (Space/Page CRUD)
- 🧪 Integration tests
- 📚 Documentation

**Revised Effort**: 20-30 hours (down from 80-120)

---

## Revised Phase 1 Scope

### Wave 1: Infrastructure Fixes (2-3 hours)

These are blockers that must be fixed before any API work.

- [ ] **Task 1**: Fix Prisma Database Connection

  **What to do**:
  Add `url = env("DATABASE_URL")` to the datasource block in `/packages/database/prisma/schema.prisma`

  **Current state**:
  ```prisma
  datasource db {
    provider = "postgresql"
  }
  ```

  **Required change**:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

  **Acceptance Criteria**:
  - [ ] `bun run db:generate` succeeds
  - [ ] `bun run db:migrate` can create tables

  **QA**:
  ```bash
  cd packages/database && bun run prisma:generate
  # Should complete without errors
  ```

  **Commit**: `fix(db): add DATABASE_URL to Prisma schema`

- [ ] **Task 2**: Create .env.example Template

  **What to do**:
  Create `.env.example` in project root with all required variables documented.

  **Required variables**:
  ```
  # Database
  DATABASE_URL=postgresql://user:password@localhost:5432/foundry
  
  # Authentication (NextAuth)
  AUTH_SECRET=change-me-in-production
  NEXTAUTH_URL=http://localhost:3000
  
  # Storage
  DATA_DIR=./data
  
  # Optional: Seed data
  SEED_ADMIN_EMAIL=admin@foundry.local
  SEED_ADMIN_NAME=Foundry Admin
  ```

  **Acceptance Criteria**:
  - [ ] `.env.example` exists with all variables
  - [ ] Can copy to `.env` and start services

  **Commit**: `chore(config): add .env.example template`

- [ ] **Task 3**: Create Docker Compose Configuration

  **What to do**:
  Create `docker-compose.yml` with Postgres and web services.

  **Required services**:
  - Postgres 15+ with persistent volume
  - Web service (Next.js app)
  - Proper networking and health checks

  **Acceptance Criteria**:
  - [ ] `docker-compose up -d` starts Postgres
  - [ ] Web service connects to database
  - [ ] Data persists across restarts

  **QA**:
  ```bash
  docker-compose up -d
  docker-compose ps
  # Both services should show as running
  ```

  **Commit**: `chore(deploy): add docker-compose with postgres and web`

### Wave 2: API Layer (8-12 hours)

Build the REST API that the UI will consume.

- [ ] **Task 4**: Space CRUD API Endpoints

  **What to do**:
  Create REST endpoints for Space operations:
  - `GET /api/spaces` - list all spaces
  - `POST /api/spaces` - create space
  - `GET /api/spaces/[id]` - get space by ID
  - `PATCH /api/spaces/[id]` - update space
  - `DELETE /api/spaces/[id]` - delete space

  **Integration requirements**:
  - Creating a space should create folder on disk
  - Deleting a space should remove folder
  - Use existing markdown storage helpers

  **Acceptance Criteria**:
  - [ ] All endpoints return proper JSON
  - [ ] Creating space creates `/data/{slug}/` folder
  - [ ] Validation errors return 400 with details

  **QA**:
  ```bash
  # Create space
  curl -X POST http://localhost:3000/api/spaces \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","slug":"test","kind":"projects"}'
  
  # Verify folder created
  ls data/test/
  
  # List spaces
  curl http://localhost:3000/api/spaces | jq '.'
  ```

  **Commit**: `feat(api): add Space CRUD endpoints`

- [ ] **Task 5**: Page CRUD API Endpoints

  **What to do**:
  Create REST endpoints for Page operations:
  - `GET /api/pages` - list pages (with filters)
  - `POST /api/pages` - create page
  - `GET /api/pages/[id]` - get page with markdown content
  - `PATCH /api/pages/[id]` - update page
  - `DELETE /api/pages/[id]` - delete page

  **Integration requirements**:
  - Creating page writes markdown file with frontmatter
  - Reading page reads from markdown file
  - Frontmatter stays in sync with database

  **Acceptance Criteria**:
  - [ ] Page persists to markdown file on create
  - [ ] Page content reads from markdown file
  - [ ] Frontmatter includes all required fields

  **QA**:
  ```bash
  # Create page
  curl -X POST http://localhost:3000/api/pages \
    -H "Content-Type: application/json" \
    -d '{
      "spaceId": "...",
      "title": "Test Page",
      "slug": "test-page",
      "path": "test-page",
      "markdown": "# Hello World"
    }'
  
  # Verify markdown file
  cat data/{space-slug}/test-page.md
  # Should show YAML frontmatter + markdown content
  ```

  **Commit**: `feat(api): add Page CRUD endpoints with markdown storage`

- [ ] **Task 6**: Listing and Search Endpoints

  **What to do**:
  - `GET /api/spaces/[id]/pages` - pages in space
  - `GET /api/pages/recent` - recently updated pages
  - `GET /api/pages/pinned` - pinned pages
  - `GET /api/search?q=...` - basic search (title/content)

  **Acceptance Criteria**:
  - [ ] Recent pages sorted by updatedAt
  - [ ] Search returns matching pages
  - [ ] Results include title, excerpt, metadata

  **QA**:
  ```bash
  # Search
  curl "http://localhost:3000/api/search?q=hello" | jq '.'
  
  # Recent pages
  curl http://localhost:3000/api/pages/recent | jq '.'
  ```

  **Commit**: `feat(api): add listing and search endpoints`

### Wave 3: Integration & Testing (6-8 hours)

Ensure the dual-storage model works reliably.

- [ ] **Task 7**: Dual-Storage Integration Tests

  **What to do**:
  Write tests that verify database and filesystem stay in sync.

  **Test scenarios**:
  - Create page → verify DB record + markdown file
  - Update page → verify both updated
  - Delete page → verify both removed
  - Error handling: DB succeeds, file fails
  - Concurrent writes (if applicable)

  **Acceptance Criteria**:
  - [ ] All storage operations tested
  - [ ] Error scenarios covered
  - [ ] Tests run in CI/local

  **QA**:
  ```bash
  bun test packages/database/tests/storage-sync.test.ts
  # All tests should pass
  ```

  **Commit**: `test(api): add dual-storage integration tests`

- [ ] **Task 8**: API Contract Documentation

  **What to do**:
  Document the REST API endpoints.

  **Required**:
  - OpenAPI/Swagger spec (optional for v1)
  - README with endpoint descriptions
  - Example requests/responses

  **Acceptance Criteria**:
  - [ ] All endpoints documented
  - [ ] Example requests provided
  - [ ] Error responses documented

  **Commit**: `docs(api): add API endpoint documentation`

### Wave 4: Docker End-to-End (2-3 hours)

Verify everything works in containers.

- [ ] **Task 9**: Docker Compose Integration Test

  **What to do**:
  Test complete flow in Docker environment.

  **Test flow**:
  1. `docker-compose up -d` on clean machine
  2. Run migrations
  3. Create space via API
  4. Create page via API
  5. Verify files on disk
  6. Search finds content

  **Acceptance Criteria**:
  - [ ] Clean start succeeds
  - [ ] All API operations work
  - [ ] Data persists after restart

  **QA**:
  ```bash
  docker-compose down -v
  docker-compose up -d
  sleep 10
  
  # Run acceptance test suite
  ./scripts/e2e-test.sh
  ```

  **Commit**: `chore(deploy): verify docker-compose end-to-end`

---

## Verification Checklist

### Phase 1 Complete When:
- [ ] Prisma connects and migrates
- [ ] Docker Compose starts everything
- [ ] Space CRUD works via API
- [ ] Page CRUD writes to markdown files
- [ ] Search finds pages
- [ ] Dual-storage sync tested
- [ ] All tests pass

### Verification Commands:
```bash
# 1. Start services
docker-compose up -d

# 2. Run migrations
bun run db:migrate

# 3. Test API
curl -X POST http://localhost:3000/api/spaces \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test"}'

curl http://localhost:3000/api/spaces | jq '.'

# 4. Run tests
bun test

# 5. Verify files
ls -la data/
```

---

## Progress Tracking

| Wave | Tasks | Est. Hours | Status |
|------|-------|------------|--------|
| Wave 1: Infrastructure | 3 | 2-3 | 🔴 Not Started |
| Wave 2: API Layer | 3 | 8-12 | 🔴 Not Started |
| Wave 3: Integration | 2 | 6-8 | 🔴 Not Started |
| Wave 4: Docker E2E | 1 | 2-3 | 🔴 Not Started |
| **Total** | **9** | **18-26** | **~60% Done** |

---

## Notes

- **UI is done**: Don't rebuild AppShell, Dashboard, or design system
- **Storage layer exists**: Use existing `markdown.ts` helpers
- **Schemas exist**: Use Zod schemas from `@foundry/shared`
- **Focus on API**: The UI exists but has no backend to talk to
- **Docker is critical**: Acceptance criterion #15 requires it

## Next Phases (Future)

- **Phase 2**: Authentication, roles, permissions
- **Phase 3**: Tiptap editor, draft workflow, version history
- **Phase 4**: Token management, MCP server implementation
- **Phase 5**: Deployment docs, final polish
