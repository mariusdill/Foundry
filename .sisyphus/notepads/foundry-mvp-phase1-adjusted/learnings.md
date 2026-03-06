# Learnings - Foundry MVP Phase 1

## 2026-03-06 - Task 1: Prisma Database Connection

**Finding**: The plan assumed Prisma 5.x syntax, but the project uses Prisma 7.x.

**Prisma 7.x Configuration Pattern**:

- Schema file (`prisma/schema.prisma`): Only has `provider = "postgresql"` in datasource block
- Config file (`prisma.config.ts`): Contains the `url: databaseUrl` configuration

**Current State** (correct for Prisma 7.4.2):

- ✅ `prisma.config.ts` properly configures DATABASE_URL from env var
- ✅ `prisma:generate` works successfully
- ✅ No changes needed to schema.prisma

**Lesson**: Don't assume older patterns - verify the actual Prisma version and its configuration style.

---

### Page CRUD API Implementation
- Implemented dual-storage for Pages (PostgreSQL + Markdown files).
- Used `resolvePageFilePath` to determine the absolute path for markdown files based on `DATA_DIR`, space kind, space slug, and page path.
- Stored the resolved file path in the `contentPath` field of the `Page` model in the database.
- Used `writeMarkdownFile` and `readMarkdownFile` from `@foundry/database` to keep the markdown files in sync with the database.
- Hardcoded `updatedBy` to "system" in the frontmatter since authentication is not yet implemented.

## Page Listing and Search Endpoints
- Implemented simple in-memory relevance sorting for search results since full-text search is not yet available.
- Used `searchFiltersSchema.safeParse` to validate and parse query parameters for the search endpoint.
- Next.js 15 requires `params` to be awaited in API routes (e.g., `const { id } = await params;`).
