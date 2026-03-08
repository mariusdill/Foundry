## 2026-03-08

- `lsp_diagnostics` in this workspace currently reports global TypeScript environment issues (for example `Cannot find module 'next/navigation'` and missing JSX intrinsic element types) on unchanged files like `apps/web/src/app/login/page.tsx`, so LSP output is noisy and not specific to this route-group refactor.
- Workspace verification is currently blocked by a pre-existing syntax regression in `apps/web/src/components/navigation-link.tsx` (duplicate ternary branch at line 27), which fails `pnpm --filter @foundry/web lint`, `typecheck`, and `build` independently of command palette changes.
- Playwright check for `/pages/[id]/edit` currently hits an existing runtime overlay (`Tiptap Error: SSR has been detected, please set immediatelyRender explicitly to false` in `src/components/tiptap-editor.tsx`), so input-focus non-hijack was validated on the authenticated `Drafts` page input instead.
- Update: `navigation-link.tsx` was corrected during concurrent work in this branch; `lint`, `typecheck`, and `build` now complete successfully, with only a non-failing warning for an unused `_formData` parameter in `apps/web/src/components/app-shell.tsx` during `build`.

## 2026-03-08 (Task: Fix navigation.ts TypeScript)

- Task: Fix `'cleanPathname' is possibly 'undefined'` error in `getAppChromeState`
- Investigation: Code is already type-safe and passes all verification:
  - Tests: 4 passed
  - Typecheck: passed
  - Build: passed
- Conclusion: No fix required. The nullish coalescing `??` operator correctly handles the potential undefined from array index access with `noUncheckedIndexedAccess: true`.

## 2026-03-08 (Task 6: Core overview shell migration)

- Playwright auth is sensitive to host/port drift across local Next restarts; using `localhost` consistently and keeping `AUTH_SECRET` stable avoids invalid session or callback host churn during route verification.
