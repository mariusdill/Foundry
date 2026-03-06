You are a senior product engineer and product designer.



Build a self-hosted web application called **Foundry**.



Foundry is a modern knowledge workspace for humans and AI agents.

It is not a Notion clone.

It is not a graph PKM tool.

It is not a wiki from 2009.



It is a **premium-feeling, dark-first, sidebar-driven knowledge operations system**

with:

- Markdown-backed content

- strong search

- draft-first AI workflows

- REST API

- MCP server

- excellent UX

- safe agent writes

- low operational complexity



==================================================

1. PRODUCT VISION

==================================================



Build a product that feels like:

- a premium SaaS workspace

- a serious internal tool used by technical teams

- elegant, dense, calm, fast

- modern and polished without being flashy



The visual direction should be inspired by the modern startup/product design language seen in high-end SaaS tools:

- crisp typography

- strong hierarchy

- subtle gradients and depth

- refined dark surfaces

- restrained accents

- clean card layouts

- disciplined spacing

- compact but breathable UI

- serious, technical, premium feel



Do NOT copy another company's branding, illustrations, assets, wording, or layouts directly.

Use the style as inspiration only.



Product adjectives:

- premium

- technical

- elegant

- calm

- focused

- sharp

- fast

- trustworthy



Avoid:

- playful consumer-app vibes

- childish rounded toy styling

- noisy glow effects

- overdone glassmorphism

- enterprise sludge

- clutter

- graph visualizations

- gimmicks



==================================================

2. CORE PRODUCT IDEA

==================================================



Foundry is a shared knowledge platform for:

- humans

- AI agents

- scripts

- automation systems



Humans can:

- create spaces

- create nested pages

- search knowledge

- review drafts

- promote stable content

- manage tokens

- inspect audit history



AI agents can:

- search

- read pages

- list spaces/pages

- create drafts

- update drafts

- append notes



Agents must NOT directly edit stable pages by default.



All writes must be:

- scoped

- auditable

- attributable

- reversible



==================================================

3. MVP SCOPE

==================================================



Build only the following in v1:



Core objects:

- Space

- Page

- Draft

- Token

- Version

- AuditEvent

- Attachment



Core screens:

- Dashboard

- Space index

- Space page tree / listing

- Page view

- Search

- Drafts queue

- Token settings

- Profile settings

- Audit log



Core capabilities:

- create/edit/view pages

- nested page structure

- markdown-backed storage

- markdown preview

- full-text search

- filters

- recent pages

- pinned pages

- page history

- version revert

- API tokens with scopes

- per-space permissions

- MCP server

- draft-only agent writing

- audit log for all writes



Do NOT implement in v1:

- realtime collaboration

- presence

- comments

- kanban

- whiteboards

- databases like Notion

- custom block schemas

- graph view

- AI chat inside every page

- semantic search

- external LLM dependencies

- social features

- notifications

- team chat



==================================================

4. DESIGN SYSTEM

==================================================



Use:

- Next.js App Router

- TypeScript

- Tailwind CSS

- shadcn/ui

- Lucide icons

- TanStack Table

- Framer Motion only for subtle UI polish

- Tiptap editor

- Prisma

- Postgres



Design system principles:

- dark-first

- tokenized colors

- strong text contrast

- subtle layered surfaces

- crisp borders

- soft shadows

- clean spacing rhythm

- keyboard-friendly

- responsive but desktop-first



Use a design-token system with CSS variables.



Color system:

Base palette:

- background

- surface-1

- surface-2

- surface-3

- border-subtle

- border-strong

- text-primary

- text-secondary

- text-muted



Semantic palette:

- info

- success

- warning

- danger

- accent-agent

- accent-human



Status colors:

- draft = amber

- stable = green

- archived = red/rose muted

- agent-touched = violet or purple

- info/search = cool blue



Recommended design token defaults:

--background: near-black graphite

--surface-1: dark slate

--surface-2: slightly lifted dark gray

--surface-3: elevated panels

--text-primary: soft off-white

--text-secondary: cool light gray

--text-muted: muted slate

--accent: restrained steel-blue or indigo

--accent-agent: violet

--accent-draft: amber

--accent-stable: green



Border and depth rules:

- use subtle 1px borders

- avoid loud dividers everywhere

- use elevation sparingly

- prefer contrast via surface change over giant shadows

- cards should feel premium and calm, not puffy



Radius system:

- small controls: rounded-md

- cards/panels: rounded-2xl

- modals/dialogs: rounded-2xl

- pill/status chips: fully rounded



Typography:

- strong, editorial-feeling headings

- clean sans serif

- no novelty fonts

- clear hierarchy

- comfortable code font for snippets

- page titles large and confident

- metadata compact and unobtrusive



Spacing:

- consistent 4/6/8 rhythm

- compact layouts with breathing room

- avoid giant empty areas

- optimize for focus and information density



Motion:

- subtle hover transitions

- short fade/slide transitions

- no bouncy motion

- no exaggerated animations



==================================================

