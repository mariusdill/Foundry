k# AGENTS.md

Follow `SPEC.md` as the primary source of truth.

## Core rules

- Stay within MVP scope

- Do not build a Notion clone

- Do not add graph features

- Do not add realtime collaboration in v1

- Keep infrastructure minimal

- Prefer simple, maintainable solutions

- Preserve the premium dark-first product design direction

- Treat search, page view, drafts, and token management as flagship surfaces

## Architecture rules

- Markdown files on disk are the source of truth

- Postgres stores metadata, auth, versions, audit, and search metadata

- Agents write to drafts only by default

- Stable content is human-owned by default

## Working style

- Implement in phases

- Keep changes focused

- Avoid speculative abstractions

- Update documentation when architecture or behavior changes

- Do not introduce non-MVP features without explicit decision
