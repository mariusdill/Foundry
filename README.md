# Foundry

## Local Setup

From the repo root:

```bash
pnpm install
cp .env.example .env
mkdir -p data
docker compose up -d postgres
pnpm db:generate
pnpm db:push
pnpm db:seed
```

Recommended local `.env` values:

```bash
DATABASE_URL=postgresql://foundry:foundry@localhost:5432/foundry?schema=public
AUTH_SECRET=change-me-in-production
NEXTAUTH_URL=http://localhost:3000
DATA_DIR=./data
SEED_ADMIN_EMAIL=admin@foundry.local
SEED_ADMIN_NAME=Foundry Admin
SEED_ADMIN_PASSWORD=admin123
```

## Run The Website

From the repo root:

```bash
pnpm dev
```

Open `http://localhost:3000`.

You can log in with:

```text
admin@foundry.local
admin123
```

If you only want to run the web app package directly:

```bash
cd apps/web
pnpm dev
```

## Build

Build the full workspace:

```bash
pnpm build
```

Run the production web server:

```bash
pnpm --filter @foundry/web start
```

Or from `apps/web`:

```bash
pnpm build
pnpm start
```

## Test

From the repo root:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter @foundry/web test:e2e
```

Or from `apps/web`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
```

## Docker

To run Postgres and the web app together:

```bash
docker compose up --build
```

That serves the app on `http://localhost:3000`.
