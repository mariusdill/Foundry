## 2026-03-08

- App Router route groups can move authenticated pages under `src/app/(app)` while preserving public URLs (`/`, `/search`, `/drafts`, `/spaces`, `/spaces/[id]`, `/pages/[id]`, `/pages/[id]/edit`).
- Centralizing `AppShell` in `src/app/(app)/layout.tsx` removes per-page shell wrapping and gives one persistent authenticated chrome surface.
- `spaces/[id]` now shares the same shell path as the other protected routes once moved into the `(app)` group.
- Adding `data-testid="app-shell"` on `AppShell` root enables stable smoke selector coverage without changing behavior.
- The local shadcn `SidebarProvider` cookie (`sidebar_state`) can be read server-side in `AppShell` to keep desktop collapse state aligned across authenticated routes.
- Backing premium sidebar action cards plus Recents/Pinned collections from `src/lib/navigation.ts` keeps the new shell within MVP scope without inventing extra destinations.
- A single client-mounted `GlobalCommandPalette` inside `AppShell` keeps `/login` untouched while giving all authenticated routes one shared `Cmd/Ctrl+K` surface and one visible launcher.
- Guarding global `Cmd/Ctrl+K` against editable targets (`input`, `textarea`, `select`, `contenteditable`, `role=textbox`) avoids hijacking editor/search text fields, while `/search` keeps its local shortcut focus behavior.

## 2026-03-08 (Task 5: Token/Pattern Consolidation)

### Primitive Drift Fixed

- `navigation-link.tsx` was importing `cn` from `@foundry/ui` - changed to local `@/lib/utils`
- Grep confirmed zero remaining `@foundry/ui` imports in `apps/web/src`

### Dialog/Form Pattern Standardization

- `create-page-dialog.tsx` refactored from manual state to `react-hook-form` + zod pattern
- Now matches `create-space-dialog.tsx` structure: Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
- Auto-slug/path generation preserved with dirty field detection
- Proper error handling for duplicate paths/slugs with field-level errors

### Token Consolidation

- Added missing `--color-border-subtle` and `--color-border-strong` to `@theme inline`
- `navigation-link.tsx` now uses semantic Tailwind classes: `border-border-strong`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-border-subtle`, `bg-surface-3/80`
- Preserved premium gradient effect for active state using inline gradient (design language)

### Verification

- `pnpm --filter @foundry/web lint` - PASS
- `pnpm --filter @foundry/web typecheck` - PASS (ignoring pre-existing navigation.test.ts issues)
- `pnpm --filter @foundry/web build` - PASS

### Files Changed

- `apps/web/src/components/navigation-link.tsx` - Fixed import, consolidated tokens
- `apps/web/src/app/(app)/spaces/[id]/create-page-dialog.tsx` - Full Form pattern refactor
- `apps/web/src/app/globals.css` - Added border-subtle and border-strong to @theme inline

## 2026-03-08 (Task: Fix navigation.ts TypeScript)

### Investigation

- Task claimed: `'cleanPathname' is possibly 'undefined'` error in `getAppChromeState`
- Verified: All three verification commands pass:
  - `pnpm --filter @foundry/web test src/lib/navigation.test.ts src/lib/navigation-sidebar.test.ts` - 4 passed
  - `pnpm --filter @foundry/web typecheck` - passed
  - `pnpm --filter @foundry/web build` - passed

### Root Cause Analysis

The code at line 144 uses:

```typescript
const cleanPathname = pathname.split("?")[0] ?? pathname;
```

With `noUncheckedIndexedAccess: true` in tsconfig:

- `pathname.split("?")[0]` returns `string | undefined`
- The `??` operator correctly handles this, resulting in `string`
- TypeScript infers `cleanPathname` as `string` - no issue

### Conclusion

No fix required. The code is already type-safe. The task description may have been inaccurate or the issue was resolved before this task was executed.

## 2026-03-08 (Task 6: Core overview shell migration)

- The denser overview routes land better when filters live in a dedicated header card and results switch to shared table/card patterns by breakpoint instead of stacking one-off cards everywhere.
- `CreateSpaceDialog` needs to suppress its internal `DialogTrigger` when it is controlled via `open` / `onOpenChange`; otherwise `/spaces` renders duplicate primary CTAs after the route-level shell migration.
