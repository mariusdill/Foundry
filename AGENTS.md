# AGENTS.md

Follow `SPEC.md` as the product source of truth.  
Follow `.sisyphus/plans/*.md` as the execution source of truth.

## Constraints

- Stay within MVP scope (see SPEC.md section 3)
- Do not build a Notion clone
- Do not add graph features
- Do not add realtime collaboration in v1
- Keep infrastructure minimal (Postgres only, no Redis/vector DB)
- Preserve dark-first, premium design direction

## Architecture

- Markdown files on disk are the source of truth
- Postgres stores metadata, auth, versions, audit, and search
- Agents write to drafts only by default
- Stable content is human-owned by default

## Execution

- Implement in phases per plan
- Keep changes focused and minimal
- Avoid speculative abstractions
- Do not introduce non-MVP features without explicit approval
