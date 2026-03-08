# Foundry Premium UI Refactor

## TL;DR

> **Summary**: Rebuild Foundry's authenticated product shell around a persistent shadcn-style sidebar/top-bar architecture, unify the web app's local design primitives, and migrate the MVP screens onto one premium dark interaction system with deterministic Playwright verification.
> **Deliverables**:
>
> - Persistent authenticated App Router shell for MVP routes
> - Unified sidebar, top bar, command palette, page-header, card/list/table/dialog patterns
> - Refactored dashboard, search, drafts, spaces, space detail, page detail, page edit, and login surfaces
> - Playwright authenticated smoke coverage with stable seeded auth
>   **Effort**: Large
>   **Parallel**: YES - 3 waves
>   **Critical Path**: 1 -> 2 -> 3 -> 6 -> 7 -> 10

## Context

### Original Request

- User wants Foundry to match the design and feature feel of `/home/dillmar/repos/v0-knowledge-base`, not the current bootstrap UI.
- User explicitly selected a full shell upgrade and included Playwright in this refactor.

### Interview Summary

- Preserve MVP scope from `SPEC.md` and keep the product dark-first, premium, calm, technical, and dense rather than flashy.
- Use shadcn-style product-shell patterns, but do not copy the reference app literally.
- Planning default: build a truly persistent authenticated shell via App Router layout composition, not repeated per-page `AppShell` wrappers.
- Planning default: keep `apps/web/src/components/ui/*` as the only primitive source in this refactor and defer `packages/ui/*` consolidation.
- Planning default: include actual command palette behavior and Playwright-based authenticated smoke tests.
- Planning default: treat the known `src/auth/secret.test.ts` failure as separate from the UI refactor unless it directly blocks the new QA harness.

### Metis Review (gaps addressed)

- Hidden shell risk resolved: the plan uses a route-group authenticated layout so the shell is truly persistent across protected routes.
- Primitive drift risk resolved: the plan freezes `apps/web/src/components/ui/*` as canonical and explicitly forbids mixed primitive migration.
- Auth QA risk resolved: Playwright work includes fixed auth secret handling, seeded credentials, and non-flaky authenticated setup.
- Scope creep risk resolved: no new entities, no data-model changes, no routing redesign beyond layout composition and canonical shell placement.
- Space-detail rewrite risk resolved: space detail migration happens only after the base shell and shared primitives are stable.

## Work Objectives

### Core Objective

- Deliver one cohesive premium dark product shell and shared UI system for Foundry's MVP routes, replacing fragmented wrappers and duplicated page patterns without expanding feature scope.

### Deliverables

- Authenticated `(app)` layout with persistent sidebar, top bar, content inset, and command palette.
- Shared web-local primitives/patterns for page headers, shell navigation, status badges, cards, dense list rows, table styling, and dialogs.
- Refactored MVP screens: dashboard, spaces index, drafts, search, space detail, page detail, page edit, and login.
- Playwright E2E setup with authenticated smoke coverage and deterministic env handling.
- Stable verification commands and evidence outputs for all major tasks.

### Definition of Done (verifiable conditions with commands)

- `pnpm --filter @foundry/web lint` exits 0.
- `pnpm --filter @foundry/web typecheck` exits 0.
- `pnpm --filter @foundry/web build` exits 0.
- `pnpm --filter @foundry/web test` exits 0, including a minimal targeted fix for `src/auth/secret.test.ts` if the suite still fails after the E2E/auth-env stabilization work.
- `pnpm --filter @foundry/web test:e2e` exits 0 with authenticated smoke coverage for `/`, `/search`, `/drafts`, `/spaces`, `/spaces/[id]`, `/pages/[id]`, `/pages/[id]/edit`, and `/login`.

### Must Have

- One persistent authenticated shell shared by all MVP protected routes.
- Route behavior and canonical URLs preserved (`/spaces/{id}`, `/pages/{id}`, `/pages/{id}/edit`).
- Premium dark design language preserved and tightened via semantic tokens, not ad-hoc color overrides.
- Shared UX patterns for headers, navigation, tables/cards, dialogs, and metadata rails.
- Deterministic Playwright auth setup using stable env and seeded credentials.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)

- Must NOT add Notion-like nested feature sprawl, graph views, realtime collaboration, or new product domains.
- Must NOT mix `apps/web/src/components/ui/*` and `packages/ui/*` as dual sources of truth during the refactor.
- Must NOT change backend data contracts, search logic, auth strategy, or route semantics beyond layout composition and selector/test support.
- Must NOT ship stock shadcn visuals that bypass Foundry tokens, spacing, and premium dark density.
- Must NOT turn space detail into a product redesign; keep the current IA and feature set while migrating it onto the unified shell.

## Verification Strategy

> ZERO HUMAN INTERVENTION - all verification is agent-executed.

