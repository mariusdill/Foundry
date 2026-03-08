# Foundry Work Home MVP

## TL;DR

> **Summary**: Transform Foundry from a knowledge base into a visual work home—personal, actionable, and workflow-driven—while keeping the existing data model. Build a premium dark shell with personal "My Work" views, kanban workflow visualization, page linking, and inline checklists.
> **Deliverables**:
>
> - Persistent authenticated App Router shell with unified navigation
> - Personal "My Work" home: attention filtering, continue working, your activity
> - Kanban/board view for workflow state visualization (draft → review → stable)
> - Page linking with backlinks (`[[Page Title]]` syntax)
> - Inline checklists within markdown pages
> - Refactored MVP screens: spaces, pages, editor on unified shell
> - Playwright authenticated smoke coverage with stable seeded auth
>   **Effort**: Large
>   **Parallel**: YES - 3 waves
>   **Critical Path**: 1 -> 2 -> 3 -> 6 -> 7 -> 8 -> 9 -> 10

## Context

### Original Request

- User wants Foundry to match the design and feature feel of `/home/dillmar/repos/v0-knowledge-base`, not the current bootstrap UI.
- User explicitly selected a full shell upgrade and included Playwright in this refactor.
- **User clarified**: The app should feel like a "visual work home" for projects, tasks, docs, ideas, history, and execution—not just a knowledge base.

### What "Work Home" Means

Based on research of Huly, AppFlowy, AFFiNE, Plane, and similar tools:

**Work Home vs Knowledge Base:**

- **Personal first**: "Your Work" > "All Content" (filtered by what matters to you)
- **State over storage**: Workflow status (doing/done/blocked) > folder hierarchy
- **Action-oriented**: Every screen answers "what do I do next?"
- **Multiple views**: Same data, different visualizations (list vs kanban vs timeline)
- **Connected work**: Pages link to each other, not isolated documents

**What Foundry Already Has (that we can build on):**

- Users, Spaces, Pages with status (draft/stable/archived)
- Audit events for activity tracking
- Space memberships for permissions
- Version history

**What We're Adding (within existing data model):**

- Personal "My Work" filtering (pages you touched, drafts in your spaces)
- Kanban view using existing Page.status
- Page linking via `[[Title]]` syntax + backlink tracking
- Inline checklists via markdown `- [ ]` syntax

### Interview Summary

- Preserve MVP scope from `SPEC.md` and keep the product dark-first, premium, calm, technical, and dense rather than flashy.
- Use shadcn-style product-shell patterns, but do not copy the reference app literally.
- Planning default: build a truly persistent authenticated shell via App Router layout composition, not repeated per-page `AppShell` wrappers.
- Planning default: keep `apps/web/src/components/ui/*` as the only primitive source in this refactor and defer `packages/ui/*` consolidation.
- Planning default: include actual command palette behavior and Playwright-based authenticated smoke tests.
- Planning default: treat the known `src/auth/secret.test.ts` failure as separate from the UI refactor unless it directly blocks the new QA harness.
- **NEW**: Transform from "knowledge operations dashboard" to "personal work home" without adding new backend entities.

## Work Objectives

### Core Objective

Deliver a visual work home that makes Foundry feel personal, actionable, and workflow-driven—optimizing for "what do I do next?" rather than "where do I find this?"

### Deliverables

- Authenticated `(app)` layout with persistent sidebar, top bar, content inset, and command palette.
- **Personal "My Work" home** showing:
  - Needs attention: Drafts in your spaces + recent changes to pages you edited
  - Continue working: Pages you recently touched
  - Your activity: Audit trail filtered to your work
  - Quick actions: Create page, review drafts, search
- **Kanban/board view** for spaces showing pages by status (draft → review → stable → archived)
- **Page linking** with `[[Page Title]]` syntax and backlink visualization
- **Inline checklists** within markdown pages via `- [ ]` syntax
- Refactored MVP screens: spaces index, space detail, page detail, page edit, and login on unified shell.
- Playwright E2E setup with authenticated smoke coverage and deterministic env handling.