5. INFORMATION ARCHITECTURE

==================================================



Sidebar sections:

- Search

- Recents

- Pinned

- Spaces

- Drafts

- Runbooks

- Projects

- Settings



Sidebar bottom:

- current user

- current workspace

- token/agent status indicator



Top bar:

- breadcrumb

- current page title

- page status badge

- quick actions

- search shortcut hint

- promote/history buttons when relevant



Main navigation model:

- workspace

  - spaces

    - nested pages

- global search

- drafts review flow

- page-centric reading/editing



==================================================

6. SCREEN-BY-SCREEN UI REQUIREMENTS

==================================================



A. DASHBOARD

Purpose:

- orient the user quickly

- expose recent work

- show AI activity without being noisy



Sections:

- recent pages

- pinned pages

- drafts awaiting review

- recent agent activity

- quick create actions

- stale pages / review-needed widget



Design:

- hero header with concise welcome/search

- compact cards in a balanced grid

- activity feed styled like a premium admin product

- quick actions highly visible but not oversized



B. SPACES INDEX

Purpose:

- list spaces clearly

- show status and access at a glance



Requirements:

- card and list toggle

- each space has icon, title, description, page count

- show access role badge

- create space button

- sort/filter controls



C. SPACE VIEW

Purpose:

- browse a space with clarity and speed



Requirements:

- left mini-tree or collapsible tree

- main list of pages

- support nested path browsing

- filter by status, tags, updated date

- page rows show:

  - title

  - path

  - tags

  - status

  - updatedAt

  - updatedBy

  - source badge (human/agent)



D. PAGE VIEW

Purpose:

- beautiful reading and editing experience



Layout:

- title area

- metadata row

- main content

- optional right utility rail



Header elements:

- title

- status badge

- tags

- updated metadata

- source badge

- pin button

- history button

- edit/preview toggle

- promote button if draft

- archive action



Right rail tabs:

- History

- Audit

- Attachments

- Linked drafts / notes



Main content requirements:

- excellent typography

- markdown rendering

- code blocks

- tables

- checklists

- callouts

- mermaid fenced blocks

- copy-to-clipboard for code

- preview mode must look polished



E. SEARCH

Purpose:

- be one of the best parts of the product



Requirements:

- prominent search bar

- keyboard shortcut

- fast, clean results

- filters as chips or segmented controls

- sort by relevance or updated date

- compact readable result rows

- each result shows:

  - title

  - short excerpt

  - space

  - path

  - tags

  - status

  - updatedAt



Must feel instant and focused.



F. DRAFTS QUEUE

Purpose:

- central review workflow for AI-generated or in-progress content



Requirements:

- list drafts with:

  - title

  - source

  - updatedAt

  - updatedBy

  - space/path target

  - review status

- promote action

- archive action

- open diff/history

- filter by agent/human/tag/status



This screen is critical.

Make it feel like a serious review console.



G. TOKEN SETTINGS

Purpose:

- make API/MCP management first-class



Requirements:

- token list

- create token dialog

- scopes

- allowed spaces

- allowed path prefixes

- last used

- revoke

- rotate token

- copy token once pattern



Token scopes:

- read:spaces

- read:pages

- search

- write:drafts

- write:attachments

- admin



The token management UI must feel premium and trustworthy.

Do not make it look like a neglected dev settings page.



H. AUDIT LOG

Purpose:

- show confidence and safety



Requirements:

- filterable event table

- actor

- actor type (human/agent)

- action

- target

- timestamp

- scope

- diff/version link when applicable



==================================================

7. CONTENT MODEL

==================================================



Markdown files on disk are the source of truth.



Use this folder structure:

/data/runbooks

/data/projects

/data/drafts

/data/attachments



Each page is stored as a markdown file with YAML frontmatter.



Required frontmatter fields:

---

id: <uuid>

title: <string>

slug: <string>

space: <string>

path: <string>

status: draft|stable|archived

tags:

  - <string>

updatedBy: <string>

updatedAt: <iso-date>

source: human|agent

pinned: false

---



Use Postgres for:

- users

- roles

- spaces

- page metadata

- versions

- attachments

- audit log

- api tokens

- token scopes

- search metadata



==================================================

8. EDITOR REQUIREMENTS

==================================================



Use Tiptap with a conservative feature set.



Supported content:

- headings

- paragraphs

- bullet lists

- numbered lists

- checklists

- links

- bold

- italic

- inline code

- code blocks

- blockquotes

- tables

- horizontal rules

- mermaid fenced blocks



Required behaviors:

- import markdown

- export markdown

- stable round-tripping for common content

- edit mode

- preview mode

- copy-as-markdown action



Keep the content model conservative.

Do not implement fancy custom blocks in v1.



==================================================

9. SEARCH REQUIREMENTS

==================================================



Use Postgres full-text search for MVP.



Search across:

- title

- content

- tags

- path



Filters:

- space

- status

- tags

- updated date

- source

- pinned



Sorting:

- relevance

- updatedAt



Search must feel fast and central to the product.



