# TASKS



## Phase 1. Foundation

- [ ] Create monorepo/app structure

- [ ] Add Next.js app

- [ ] Add shared UI/config packages

- [ ] Define design tokens

- [ ] Build app shell

- [ ] Build sidebar

- [ ] Build top bar

- [ ] Create dashboard shell

- [ ] Define Prisma schema

- [ ] Create markdown storage helpers



## Phase 2. Core Knowledge Flow

- [ ] Implement spaces

- [ ] Implement nested pages

- [ ] Implement markdown rendering

- [ ] Implement page metadata

- [ ] Implement search

- [ ] Implement recents

- [ ] Implement pinned pages

- [ ] Implement local auth

- [ ] Implement roles and space permissions



## Phase 3. Draft Workflow

- [ ] Add Tiptap editor

- [ ] Add preview mode

- [ ] Add drafts queue

- [ ] Add promote-to-stable flow

- [ ] Add page version history

- [ ] Add revert

- [ ] Add audit log



## Phase 4. Agent Access

- [ ] Add token management UI

- [ ] Add token scopes

- [ ] Add REST API

- [ ] Add OpenAPI spec

- [ ] Add MCP server package

- [ ] Enforce draft-only writes for agent tokens

- [ ] Add MCP examples for clients



## Phase 5. Deployment and Docs

- [ ] Add docker-compose

- [ ] Add .env.example

- [ ] Add README improvements

- [ ] Add architecture docs

- [ ] Add API docs

- [ ] Add MCP docs

- [ ] Add auth docs

- [ ] Add backup/restore docs



## MVP Acceptance Checklist

- [ ] Space can be created

- [ ] Page can be created

- [ ] Page persists to markdown

- [ ] Metadata persists to Postgres

- [ ] Search finds content

- [ ] Preview renders correctly

- [ ] Version history works

- [ ] Revert works

- [ ] Read-only token cannot write

- [ ] Draft-write token can write drafts only

- [ ] MCP read tools work

- [ ] MCP write tools work only for drafts

- [ ] Draft promotion works

- [ ] Audit log records all writes

- [ ] App runs with docker-compose