### Definition of Done (verifiable conditions with commands)

- `pnpm --filter @foundry/web lint` exits 0.
- `pnpm --filter @foundry/web typecheck` exits 0.
- `pnpm --filter @foundry/web build` exits 0.
- `pnpm --filter @foundry/web test` exits 0, including a minimal targeted fix for `src/auth/secret.test.ts` if the suite still fails after the E2E/auth-env stabilization work.
- `pnpm --filter @foundry/web test:e2e` exits 0 with authenticated smoke coverage for `/`, `/search`, `/drafts`, `/spaces`, `/spaces/[id]`, `/pages/[id]`, `/pages/[id]/edit`, and `/login`.

### Must Have

- One persistent authenticated shell shared by all MVP protected routes.
- Personal "My Work" home that filters content by the current user.
- Kanban view using existing Page.status (no new backend entities).
- Page linking with `[[Title]]` syntax (extract from markdown content).
- Inline checklists in TipTap editor (markdown syntax support).
- Route behavior and canonical URLs preserved (`/spaces/{id}`, `/pages/{id}`, `/pages/{id}/edit`).
- Premium dark design language preserved and tightened via semantic tokens.

### Must NOT Have (guardrails)

- Must NOT add new backend entities (no Task model, no Assignment model, no Inbox model).
- Must NOT build a full task management system (use inline checklists instead).
- Must NOT add Notion-like nested feature sprawl, graph views, or realtime collaboration.
- Must NOT change backend data contracts, auth strategy, or route semantics.

## Execution Strategy

### Phase Overview

**Phase 1: Shell Foundation (Tasks 1-5)** ✅ COMPLETE

- Persistent authenticated shell, sidebar, top bar, command palette, tokens

**Phase 2: Work Home Core (Tasks 6-9)** IN PROGRESS

- Task 6: Personal "My Work" home with attention filtering
- Task 7: Kanban/board view for workflow visualization
- Task 8: Page linking and backlink visualization
- Task 9: Inline checklists in editor

**Phase 3: Route Completion (Tasks 10-12)**

- Task 10: Space detail convergence
- Task 11: Page detail and editor alignment
- Task 12: Login polish

**Phase 4: Verification (Task 13)**

- Task 13: Playwright smoke tests

### Parallel Execution Waves

Wave 1: Shell foundation (COMPLETE - Tasks 1-5)
Wave 2: Work home core (IN PROGRESS - Tasks 6-9)
Wave 3: Route completion (Tasks 10-12)
Wave 4: Playwright verification (Task 13)

## Detailed Tasks

### Task 1: Create persistent authenticated App Router shell ✅

Create `apps/web/src/app/(app)/layout.tsx` as the canonical authenticated layout.

**Acceptance Criteria:**

- [x] Authenticated route group at `app/(app)/*` with persistent layout
- [x] Protected routes moved under `app/(app)` preserving public URLs
- [x] `/login` stays outside the group (unauthenticated)
- [x] `/spaces` redirects to `/login` when unauthenticated
- [x] Shell persists across authenticated route navigation

**Files:**

- `apps/web/src/app/(app)/layout.tsx` (new)
- `apps/web/src/components/app-shell.tsx` (new)

### Task 2: Add premium shadcn sidebar with route groups ✅

Integrate `shadcn-sidebar` into the authenticated layout.

**Acceptance Criteria:**

- [x] Sidebar appears on all authenticated routes
- [x] Desktop: persistent sidebar with collapsible sections
- [x] Mobile: slide-out drawer triggered by hamburger
- [x] Navigation items match `primaryNavigation` data structure

**Files:**

- `apps/web/src/components/app-sidebar.tsx` (new)
- `apps/web/src/lib/navigation.ts` (navigation data)

### Task 3: Add shared top bar and page chrome ✅