==================================================

10. AUTH, ROLES, AND SAFETY

==================================================



Auth modes:

- local email/password auth

- optional trusted reverse proxy mode



Trusted reverse proxy mode:

- if X-Forwarded-User or similar trusted header exists, treat as authenticated user

- document how to use this behind Authelia/Authentik



Roles:

- Admin

- Editor

- Reader



Permissions must support per-space access control.



Token model:

- read-only by default

- explicit scopes required for write

- token may be limited to allowed spaces

- token may be limited to allowed path prefixes



Safety rules:

- agents may read anywhere allowed

- agents may only write to drafts by default

- agents may not edit stable pages directly

- every write must create:

  - version snapshot

  - audit event

  - actor attribution



==================================================

11. AGENT WORKFLOW

==================================================



This is a draft-first knowledge system.



Agent workflow:

1. search knowledge

2. read relevant pages

3. create or update draft

4. optionally append notes to a draft

5. human reviews

6. human promotes draft to stable page



Stable content is human-owned by default.

Agent content is suggestion-oriented by default.



Required page metadata indicators:

- source: human or agent

- last verified by human

- last updated by

- status badge



==================================================

12. API REQUIREMENTS

==================================================



Provide a REST API with OpenAPI spec.



Required endpoints:

- GET /api/spaces

- POST /api/spaces

- GET /api/pages

- GET /api/pages/:id

- POST /api/pages

- PATCH /api/pages/:id

- GET /api/search

- GET /api/audit

- GET /api/tokens

- POST /api/tokens

- DELETE /api/tokens/:id

- POST /api/pages/:id/promote

- POST /api/pages/:id/revert



All write endpoints must enforce role and token rules.



==================================================

13. MCP SERVER REQUIREMENTS

==================================================



Create a separate package:

- /packages/mcp-server



Provide these tools:

- list_spaces()

- list_pages(space, pathPrefix?)

- get_page(id or slug)

- search(query, filters?)

- create_draft(space, path, title, markdown, tags?)

- update_draft(pageId, markdown, title?, tags?)

- append_note(pageId, markdownAppend)



Behavior rules:

- default read-only

- write actions require write:drafts

- stable pages cannot be modified by default through MCP

- all MCP writes must create audit/version entries



Provide example configs for:

- Claude Desktop

- Cursor

- OpenCode / CLI MCP



==================================================

14. REPO STRUCTURE

==================================================



Use a monorepo or clear app/package layout.



Suggested structure:

/apps/web

/packages/ui

/packages/config

/packages/mcp-server

/packages/shared

/data

/docs



==================================================

15. DEPLOYMENT

==================================================



Provide:

- docker-compose.yml

- .env.example

- local dev instructions

- production notes



Runtime services:

- web

- postgres



Keep infra minimal.

Do not require Redis, vector DB, or external AI services for MVP.



==================================================

16. DOCUMENTATION

==================================================



Required docs:

- README.md

- docs/architecture.md

- docs/design-system.md

- docs/api.md

- docs/mcp.md

- docs/auth.md

- docs/backup-restore.md

- docs/agent-workflow.md



==================================================

17. IMPLEMENTATION PHASES

==================================================



Phase 1:

- scaffold app

- establish design system

- build sidebar/topbar/shell

- implement theme tokens

- create dashboard shell

- define DB schema

- create markdown storage helpers



Phase 2:

- spaces and pages CRUD

- page tree/listing

- markdown rendering

- search

- recent/pinned pages

- local auth + roles



Phase 3:

- Tiptap editor

- preview mode

- drafts flow

- page history

- audit log

- promote draft flow



Phase 4:

- token management

- REST API polish

- MCP server

- docker compose

- docs

- final UX polish



==================================================

18. ACCEPTANCE CRITERIA

==================================================



The MVP is complete when all of the following work:



1. create a space

2. create a page

3. page persists to markdown file

4. metadata persists to Postgres

5. search finds the page by title and content

6. page preview renders correctly

7. page version history works

8. revert works

9. read-only token cannot write

10. draft-write token can create and edit drafts only

11. MCP read tools work

12. MCP write tools work only for drafts

13. draft can be promoted to stable by human user

14. audit log shows all writes with actor attribution

15. app runs via docker-compose on a clean machine



==================================================

19. EXECUTION RULES

==================================================



Important rules:

- Do not expand scope beyond MVP

- Do not try to build a Notion replacement

- Do not add realtime collaboration

- Do not add graph features

- Do not add vector search in v1

- Do not add custom block databases

- Prioritize clarity, speed, and maintainability

- Optimize for a premium product feel

- Keep the UI disciplined and sharp

- Treat search, page view, and token settings as flagship surfaces

- Treat draft review as a core product workflow, not an afterthought



Start by implementing:

1. the design token system

2. the app shell

3. dashboard

4. spaces/page browsing

5. markdown storage model

6. database schema



Then proceed through the phases above.



When in doubt, choose:

- simpler architecture

- cleaner UI

- stronger defaults
