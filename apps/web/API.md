# Foundry API Documentation

REST API for managing spaces, pages, and search in Foundry.

## Table of Contents

- [Spaces](#spaces)
  - [GET /api/spaces](#get-apispaces)
  - [POST /api/spaces](#post-apispaces)
  - [GET /api/spaces/:id](#get-apispacesid)
  - [PATCH /api/spaces/:id](#patch-apispacesid)
  - [DELETE /api/spaces/:id](#delete-apispacesid)
- [Pages](#pages)
  - [GET /api/pages](#get-apipages)
  - [POST /api/pages](#post-apipages)
  - [GET /api/pages/:id](#get-apipagesid)
  - [PATCH /api/pages/:id](#patch-apipagesid)
  - [DELETE /api/pages/:id](#delete-apipagesid)
- [Listing & Search](#listing--search)
  - [GET /api/spaces/:id/pages](#get-apispacesidpages)
  - [GET /api/pages/recent](#get-apipagesrecent)
  - [GET /api/pages/pinned](#get-apipagespinned)
  - [GET /api/pages/search](#get-apipagessearch)

---

## Spaces

### GET /api/spaces

List all spaces ordered by name alphabetically.

**Request**:

- Method: GET
- Headers: None
- Query Parameters: None

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string | null",
      "kind": "runbooks | projects",
      "icon": "string",
      "rootFolder": "string",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ]
  ```

**Error Responses**:

- 500 Server Error: Failed to fetch spaces

**Example**:

```bash
curl http://localhost:3000/api/spaces
```

---

### POST /api/spaces

Create a new space with associated folder on disk.

**Request**:

- Method: POST
- Content-Type: application/json
- Body:
  ```json
  {
    "name": "string (1-80 chars, required)",
    "slug": "string (1-80 chars, lowercase alphanumeric with hyphens, required)",
    "description": "string (max 280 chars, optional)",
    "kind": "runbooks | projects (default: projects, optional)",
    "icon": "string (max 48 chars, default: FolderGit2, optional)"
  }
  ```

**Response**:

- Status: 201 Created
- Body:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "kind": "runbooks | projects",
    "icon": "string",
    "rootFolder": "string",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
  ```

**Error Responses**:

- 400 Bad Request: Validation failed or space with slug already exists
- 500 Server Error: Server configuration error or failed to create space

**Example**:

```bash
curl -X POST http://localhost:3000/api/spaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "slug": "my-project",
    "description": "A sample project space",
    "kind": "projects"
  }'
```

---

### GET /api/spaces/:id

Get a single space by its ID.

**Request**:

- Method: GET
- Path Parameters: `id` (UUID string, required)

**Response**:

- Status: 200 OK
- Body:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "kind": "runbooks | projects",
    "icon": "string",
    "rootFolder": "string",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
  ```

**Error Responses**:

- 404 Not Found: Space not found
- 500 Server Error: Failed to fetch space

**Example**:

```bash
curl http://localhost:3000/api/spaces/123e4567-e89b-12d3-a456-426614174000
```

---

### PATCH /api/spaces/:id

Update a space. Note: The `kind` field cannot be changed after creation.

**Request**:

- Method: PATCH
- Path Parameters: `id` (UUID string, required)
- Content-Type: application/json
- Body (all fields optional):
  ```json
  {
    "name": "string (1-80 chars, optional)",
    "slug": "string (1-80 chars, lowercase alphanumeric with hyphens, optional)",
    "description": "string (max 280 chars, optional)",
    "icon": "string (max 48 chars, optional)"
  }
  ```

**Response**:

- Status: 200 OK
- Body:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "kind": "runbooks | projects",
    "icon": "string",
    "rootFolder": "string",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
  ```

**Error Responses**:

- 400 Bad Request: Validation failed or space with slug already exists
- 404 Not Found: Space not found
- 500 Server Error: Failed to update space

**Example**:

```bash
curl -X PATCH http://localhost:3000/api/spaces/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

---

### DELETE /api/spaces/:id

Delete a space and its associated folder on disk.

**Request**:

- Method: DELETE
- Path Parameters: `id` (UUID string, required)

**Response**:

- Status: 204 No Content

**Error Responses**:

- 404 Not Found: Space not found
- 500 Server Error: Failed to delete space

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/spaces/123e4567-e89b-12d3-a456-426614174000
```

---

## Pages

### GET /api/pages

List all pages with optional space filter, ordered by most recently updated first.

**Request**:

- Method: GET
- Query Parameters:
  - `spaceId` (UUID string, optional): Filter pages by space ID

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "pinned": "boolean",
      "source": "human | agent",
      "contentPath": "string",
      "contentText": "string | null",
      "spaceId": "uuid",
      "draftOfPageId": "uuid | null",
      "updatedById": "uuid | null",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "space": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      }
    }
  ]
  ```

**Error Responses**:

- 500 Server Error: Failed to fetch pages

**Example**:

```bash
# List all pages
curl http://localhost:3000/api/pages

# List pages in a specific space
curl "http://localhost:3000/api/pages?spaceId=123e4567-e89b-12d3-a456-426614174000"
```

---

### POST /api/pages

Create a new page with markdown file on disk.

**Request**:

- Method: POST
- Content-Type: application/json
- Body:
  ```json
  {
    "spaceId": "uuid (required)",
    "title": "string (1-160 chars, required)",
    "slug": "string (1-160 chars, required)",
    "path": "string (1-255 chars, required)",
    "markdown": "string (default: empty string, optional)",
    "tags": ["string"] (default: [], optional),
    "pinned": "boolean (default: false, optional)",
    "status": "draft | stable | archived (default: draft, optional)",
    "source": "human | agent (default: human, optional)",
    "draftOfPageId": "uuid (optional)"
  }
  ```

**Response**:

- Status: 201 Created
- Body:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "path": "string",
    "status": "draft | stable | archived",
    "tags": ["string"],
    "pinned": "boolean",
    "source": "human | agent",
    "contentPath": "string",
    "contentText": "string | null",
    "spaceId": "uuid",
    "draftOfPageId": "uuid | null",
    "updatedById": "uuid | null",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "space": {
      "id": "uuid",
      "name": "string",
      "slug": "string"
    }
  }
  ```

**Error Responses**:

- 400 Bad Request: Validation failed or page with path already exists in space
- 404 Not Found: Space not found
- 500 Server Error: Server configuration error or failed to create page

**Example**:

```bash
curl -X POST http://localhost:3000/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "spaceId": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Getting Started",
    "slug": "getting-started",
    "path": "docs/getting-started.md",
    "markdown": "# Getting Started\n\nWelcome to the guide.",
    "tags": ["guide", "docs"],
    "status": "draft"
  }'
```

---

### GET /api/pages/:id

Get a single page by ID, including its markdown content and frontmatter.

**Request**:

- Method: GET
- Path Parameters: `id` (UUID string, required)

**Response**:

- Status: 200 OK
- Body:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "path": "string",
    "status": "draft | stable | archived",
    "tags": ["string"],
    "pinned": "boolean",
    "source": "human | agent",
    "contentPath": "string",
    "contentText": "string | null",
    "spaceId": "uuid",
    "draftOfPageId": "uuid | null",
    "updatedById": "uuid | null",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "space": {
      "id": "uuid",
      "name": "string",
      "slug": "string"
    },
    "frontmatter": {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "space": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "updatedBy": "string",
      "updatedAt": "ISO timestamp",
      "source": "human | agent",
      "pinned": "boolean"
    },
    "markdown": "string"
  }
  ```

**Error Responses**:

- 404 Not Found: Page not found
- 500 Server Error: Failed to fetch page

**Example**:

```bash
curl http://localhost:3000/api/pages/123e4567-e89b-12d3-a456-426614174000
```

---

### PATCH /api/pages/:id

Update a page and its associated markdown file.

**Request**:

- Method: PATCH
- Path Parameters: `id` (UUID string, required)
- Content-Type: application/json
- Body (all fields optional):
  ```json
  {
    "title": "string (1-160 chars, optional)",
    "markdown": "string (optional)",
    "tags": ["string"] (optional),
    "pinned": "boolean (optional)",
    "status": "draft | stable | archived (optional)"
  }
  ```

**Response**:

- Status: 200 OK
- Body:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "path": "string",
    "status": "draft | stable | archived",
    "tags": ["string"],
    "pinned": "boolean",
    "source": "human | agent",
    "contentPath": "string",
    "contentText": "string | null",
    "spaceId": "uuid",
    "draftOfPageId": "uuid | null",
    "updatedById": "uuid | null",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "space": {
      "id": "uuid",
      "name": "string",
      "slug": "string"
    }
  }
  ```

**Error Responses**:

- 400 Bad Request: Validation failed
- 404 Not Found: Page not found
- 500 Server Error: Failed to update page or write markdown file

**Example**:

```bash
curl -X PATCH http://localhost:3000/api/pages/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "markdown": "# Updated Content",
    "status": "stable"
  }'
```

---

### DELETE /api/pages/:id

Delete a page and its associated markdown file.

**Request**:

- Method: DELETE
- Path Parameters: `id` (UUID string, required)

**Response**:

- Status: 204 No Content

**Error Responses**:

- 404 Not Found: Page not found
- 500 Server Error: Failed to delete page

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/pages/123e4567-e89b-12d3-a456-426614174000
```

---

## Listing & Search

### GET /api/spaces/:id/pages

List all pages within a specific space, ordered by most recently updated first.

**Request**:

- Method: GET
- Path Parameters: `id` (UUID string, required)
- Query Parameters:
  - `status` (string, optional): Filter by page status (`draft`, `stable`, `archived`)

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "pinned": "boolean",
      "source": "human | agent",
      "contentPath": "string",
      "contentText": "string | null",
      "spaceId": "uuid",
      "draftOfPageId": "uuid | null",
      "updatedById": "uuid | null",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "space": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      }
    }
  ]
  ```

**Error Responses**:

- 500 Server Error: Failed to fetch space pages

**Example**:

```bash
# All pages in space
curl http://localhost:3000/api/spaces/123e4567-e89b-12d3-a456-426614174000/pages

# Only stable pages in space
curl "http://localhost:3000/api/spaces/123e4567-e89b-12d3-a456-426614174000/pages?status=stable"
```

---

### GET /api/pages/recent

Get recently updated pages, ordered by most recent update first.

**Request**:

- Method: GET
- Query Parameters:
  - `limit` (number, optional): Maximum number of results (default: 20, max: 100)

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "pinned": "boolean",
      "source": "human | agent",
      "contentPath": "string",
      "contentText": "string | null",
      "spaceId": "uuid",
      "draftOfPageId": "uuid | null",
      "updatedById": "uuid | null",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "space": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      }
    }
  ]
  ```

**Error Responses**:

- 500 Server Error: Failed to fetch recent pages

**Example**:

```bash
# Default 20 recent pages
curl http://localhost:3000/api/pages/recent

# Get 50 recent pages
curl "http://localhost:3000/api/pages/recent?limit=50"
```

---

### GET /api/pages/pinned

Get all pinned pages, ordered by most recently updated first.

**Request**:

- Method: GET

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "pinned": true,
      "source": "human | agent",
      "contentPath": "string",
      "contentText": "string | null",
      "spaceId": "uuid",
      "draftOfPageId": "uuid | null",
      "updatedById": "uuid | null",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "space": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      }
    }
  ]
  ```

**Error Responses**:

- 500 Server Error: Failed to fetch pinned pages

**Example**:

```bash
curl http://localhost:3000/api/pages/pinned
```

---

### GET /api/pages/search

Search pages with various filters. Returns up to 50 results.

**Request**:

- Method: GET
- Query Parameters:
  - `q` (string, default: ""): Search query to match against page titles (case-insensitive)
  - `space` (string, optional): Filter by space slug
  - `status` (string, optional): Filter by page status (`draft`, `stable`, `archived`)
  - `source` (string, optional): Filter by page source (`human`, `agent`)
  - `tag` (string, optional): Filter by tag (pages containing this tag)
  - `pinned` (boolean, optional): Filter by pinned status
  - `sort` (string, default: `relevance`): Sort order (`relevance`, `updatedAt`)

**Response**:

- Status: 200 OK
- Body:
  ```json
  [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "path": "string",
      "status": "draft | stable | archived",
      "tags": ["string"],
      "pinned": "boolean",
      "source": "human | agent",
      "contentPath": "string",
      "spaceId": "uuid",
      "draftOfPageId": "uuid | null",
      "updatedById": "uuid | null",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "space": {
        "id": "uuid",
        "name": "string",
        "slug": "string"
      },
      "excerpt": "string (first 200 chars of content)"
    }
  ]
  ```

**Error Responses**:

- 400 Bad Request: Invalid search parameters
- 500 Server Error: Failed to search pages

**Example**:

```bash
# Search by title
curl "http://localhost:3000/api/pages/search?q=getting%20started"

# Search with multiple filters
curl "http://localhost:3000/api/pages/search?q=api&space=my-project&status=stable&sort=relevance"

# Find pinned pages with specific tag
curl "http://localhost:3000/api/pages/search?tag=guide&pinned=true"
```

---

## Common Types

### PageStatus

Enum values: `draft`, `stable`, `archived`

### PageSource

Enum values: `human`, `agent`

### SpaceKind

Enum values: `runbooks`, `projects`