Build a shared top bar with breadcrumb/title registration via React Context.

**Acceptance Criteria:**

- [x] `AppTopBar` component with dynamic title/breadcrumbs
- [x] `PageChrome` component for consistent page headers
- [x] Breadcrumbs update on client navigation
- [x] Top bar shows current route context

**Files:**

- `apps/web/src/components/app-top-bar.tsx` (new)
- `apps/web/src/components/page-chrome.tsx` (new)

### Task 4: Add global command palette ✅

Implement `Cmd+K` command palette with navigation shortcuts.

**Acceptance Criteria:**

- [x] `Ctrl/Cmd+K` opens command palette
- [x] Navigation commands work (Go to Search, Go to Drafts, etc.)
- [x] Does not hijack focused inputs
- [x] Closes on `Escape` or click outside

**Files:**

- `apps/web/src/components/global-command-palette.tsx` (new)

### Task 5: Consolidate tokens and patterns ✅

Unify local tokens and fix primitive drift.

**Acceptance Criteria:**

- [x] All pages use `@foundry/ui` tokens consistently
- [x] Semantic border tokens added
- [x] No type errors from token usage

**Files:**

- `apps/web/src/app/globals.css`
- `apps/web/src/components/create-space-dialog.tsx`

### Task 6: Personal "My Work" Home (IN PROGRESS)

Transform `/` from metrics dashboard to personal work home.

**Goal:** Filter content by "what matters to me" not "all workspace stats"

**Sections to implement:**

1. **Needs Your Attention**
   - Drafts in spaces you're a member of
   - Pages you edited that were recently changed by others
   - Shows count + quick access

2. **Continue Working**
   - Pages you recently edited (sorted by updatedAt)
   - Shows last edit time + space context

3. **Your Activity**
   - Audit events for pages you own or edited
   - Filtered to recent activity (last 7 days)

4. **Quick Actions**
   - Create new page (opens space selector)
   - Review drafts (goes to /drafts)
   - Search (goes to /search with focus)

**Acceptance Criteria:**

- [ ] Home shows personal "Your Work" view, not global metrics
- [ ] "Needs attention" filters to user's spaces and edited pages
- [ ] "Continue working" shows pages sorted by your last edit
- [ ] Activity feed shows your audit trail
- [ ] Quick actions are actionable (not just links)

**Files:**

- `apps/web/src/app/(app)/page.tsx` (update data fetching)
- `apps/web/src/components/dashboard-page.tsx` (update layout)
- `apps/web/src/components/dashboard-overview.ts` (helpers)

**API Changes:**

- Update home page loader to fetch:
  - Drafts in user's spaces
  - Recent pages user edited
  - Audit events for user's pages

### Task 7: Kanban/Board View

Add kanban view for spaces showing pages by workflow status.

**Goal:** Visualize workflow state, not just list documents

**View Requirements:**

- Columns: Draft → In Review → Stable → Archived
- Cards show: Title, path, source (human/agent), updatedAt
- Drag-to-change-status (optional MVP: click to open, edit status there)
- Filter by: Source (human/agent), Recent updates

**Acceptance Criteria:**

- [ ] `/spaces/[id]?view=board` shows kanban layout
- [ ] Columns match Page.status enum
- [ ] Cards show relevant metadata (title, path, source, updated)
- [ ] Board view switcher in space detail (List / Board toggle)

**Files:**

- `apps/web/src/app/(app)/spaces/[id]/board-view.tsx` (new)
- `apps/web/src/app/(app)/spaces/[id]/space-view.tsx` (add view toggle)

**Backend:**

- Uses existing `Page.status` field
- No new backend entities needed

### Task 8: Page Linking & Backlinks

Implement `[[Page Title]]` linking syntax with backlink tracking.

**Goal:** Connect pages together, not isolated documents

**Features:**

- Type `[[` in editor shows page autocomplete
- Selecting a page creates a link
- Rendered pages show "Linked from" section
- Clicking a link navigates to that page