- Test decision: tests-after using existing lint/typecheck/build/Vitest plus new Playwright E2E for shell and route smoke coverage.
- QA policy: every task includes an agent-executed happy path and failure/edge case.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`
- E2E auth policy: fixed `AUTH_SECRET`/`NEXTAUTH_URL` values for the Playwright environment; use seeded credentials from `packages/database/src/seed.ts` and avoid flaky session reuse.

## Execution Strategy

### Parallel Execution Waves

> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: shell foundation, tokens, and shared interaction primitives (Tasks 1-5)
Wave 2: route migrations on the new shell (Tasks 6-9)
Wave 3: Playwright env, smoke specs, and verification hardening (Task 10)

### Dependency Matrix (full, all tasks)

- 1 blocks 2, 3, 4, 6, 7, 8, 10
- 2 blocks 6, 7, 8, 9, 10
- 3 blocks 6, 7, 8, 9
- 4 blocks 6, 7, 8, 10
- 5 blocks 6, 7, 8, 9
- 6 blocks 7, 8, 10
- 7 blocks 10
- 8 blocks 10
- 9 can run after 3 and 5; it does not block route-shell migration
- 10 runs after 1, 2, 4, 6, 7, 8

### Agent Dispatch Summary (wave -> task count -> categories)

- Wave 1 -> 5 tasks -> `deep`, `artistry`, `visual-engineering`, `quick`
- Wave 2 -> 4 tasks -> `deep`, `visual-engineering`, `unspecified-high`
- Wave 3 -> 1 task -> `deep`, `unspecified-high`, `visual-engineering`

## TODOs

> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Create the persistent authenticated App Router shell

  **What to do**: Create `apps/web/src/app/(app)/layout.tsx` as the single protected shell entry point, move all authenticated MVP routes into the `(app)` route group without changing public URLs, and remove repeated `AppShell` wrapping from route pages. Keep `/login` outside the group. Preserve current auth enforcement by reusing the existing auth/middleware path instead of inventing a parallel gate.
  **Must NOT do**: Do not change route URLs, page data loaders, API behavior, or the login route placement. Do not leave mixed per-page `AppShell` wrappers behind after migration.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: route-group migration and layout ownership changes span multiple protected routes.
  - Skills: [`shadcn-ui`, `vercel-react-best-practices`] - Reason: aligns shell composition with shadcn structure and Next App Router layout behavior.
  - Omitted: [`tailwind-theme-builder`] - Reason: this task is structural, not token-focused.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 6, 7, 8, 10 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/components/app-shell.tsx:9` - current authenticated shell behavior to preserve while changing mounting strategy.
  - Pattern: `apps/web/src/app/page.tsx:4` - current repeated shell wrapping to remove.
  - Pattern: `apps/web/src/app/layout.tsx:26` - current root layout; keep global providers/fonts here and add authenticated grouping beneath it.
  - Pattern: `apps/web/src/app/spaces/[id]/page.tsx:1` - protected route currently bypassing the shell and requiring convergence.
  - API/Type: `apps/web/src/middleware.ts:1` - existing auth gate behavior that must remain authoritative.
  - API/Type: `apps/web/src/lib/auth.ts:1` - auth utility path for protected routes.
  - External: `https://nextjs.org/docs/app/api-reference/file-conventions/layout` - layout persistence and route-group behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `apps/web/src/app/(app)/layout.tsx` exists and owns the protected shell frame.
  - [ ] `apps/web/src/app/page.tsx`, `apps/web/src/app/search/page.tsx`, `apps/web/src/app/drafts/page.tsx`, `apps/web/src/app/spaces/page.tsx`, `apps/web/src/app/spaces/[id]/page.tsx`, `apps/web/src/app/pages/[id]/page.tsx`, and `apps/web/src/app/pages/[id]/edit/page.tsx` no longer wrap themselves in `AppShell` directly.
  - [ ] Public URLs remain unchanged when navigating to `/`, `/search`, `/drafts`, `/spaces`, `/spaces/[id]`, `/pages/[id]`, and `/pages/[id]/edit`.
  - [ ] `/login` remains outside the authenticated route group.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Protected routes share one persistent shell
    Tool: Playwright
    Steps: Start the app; log in with `admin@foundry.local` / `admin123`; visit `/`; click the sidebar links for Search, Drafts, and Spaces; verify the same shell container stays mounted via a stable selector like `[data-testid="app-shell"]` while the content pane changes.
    Expected: Sidebar/top bar persist across navigations; route URLs remain `/search`, `/drafts`, `/spaces`; no duplicate nested shell appears.
    Evidence: .sisyphus/evidence/task-1-persistent-shell.png

  Scenario: Anonymous access still redirects correctly
    Tool: Playwright
    Steps: Open a fresh browser context without storage state; navigate directly to `/spaces`; observe redirect behavior.
    Expected: User is redirected to `/login` or the configured auth entry without a server error or blank frame.
    Evidence: .sisyphus/evidence/task-1-persistent-shell-error.png
  ```

  **Commit**: YES | Message: `refactor(web): create persistent authenticated shell layout` | Files: `apps/web/src/app/(app)/**`, `apps/web/src/app/**/page.tsx`

- [ ] 2. Replace the current nav with a shadcn-based premium sidebar

  **What to do**: Rebuild the authenticated left navigation on top of `apps/web/src/components/ui/sidebar.tsx`, create a dedicated `AppSidebar` component in `apps/web/src/components`, migrate current primary navigation into grouped sections, preserve current destinations, and add space for recents/pinned/action surfaces consistent with MVP scope. Reskin the sidebar only through Foundry tokens and local classes.
  **Must NOT do**: Do not import or adopt `packages/ui/*` primitives. Do not introduce new nav destinations that are out of MVP scope. Do not ship stock shadcn colors or labels.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: nav-shell work combines shared component composition with visible layout behavior.
  - Skills: [`shadcn-ui`, `frontend-ui-ux`] - Reason: sidebar primitives must be wired correctly and reskinned deliberately.
  - Omitted: [`tailwind-theme-builder`] - Reason: no global token rewrite yet.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 8, 9, 10 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/components/ui/sidebar.tsx:56` - existing provider/sidebar API to adopt instead of leaving it dead code.
  - Pattern: `apps/web/src/components/app-shell.tsx:16` - current navigation density, account footer, and search launcher behavior to preserve functionally.
  - Pattern: `apps/web/src/lib/navigation.ts:13` - current primary navigation destinations and labels.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/components/app-sidebar.tsx:56` - target interaction model for grouped navigation, collapsible areas, and footer organization.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/layout.tsx:35` - sidebar-provider shell composition.
  - External: `https://ui.shadcn.com/docs/components/sidebar` - canonical shadcn sidebar anatomy and inset usage.

  **Acceptance Criteria** (agent-executable only):
  - [ ] A new `AppSidebar` component is mounted from the authenticated layout and uses `SidebarProvider` / `Sidebar` primitives.
  - [ ] Existing top-level destinations for Dashboard, Search, Drafts, and Spaces remain present and functional.
  - [ ] Sidebar collapse and mobile drawer behavior work without visual regression or broken focus order.
  - [ ] The old inline nav markup in `apps/web/src/components/app-shell.tsx` is removed or reduced to shell composition only.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Sidebar navigation works on desktop
    Tool: Playwright
    Steps: Log in; open `/`; assert `[data-testid="app-sidebar"]` is visible; click Dashboard, Search, Drafts, and Spaces nav items by role/name; assert the active item changes and the content area updates.
    Expected: All four destinations load, active state is correct, and the sidebar stays visible across navigations.
    Evidence: .sisyphus/evidence/task-2-sidebar-desktop.png

  Scenario: Sidebar drawer works on mobile width
    Tool: Playwright
    Steps: Resize viewport to 390x844; open `/search`; tap the sidebar trigger; tap the Spaces nav item; close the drawer.
    Expected: Drawer opens and closes accessibly, navigation succeeds, and focus is not trapped after close.
    Evidence: .sisyphus/evidence/task-2-sidebar-mobile.png
  ```

  **Commit**: YES | Message: `refactor(web): migrate app navigation to sidebar primitives` | Files: `apps/web/src/components/app-sidebar.tsx`, `apps/web/src/components/app-shell.tsx`, `apps/web/src/lib/navigation.ts`, `apps/web/src/app/(app)/layout.tsx`

- [ ] 3. Add a shared top bar and route-aware page chrome

  **What to do**: Create a reusable top-bar/page-chrome system for the authenticated shell, including sidebar trigger, breadcrumbs, command launcher affordance, and a standardized page-header primitive for eyebrow/title/supporting copy/actions. Move repeated header markup out of dashboard, search, spaces, drafts, page detail, and page edit into shared components while keeping per-route content specific.
  **Must NOT do**: Do not compute active route state in a server layout. Do not force identical copy/actions across all pages; only the chrome and spacing system should be shared.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: shared chrome and repeated header extraction affect many routes and require polished UI judgment.
  - Skills: [`frontend-ui-ux`, `vercel-react-best-practices`] - Reason: route-aware UI must live in small client pieces under a stable shell.
  - Omitted: [`shadcn-ui`] - Reason: this is mostly app-composed chrome on top of existing primitives.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 8, 9 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/components/dashboard-page.tsx:79` - current page-header structure to normalize.
  - Pattern: `apps/web/src/app/search/search-client.tsx:148` - repeated eyebrow/title/filter layout.
  - Pattern: `apps/web/src/app/spaces/spaces-client.tsx:53` - header with view-mode controls and action area.
  - Pattern: `apps/web/src/app/pages/[id]/page-client.tsx:135` - route-specific breadcrumb/title/meta composition.
  - Pattern: `apps/web/src/app/pages/[id]/edit/edit-page-client.tsx:169` - edit-page header/action grouping.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/components/top-bar.tsx:23` - target top-bar anatomy.
  - External: `https://nextjs.org/docs/app/api-reference/file-conventions/layout` - route-aware client chrome under persistent layouts.

  **Acceptance Criteria** (agent-executable only):
  - [ ] A shared top-bar component is mounted from the authenticated shell.
  - [ ] Repeated eyebrow/title/description markup is replaced by one shared page-header primitive or composition layer.
  - [ ] Dashboard, Search, Drafts, Spaces, Page detail, and Edit page all use the new page chrome system.
  - [ ] Breadcrumbs and route labels remain accurate after navigation.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Shared top bar and page headers stay consistent across routes
    Tool: Playwright
    Steps: Log in; visit `/`, `/search`, `/drafts`, `/spaces`, `/pages/<seeded-id>`, and `/pages/<seeded-id>/edit`; capture the top chrome and page header area on each route.
    Expected: Sidebar trigger, breadcrumbs, command affordance, spacing rhythm, and action alignment are consistent while route-specific titles/copy remain correct.
    Evidence: .sisyphus/evidence/task-3-page-chrome.png

  Scenario: Route-aware chrome does not stale on client navigation
    Tool: Playwright
    Steps: Log in at `/`; click from Dashboard to Search to Spaces using client-side nav; inspect breadcrumb/current-title text after each transition.
    Expected: Breadcrumb and title text update correctly after each client transition without full reload artifacts.
    Evidence: .sisyphus/evidence/task-3-page-chrome-error.png
  ```

  **Commit**: YES | Message: `refactor(web): standardize top bar and page chrome` | Files: `apps/web/src/components/**`, `apps/web/src/app/**/{page,*.tsx}`

- [ ] 4. Implement the global command palette and keyboard search surface

  **What to do**: Build a real app-level command palette on top of `apps/web/src/components/ui/command.tsx`, mount it once in the authenticated shell, wire `Cmd/Ctrl+K`, include quick navigation for Dashboard/Search/Drafts/Spaces, include recent page/page-result navigation hooks consistent with current MVP routes, and expose a visible launcher in the top bar.
  **Must NOT do**: Do not duplicate search logic already present in route-level pages. Do not rely on hardcoded dead routes. Do not make the palette login-gated from inside `/login`.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: global keyboard behavior, routing, and shell integration need careful handling.
  - Skills: [`shadcn-ui`, `vercel-react-best-practices`] - Reason: command primitives and client event handling must be robust.
  - Omitted: [`frontend-ui-ux`] - Reason: the core risk is behavior and integration, not the visual language.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 8, 10 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/components/ui/command.tsx:32` - existing command-dialog primitive.
  - Pattern: `apps/web/src/components/app-shell.tsx:33` - current search launcher affordance to replace with real command behavior.
  - Pattern: `apps/web/src/app/search/search-client.tsx:66` - current local keyboard focus behavior that should remain route-local, not global-command logic.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/components/command-palette.tsx:26` - target command palette scope and shortcut behavior.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/components/top-bar.tsx:47` - visible command launcher affordance.
  - External: `https://ui.shadcn.com/docs/components/command` - canonical command palette pattern.

  **Acceptance Criteria** (agent-executable only):
  - [ ] One global command palette component is mounted once from the authenticated shell.
  - [ ] `Cmd/Ctrl+K` opens and closes the palette on authenticated routes.
  - [ ] Palette items navigate only to valid existing routes.
  - [ ] The top bar includes a visible launcher button or affordance for the palette.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Keyboard command palette opens and navigates
    Tool: Playwright
    Steps: Log in; open `/`; press `Control+K`; type `search`; select the Search command; wait for route change.
    Expected: Command dialog opens, filters results, closes on selection, and lands on `/search`.
    Evidence: .sisyphus/evidence/task-4-command-palette.png

  Scenario: Command palette does not hijack form entry on edit screen
    Tool: Playwright
    Steps: Log in; open `/pages/<seeded-id>/edit`; click the title input; trigger the command shortcut while the field is focused.
    Expected: Command palette does not interrupt normal text-input behavior when focus is inside a form field that should keep keyboard input.
    Evidence: .sisyphus/evidence/task-4-command-palette-error.png
  ```

  **Commit**: YES | Message: `feat(web): add global command palette to app shell` | Files: `apps/web/src/components/**`, `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/lib/navigation.ts`

- [ ] 5. Consolidate tokens and shared UI patterns inside `apps/web`

  **What to do**: Normalize the web app's local design system around `apps/web/src/app/globals.css` and `apps/web/src/components/ui/*`. Tighten semantic tokens for shell/sidebar/elevation/status usage, align `Badge` and `Card` usage patterns to the premium dark language, create shared page-header/list-row/dialog composition helpers as needed, remove or replace duplicate/unused local components, and standardize on one dialog/form pattern derived from the stronger `CreateSpaceDialog` structure.
  **Must NOT do**: Do not migrate to `packages/ui/*`. Do not reset Tailwind namespaces or replace the entire token strategy. Do not introduce non-token hardcoded palette drift unless the existing file already requires a one-off exception.

  **Recommended Agent Profile**:
  - Category: `artistry` - Reason: this task decides how the product visually coheres without losing density or becoming generic.
  - Skills: [`frontend-ui-ux`, `tailwind-theme-builder`, `shadcn-ui`] - Reason: token discipline and shadcn semantics need deliberate visual-system decisions.
  - Omitted: [`vercel-react-best-practices`] - Reason: the main risk is visual/system consistency, not React data flow.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 8, 9 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/app/globals.css:7` - existing semantic token base that should remain the source of truth.
  - Pattern: `apps/web/src/components/ui/card.tsx:5` - canonical local card API to keep.
  - Pattern: `apps/web/src/components/ui/badge.tsx:7` - canonical local badge variants; use semantic variants instead of ad-hoc mappings.
  - Pattern: `apps/web/src/app/spaces/[id]/page-list.tsx:175` - current incorrect generic status-badge mapping to fix in downstream route work.
  - Pattern: `apps/web/src/components/create-space-dialog.tsx:52` - stronger local dialog/form pattern based on `react-hook-form` + shared form primitives.
  - Pattern: `apps/web/src/app/spaces/[id]/create-page-dialog.tsx:24` - weaker hand-rolled dialog to align with the shared dialog pattern.
  - Pattern: `apps/web/src/components/login-form.tsx:32` - login-card typography and field styling that should align with the same token system.
  - Pattern: `packages/ui/src/components/card.tsx:5` - divergent shared card API to explicitly avoid in this refactor.
  - Pattern: `packages/ui/src/components/badge.tsx:16` - divergent shared badge API to explicitly avoid in this refactor.
  - External: `https://ui.shadcn.com/docs/theming`
  - External: `https://tailwindcss.com/docs/theme`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `apps/web/src/app/globals.css` remains the only token source for the web shell and includes any new semantic aliases needed by the refactor.
  - [ ] All refactored route work uses `apps/web/src/components/ui/card.tsx` and `apps/web/src/components/ui/badge.tsx`, not `packages/ui/*` equivalents.
  - [ ] Duplicate or unused local presentation components are removed or folded into the canonical pattern list.
  - [ ] Dialog/form composition is standardized on one shared pattern for create/edit surfaces.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Shared card, badge, and dialog language is visually consistent
    Tool: Playwright
    Steps: Log in; open `/`, `/drafts`, `/spaces`, and `/spaces/<space-id>`; open both the create-space and create-page dialogs; inspect card surfaces and status badges across those screens.
    Expected: Cards share the same elevation/radius rhythm, status badges use semantic variants consistently, and dialogs feel like one system.
    Evidence: .sisyphus/evidence/task-5-token-system.png

  Scenario: No mixed primitive source leaks into the web app
    Tool: Bash
    Steps: Search the refactored `apps/web/src` tree for imports from `@foundry/ui` card/badge primitives or `packages/ui` paths.
    Expected: No web-route surface imports divergent card/badge primitives from the shared package during this refactor.
    Evidence: .sisyphus/evidence/task-5-token-system.txt
  ```

  **Commit**: YES | Message: `refactor(web): unify local design patterns and tokens` | Files: `apps/web/src/app/globals.css`, `apps/web/src/components/**`, `apps/web/src/app/**`

- [ ] 6. Migrate dashboard, spaces index, drafts, and search onto the new shell system

  **What to do**: Refactor the top-level authenticated overview/index routes to use the new sidebar/top-bar/page-header system and the shared card/list/table patterns from Task 5. Apply the v0-inspired shell density and hierarchy to dashboard, spaces index, drafts queue, and search while preserving existing route capabilities and canonical links.
  **Must NOT do**: Do not change route semantics, filters, result logic, or existing canonical links. Do not add new dashboard widgets or non-MVP data surfaces.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this is a coordinated route-surface migration that depends on the new shell and shared patterns.
  - Skills: [`frontend-ui-ux`, `shadcn-ui`] - Reason: screens must feel cohesive and information-dense without becoming boilerplate.
  - Omitted: [`tailwind-theme-builder`] - Reason: token work is upstream in Task 5.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7, 8, 10 | Blocked By: 1, 2, 3, 4, 5

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/components/dashboard-page.tsx:79` - current dashboard content model to preserve.
  - Pattern: `apps/web/src/app/spaces/spaces-client.tsx:53` - current spaces index behavior and controls.
  - Pattern: `apps/web/src/app/drafts/drafts-client.tsx:102` - draft review list and action model.
  - Pattern: `apps/web/src/app/search/search-client.tsx:148` - search filters/results/empty-state behavior.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/page.tsx:13` - target dashboard density and quick-action hierarchy.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/spaces/page.tsx:10` - target spaces index shell rhythm.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/search/page.tsx:117` - target search density using table/list patterns.
  - External: `https://ui.shadcn.com/docs/components/data-table` - guidance for dense data views without over-generalizing them.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/`, `/spaces`, `/drafts`, and `/search` render inside the new shell with the shared top bar/page-header system.
  - [ ] Search filters and search results still work with the same query inputs and canonical page links.
  - [ ] Draft actions still expose Review, Promote, and Archive affordances.
  - [ ] Spaces index still supports grid/list switching and create-space flow.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Core authenticated overview routes render with the new shell
    Tool: Playwright
    Steps: Log in; visit `/`, `/spaces`, `/drafts`, and `/search`; capture each route after load.
    Expected: All four routes share shell chrome, consistent density, and working content sections without broken spacing or overlap.
    Evidence: .sisyphus/evidence/task-6-core-routes.png

  Scenario: Search and drafts behaviors still work after the visual migration
    Tool: Playwright
    Steps: On `/search`, enter a known query and apply one filter; on `/drafts`, use the search/filter inputs and trigger one safe non-destructive action path such as opening Review.
    Expected: Search returns results or empty state normally; drafts filtering works; clicking Review lands on the correct page.
    Evidence: .sisyphus/evidence/task-6-core-routes-behavior.png
  ```

  **Commit**: YES | Message: `refactor(web): migrate core overview routes to unified shell` | Files: `apps/web/src/components/dashboard-page.tsx`, `apps/web/src/app/spaces/spaces-client.tsx`, `apps/web/src/app/drafts/drafts-client.tsx`, `apps/web/src/app/search/search-client.tsx`

- [ ] 7. Converge the space detail experience onto the unified shell

  **What to do**: Refactor `apps/web/src/app/spaces/[id]/space-view.tsx`, `page-tree.tsx`, `page-list.tsx`, and `create-page-dialog.tsx` so the route renders inside the same persistent shell as the rest of the app while preserving its split-pane information architecture. Use the shell top bar/page header, keep the left tree + main content structure, normalize status badges/table styling, and align page creation with the shared dialog pattern.
  **Must NOT do**: Do not redesign the space IA, remove filters, change canonical page links, or replace the split-pane model with a generic one-column page.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this route is the biggest structural outlier and must be migrated without behavior loss.
  - Skills: [`frontend-ui-ux`, `shadcn-ui`] - Reason: split-pane shell convergence needs both structural correctness and visual restraint.
  - Omitted: [`vercel-react-best-practices`] - Reason: the main risk is route-shell convergence, not async React behavior.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 10 | Blocked By: 1, 2, 3, 5, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/app/spaces/[id]/space-view.tsx:34` - current bespoke shell to dismantle safely.
  - Pattern: `apps/web/src/app/spaces/[id]/page-tree.tsx:1` - current left-rail tree behavior to preserve.
  - Pattern: `apps/web/src/app/spaces/[id]/page-list.tsx:40` - current table/list behavior and incorrect status-badge mapping.
  - Pattern: `apps/web/src/app/spaces/[id]/create-page-dialog.tsx:24` - page-create flow to align with the shared dialog system.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/spaces/[slug]/page.tsx:1` - target split-pane density and header rhythm.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/components/page-tree-nav.tsx:31` - target page-tree tone and collapsible navigation rhythm.
  - External: `https://ui.shadcn.com/docs/components/sidebar`
  - External: `https://ui.shadcn.com/docs/components/data-table`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/spaces/[id]` renders inside the same authenticated shell frame as the other protected routes.
  - [ ] The route retains a left tree and a main content pane with filters and page listing.
  - [ ] Page links still resolve to `/pages/{id}` and the create-page flow still redirects to `/pages/{id}` after success.
  - [ ] Status badges, table styling, and page-create dialog now match the shared system from Tasks 3 and 5.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Space detail keeps split-pane behavior inside the unified shell
    Tool: Playwright
    Steps: Log in; open `/spaces/<space-id>`; verify the global shell is present; interact with the page tree; apply at least one filter; click a page row.
    Expected: Global shell persists, the split-pane remains usable, filters update the table, and page navigation lands on `/pages/<page-id>`.
    Evidence: .sisyphus/evidence/task-7-space-detail.png

  Scenario: Empty or filtered-down space state stays graceful
    Tool: Playwright
    Steps: On `/spaces/<space-id>`, enter a search string that matches no pages or apply a combination of filters that yields zero rows.
    Expected: The space page shows a graceful zero-results state without collapsing the shell or breaking the tree pane.
    Evidence: .sisyphus/evidence/task-7-space-detail-error.png
  ```

  **Commit**: YES | Message: `refactor(web): converge space detail on unified shell` | Files: `apps/web/src/app/spaces/[id]/**`

- [ ] 8. Refactor page detail and page edit into the unified reading/editing system

  **What to do**: Rework `apps/web/src/app/pages/[id]/page-client.tsx` and `apps/web/src/app/pages/[id]/edit/edit-page-client.tsx` so they sit naturally inside the new shell/top-bar/page-header system, preserve breadcrumbs and metadata rails, tighten the editor/read view hierarchy, and ensure detail/edit affordances feel like part of the same product surface as search, drafts, and space detail.
  **Must NOT do**: Do not change markdown rendering behavior, editor data flow, pin/edit/save semantics, or route URLs. Do not remove the metadata/history/file rail concept even if it remains placeholder content.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this is a dense document UI refactor with both reading and editing states.
  - Skills: [`frontend-ui-ux`, `shadcn-ui`] - Reason: page detail/edit views need refined hierarchy while staying consistent with shared primitives.
  - Omitted: [`tailwind-theme-builder`] - Reason: token work is already centralized.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 10 | Blocked By: 1, 2, 3, 4, 5, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/app/pages/[id]/page-client.tsx:58` - current detail page structure, badges, metadata strip, and side rail.
  - Pattern: `apps/web/src/app/pages/[id]/edit/edit-page-client.tsx:31` - current edit-page structure and tabs/editor frame.
  - Pattern: `apps/web/src/components/markdown-preview.tsx:1` - long-form read surface that must remain intact.
  - Pattern: `apps/web/src/components/tiptap-editor.tsx:1` - current editor primitive to preserve behaviorally.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/page/[id]/page.tsx:163` - target reading/editing density and side-rail composition.
  - External: `https://ui.shadcn.com/docs/components/tabs`
  - External: `https://ui.shadcn.com/docs/components/breadcrumb`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/pages/[id]` and `/pages/[id]/edit` render inside the unified shell and shared page chrome.
  - [ ] Breadcrumbs, title/meta presentation, edit action, save flow, and metadata rail remain present and correct.
  - [ ] Editor tabs and markdown preview still work as before.
  - [ ] No route regressions occur when moving between page detail, edit, and related space/search entry points.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Page detail and edit feel cohesive under the new shell
    Tool: Playwright
    Steps: Log in; open `/pages/<page-id>`; inspect breadcrumb/title/meta; click Edit; inspect the editor shell and preview tab; return to detail.
    Expected: Detail and edit share the same shell chrome, preserve route correctness, and keep the metadata/edit actions functional.
    Evidence: .sisyphus/evidence/task-8-page-surfaces.png

  Scenario: Edit page validation and unsaved-change behavior still works
    Tool: Playwright
    Steps: Open `/pages/<page-id>/edit`; clear the title field; attempt to save; then make a change and attempt to cancel.
    Expected: Validation error appears for empty title, and the unsaved-change guard still fires on cancel.
    Evidence: .sisyphus/evidence/task-8-page-surfaces-error.png
  ```

  **Commit**: YES | Message: `refactor(web): align page detail and editor with unified shell` | Files: `apps/web/src/app/pages/[id]/**`, `apps/web/src/components/{markdown-preview,tiptap-editor}.tsx`

- [ ] 9. Polish the login surface to match the premium product system

  **What to do**: Refine `/login` and `apps/web/src/components/login-form.tsx` so the anonymous/auth-entry experience matches the new premium dark system without pretending it is part of the authenticated shell. Keep the current credentials flow and seed-user messaging, but bring card hierarchy, supporting surfaces, typography, and trust cues in line with the rest of the refactor.
  **Must NOT do**: Do not change the auth flow, credentials provider contract, callback handling, or seed-user copy semantics. Do not mount the authenticated sidebar/top bar on `/login`.

  **Recommended Agent Profile**:
  - Category: `artistry` - Reason: login is a standalone trust surface that should feel premium but visually separate from the app shell.
  - Skills: [`frontend-ui-ux`, `shadcn-ui`] - Reason: authentication UI needs clarity, restraint, and consistency.
  - Omitted: [`vercel-react-best-practices`] - Reason: behavior remains mostly unchanged.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 3, 5

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/src/app/login/page.tsx:1` - current anonymous shell composition.
  - Pattern: `apps/web/src/components/login-form.tsx:32` - current login-card behavior and trust messaging.
  - Pattern: `apps/web/src/app/globals.css:151` - current typography/token baseline.
  - Pattern: `/home/dillmar/repos/v0-knowledge-base/app/layout.tsx:33` - reference-app tone for shell-level polish, not direct reuse.
  - External: `https://ui.shadcn.com/docs/theming`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/login` remains a standalone anonymous surface outside the authenticated shell.
  - [ ] Login card hierarchy, background treatment, and field/button rhythm visibly align with the premium dark system.
  - [ ] Error handling and sign-in behavior remain unchanged.
  - [ ] Seed-user guidance remains visible and accurate.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Login surface visually matches the refactored product system
    Tool: Playwright
    Steps: Open `/login`; capture the full page and the form card; compare hierarchy, spacing, and token usage against the authenticated shell language.
    Expected: Login feels like the same product family without reusing the authenticated shell chrome.
    Evidence: .sisyphus/evidence/task-9-login-surface.png

  Scenario: Login errors still render clearly
    Tool: Playwright
    Steps: Submit `/login` with an invalid password for `admin@foundry.local`.
    Expected: The existing error message area appears with clear contrast and no layout breakage.
    Evidence: .sisyphus/evidence/task-9-login-surface-error.png
  ```

  **Commit**: YES | Message: `refactor(web): polish login surface for premium dark system` | Files: `apps/web/src/app/login/page.tsx`, `apps/web/src/components/login-form.tsx`

- [ ] 10. Add deterministic Playwright infrastructure and authenticated smoke coverage

  **What to do**: Add Playwright configuration, scripts, auth/test env handling, seeded-login setup, and smoke specs that cover anonymous and authenticated route loading. Introduce stable selectors needed by the shell refactor, pin `AUTH_SECRET`/`NEXTAUTH_URL` for E2E runs, prefer a deterministic seeded-auth login path, make `pnpm --filter @foundry/web test:e2e` the standard smoke command, and land the smallest safe fix for `src/auth/secret.test.ts` if it still blocks a green web test suite after env stabilization.
  **Must NOT do**: Do not depend on flaky manual login reuse, random ports, or mixed secrets. Do not build broad end-to-end coverage beyond route and shell smoke for this refactor.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this task spans tooling, auth setup, route coverage, and CI-grade command ergonomics.
  - Skills: [`playwright`, `verification-before-completion`] - Reason: browser automation must be real, deterministic, and evidence-backed.
  - Omitted: [`frontend-ui-ux`] - Reason: behavior and environment stability dominate this task.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification Wave | Blocked By: 1, 2, 4, 6, 7, 8

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/web/package.json:5` - add the `test:e2e` script here.
  - Pattern: `package.json:6` - keep workspace command style aligned with existing scripts.
  - Pattern: `packages/database/src/seed.ts:1` - seeded credentials source for auth smoke runs.
  - Pattern: `apps/web/src/auth.ts:1` - credentials-auth path the smoke setup must use.
  - Pattern: `apps/web/src/auth.config.ts:1` - login route and session strategy.
  - Pattern: `apps/web/src/middleware.ts:1` - protected-route behavior the smoke specs must assert.
  - Pattern: `.env.example:1` - env shape that must include stable E2E values.
  - Pattern: `docker-compose.yml:1` - local runtime expectation for DB-backed auth.
  - Pattern: `playwright-login-errors.log:1` - known decryption-secret failure mode to explicitly eliminate.
  - External: `https://ui.shadcn.com/docs/components/command`
  - External: `https://nextjs.org/docs/app/api-reference/file-conventions/loading`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `apps/web/package.json` contains a working `test:e2e` script.
  - [ ] A Playwright config and spec files exist in the web app and run headlessly.
  - [ ] The Playwright environment uses fixed auth/session env vars and seeded credentials.
  - [ ] Smoke specs cover `/login`, `/`, `/search`, `/drafts`, `/spaces`, `/spaces/[id]`, `/pages/[id]`, and `/pages/[id]/edit`.
  - [ ] `pnpm --filter @foundry/web test:e2e` exits 0 locally against the seeded environment.
  - [ ] `pnpm --filter @foundry/web test` exits 0 after applying only the smallest required auth-secret test adjustment, if any.

  **QA Scenarios** (MANDATORY - task incomplete without these):

  ```text
  Scenario: Authenticated smoke suite passes end-to-end
    Tool: Bash
    Steps: Start the required local services with the fixed E2E env; run `pnpm --filter @foundry/web test:e2e`.
    Expected: Playwright exits 0 and reports green smoke tests for the shell routes and login route.
    Evidence: .sisyphus/evidence/task-10-playwright.txt

  Scenario: Secret mismatch regression is explicitly prevented
    Tool: Playwright
    Steps: Run the login and authenticated route smoke flow with the intended E2E env; capture browser console output during `/login` and the first protected route.
    Expected: No `JWTSessionError` or `no matching decryption secret` appears in console or server-visible logs during the smoke run.
    Evidence: .sisyphus/evidence/task-10-playwright-error.txt
  ```

  **Commit**: YES | Message: `test(web): add deterministic playwright smoke coverage` | Files: `apps/web/package.json`, `apps/web/playwright.config.*`, `apps/web/e2e/**`, `.env.example`, shell route components

## Final Verification Wave (4 parallel agents, ALL must APPROVE)

- [ ] F1. Plan Compliance Audit - oracle
- [ ] F2. Code Quality Review - unspecified-high
- [ ] F3. Browser QA Replay - unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check - deep

## Commit Strategy

- Commit after each completed wave or logically isolated route migration using conventional commits.
- Keep shell-foundation, route-migration, and Playwright setup commits separate.
- Do not combine unrelated auth/test cleanup with route/shell styling unless the verification harness directly requires it.

## Success Criteria

- Protected routes render inside one persistent authenticated shell with no bespoke frame left on `spaces/[id]`.
- Shared page patterns replace the duplicated local header/card/dialog drift without reducing route coverage.
- The UI feels materially closer to the v0 reference in shell structure, density, navigation, and search ergonomics while preserving Foundry's own dark token language.
- Playwright proves authenticated and anonymous route smoke flows end-to-end on local seeded data.