**Acceptance Criteria:**

- [ ] `[[` trigger in editor shows page search
- [ ] Links render as clickable in page view
- [ ] "Linked from" section shows on page detail
- [ ] Backlinks are extracted from markdown content (no new table needed for MVP)

**Files:**

- `apps/web/src/components/page-link-autocomplete.tsx` (new)
- `apps/web/src/app/(app)/pages/[id]/page-client.tsx` (add backlinks section)
- `apps/web/src/lib/markdown-links.ts` (extract links from markdown)

**Backend:**

- MVP: Parse markdown content to find `[[Title]]` patterns
- Future: Link table for performance

### Task 9: Inline Checklists

Add checkbox support in TipTap editor via markdown syntax.

**Goal:** Simple task tracking within pages without full task system

**Features:**

- Type `- [ ]` or `- [x]` to create checkbox
- Click to toggle checked state
- Save checkbox state in markdown content
- Render checkboxes in page view

**Acceptance Criteria:**

- [ ] Checkboxes render in editor and page view
- [ ] Clicking checkbox toggles state
- [ ] Markdown serializes/deserializes checkbox state
- [ ] No new backend entities (stored in page.content)

**Files:**

- `apps/web/src/components/tiptap-editor.tsx` (add checkbox extension)
- `apps/web/src/lib/markdown.ts` (checkbox markdown support)

**Backend:**

- Stored in existing `Page.content` markdown field

### Task 10: Space Detail Convergence

Migrate space detail page to unified shell.

**Acceptance Criteria:**

- [ ] Space detail uses `PageChrome` component
- [ ] Page list/table uses shared patterns
- [ ] Consistent spacing, typography, colors
- [ ] View toggle (List / Board) functional

**Files:**

- `apps/web/src/app/(app)/spaces/[id]/page.tsx`
- `apps/web/src/app/(app)/spaces/[id]/space-view.tsx`
- `apps/web/src/app/(app)/spaces/[id]/page-list.tsx`

### Task 11: Page Detail & Editor Alignment

Migrate page view and edit pages to unified shell.

**Acceptance Criteria:**

- [ ] Page detail uses `PageChrome`
- [ ] Editor uses shared shell
- [ ] Version history, revert UI aligned
- [ ] Consistent metadata display (source, status, updatedBy)

**Files:**

- `apps/web/src/app/(app)/pages/[id]/page.tsx`
- `apps/web/src/app/(app)/pages/[id]/page-client.tsx`
- `apps/web/src/app/(app)/pages/[id]/edit/page.tsx`
- `apps/web/src/app/(app)/pages/[id]/edit/edit-page-client.tsx`

### Task 12: Login Polish

Align login page with premium dark shell.

**Acceptance Criteria:**

- [ ] Login uses shared shell tokens
- [ ] Consistent typography and spacing
- [ ] Error states styled consistently

**Files:**

- `apps/web/src/app/login/page.tsx`

### Task 13: Playwright Verification

Add authenticated smoke tests.

**Acceptance Criteria:**

- [ ] Tests run with fixed `AUTH_SECRET`/`NEXTAUTH_URL`
- [ ] Smoke tests for all MVP routes
- [ ] Screenshots on failure
- [ ] CI-ready configuration

**Files:**

- `apps/web/playwright.config.ts`
- `apps/web/e2e/auth.setup.ts`
- `apps/web/e2e/smoke.spec.ts`

## Verification Strategy

All verification is agent-executed:

- Test decision: tests-after using existing lint/typecheck/build/Vitest plus new Playwright E2E
- QA policy: every task includes agent-executed happy path
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Key Constraints

1. **No new backend entities**: Work within existing User/Space/Page/AuditEvent models
2. **Personal filtering**: "My Work" means content filtered to the authenticated user
3. **Existing status workflow**: Use draft/stable/archived, don't add new states
4. **Markdown-native**: Checklists and links stored in content, not separate tables
