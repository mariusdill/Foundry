import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { join } from "node:path";

import { fileFrontmatterSchema, slugifyValue } from "@foundry/shared";
import bcrypt from "bcryptjs";
import { prisma } from "./client";
import { resolvePageFilePath, writeMarkdownFile } from "./markdown";

// ============================================================================
// Types
// ============================================================================

type PageStatus = "draft" | "stable" | "archived";
type PageSource = "human" | "agent";
type SpaceKind = "runbooks" | "projects";
type UserRole = "admin" | "editor" | "reader";

// ============================================================================
async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

// ============================================================================
// Configuration
// ============================================================================

const DATA_DIR = process.env.DATA_DIR ?? join(__dirname, "..", "..", "data");

const USERS = [
	{
		email: "admin@foundry.local",
		password: "admin123",
		name: "Foundry Admin",
		role: "admin" as UserRole,
	},
	{
		email: "editor@foundry.local",
		password: "editor123",
		name: "Test Editor",
		role: "editor" as UserRole,
	},
	{
		email: "reader@foundry.local",
		password: "reader123",
		name: "Test Reader",
		role: "reader" as UserRole,
	},
];

const SPACES = [
	{
		name: "Infrastructure Runbooks",
		slug: "infra-runbooks",
		description: "Core infrastructure provisioning and management procedures",
		icon: "Server",
		kind: "runbooks" as SpaceKind,
	},
	{
		name: "Operations Runbooks",
		slug: "ops-runbooks",
		description: "Day-to-day operational procedures and runbooks",
		icon: "BookOpen",
		kind: "runbooks" as SpaceKind,
	},
	{
		name: "Product Documentation",
		slug: "product-docs",
		description: "User-facing product documentation and guides",
		icon: "FileText",
		kind: "projects" as SpaceKind,
	},
	{
		name: "Engineering Wiki",
		slug: "eng-wiki",
		description: "Internal engineering documentation and knowledge base",
		icon: "HardDrive",
		kind: "projects" as SpaceKind,
	},
];

// ============================================================================
// Seed Data - Pages
// ============================================================================

type PageSeedData = {
	title: string;
	path: string;
	status: PageStatus;
	source: PageSource;
	pinned: boolean;
	tags: string[];
	markdown: string;
};

const PAGES_BY_SPACE: Record<string, PageSeedData[]> = {
	"infra-runbooks": [
		{
			title: "Server Provisioning Guide",
			path: "getting-started/server-provisioning",
			status: "stable",
			source: "human",
			pinned: true,
			tags: ["infrastructure", "provisioning", "servers"],
			markdown: `# Server Provisioning Guide

This guide covers the standard procedure for provisioning new production servers.

## Prerequisites

- [ ] Access to cloud provider console
- [ ] Approved request ticket
- [ ] SSH key configured

## Procedure

### 1. Initialize Cloud Instance

\`\`\`bash
# Create the instance
gcloud compute instances create \\
  --zone=us-central1-a \\
  --machine-type=e2-standard-2 \\
  --boot-disk-size=50GB \\
  prod-server-001
\`\`\`

### 2. Configure Networking

| Step | Action | Notes |
|------|--------|-------|
| 1 | Assign static IP | Use reserved IP |
| 2 | Configure firewall | Allow ports 22, 80, 443 |
| 3 | Set up DNS | Point to static IP |

### 3. Post-Provisioning Setup

- [ ] Install base packages
- [ ] Configure monitoring agent
- [ ] Set up backup cron jobs
- [ ] Add to load balancer pool

## Verification

Run the following to verify:

\`\`\`bash
ssh admin@server-ip "curl -s localhost/health"
\`\`\`

Expected: \`{"status": "healthy"}\`
`,
		},
		{
			title: "Database Backup Procedures",
			path: "operations/database-backup",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["database", "backup", "disaster-recovery"],
			markdown: `# Database Backup Procedures

## Overview

This document describes our daily database backup procedures.

## Backup Schedule

| Type | Frequency | Retention |
|------|-----------|-----------|
| Full | Daily 2:00 UTC | 30 days |
| Incremental | Hourly | 7 days |
| Archive | Weekly | 1 year |

## Manual Backup

To perform a manual backup:

\`\`\`bash
# Connect to primary
psql -h db-primary.internal -U backup_user

# Run backup
SELECT pg_backup_start('manual-backup');
-- Perform operations
SELECT pg_backup_stop();
\`\`\`

## Restore Procedure

1. Stop all application services
2. Identify backup to restore from
3. Run restore command
4. Verify data integrity
5. Restart services

> **Warning**: Never restore to primary without confirming data integrity
`,
		},
		{
			title: "Incident Response Playbook",
			path: "incidents/response-playbook",
			status: "draft",
			source: "agent",
			pinned: false,
			tags: ["incidents", "on-call", "runbook"],
			markdown: `# Incident Response Playbook

> **Draft** - This playbook is being refined based on recent incidents.

## Severity Levels

- **SEV1**: Complete service outage
- **SEV2**: Major feature unavailable
- **SEV3**: Minor issue, workarounds available

## Initial Response

When an incident is declared:

1. **Acknowledge** the alert within 5 minutes
2. **Assess** severity and impact
3. **Notify** the on-call team
4. **Begin** incident log

## Communication Template

\`\`\`
[INCIDENT] SEV<N> - <Brief Description>

Impact: <Who/what is affected>
Status: Investigating
ETA: TBD
Lead: @<name>
\`\`\`

## Escalation Path

\`\`\`
SEV1 → CTO immediately
SEV2 → Team Lead within 10 min
SEV3 → Team channel
\`\`\`
`,
		},
		{
			title: "SSL Certificate Renewal",
			path: "security/ssl-renewal",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["security", "ssl", "certificates"],
			markdown: `# SSL Certificate Renewal

## Automated Renewal

Our certificates are automatically renewed via Let's Encrypt. This document covers manual renewal procedures.

## Manual Renewal Steps

### 1. Check Expiration

\`\`\`bash
openssl s_client -connect foundry.local:443 -servername foundry.local 2>/dev/null | openssl x509 -noout -dates
\`\`\`

### 2. Generate New Certificate

\`\`\`bash
certbot certonly --webroot -w /var/www/html -d foundry.local
\`\`\`

### 3. Install Certificate

\`\`\`bash
# Copy new certs
cp /etc/letsencrypt/live/foundry.local/fullchain.pem /etc/nginx/ssl/foundry.crt
cp /etc/letsencrypt/live/foundry.local/privkey.pem /etc/nginx/ssl/foundry.key

# Reload nginx
nginx -t && systemctl reload nginx
\`\`\`

## Verification

\`\`\`bash
curl -I https://foundry.local
\`\`\`

Check for valid certificate in browser.
`,
		},
		{
			title: "Monitoring Setup",
			path: "setup/monitoring",
			status: "draft",
			source: "human",
			pinned: false,
			tags: ["monitoring", "setup", "metrics"],
			markdown: `# Monitoring Setup

> **In Progress**: Adding new metric collectors

## Current Stack

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **AlertManager**: Alert routing

## Adding New Metrics

### 1. Instrument Code

\`\`\`typescript
const metric = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status']
});
\`\`\`

### 2. Configure Scrape

Add to \`prometheus.yml\`:

\`\`\`yaml
- job_name: 'my-service'
  static_configs:
    - targets: ['my-service:8080']
\`\`\`

### 3. Create Dashboard

Import JSON template in Grafana.
`,
		},
	],
	"ops-runbooks": [
		{
			title: "Deployment Checklist",
			path: "releases/deployment-checklist",
			status: "stable",
			source: "human",
			pinned: true,
			tags: ["deployment", "releases", "checklist"],
			markdown: `# Deployment Checklist

Use this checklist before every production deployment.

## Pre-Deployment

- [ ] All tests passing in CI
- [ ] Code review approved
- [ ] Changelog updated
- [ ] Database migrations tested
- [ ] Rollback plan documented

## Deployment Steps

### 1. Create Backup

\`\`\`bash
./scripts/backup-db.sh
\`\`\`

### 2. Deploy to Staging

\`\`\`bash
./deploy.sh staging
\`\`\`

### 3. Verify Staging

- [ ] Smoke tests pass
- [ ] Performance within SLA
- [ ] No critical errors in logs

### 4. Deploy to Production

\`\`\`bash
./deploy.sh production
\`\`\`

## Post-Deployment

- [ ] Monitor error rates
- [ ] Verify key flows
- [ ] Update status page
- [ ] Notify stakeholders
`,
		},
		{
			title: "On-Call Handoff Process",
			path: "oncall/handoff",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["oncall", "process", "handoff"],
			markdown: `# On-Call Handoff Process

## Weekly Handoff

Every Friday at 17:00 UTC:

1. Review open incidents
2. Check pending changes
3. Update runbook accuracy
4. Share knowledge with next on-call

## Handoff Checklist

- [ ] Active incidents status
- [ ] Upcoming maintenance windows
- [ ] Known issues / workarounds
- [ ] Access credentials (if needed)
- [ ] Contact information verified

## Communication

Post in \`#ops-oncall\` channel:

\`\`\`
Oncall Handoff - <Date>

Outgoing: @<name>
Incoming: @<name>

Active Issues:
- <issue summary>

Upcoming:
- <maintenance or changes>

Questions? Reach out in #ops-urgent
\`\`\`
`,
		},
		{
			title: "Log Analysis Guide",
			path: "troubleshooting/log-analysis",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["troubleshooting", "logs", "debugging"],
			markdown: `# Log Analysis Guide

## Accessing Logs

### CloudWatch

\`\`\`bash
aws logs tail /aws/ecs/production --follow
\`\`\`

### Kibana

1. VPN into production network
2. Open Kibana at logs.internal
3. Use filters to narrow search

## Common Patterns

### Error Patterns

| Pattern | Meaning | Action |
|---------|---------|--------|
| Timeout | Service too slow | Check metrics |
| Connection refused | Service down | Check health |
| 5xx errors | Server error | Check stack trace |

### Search Tips

- Use wildcards: \`error*\`
- Time range: Last 15 minutes
- Exclude noise: \`-namespace:kube\`
`,
		},
		{
			title: "Database Performance Tuning",
			path: "database/performance-tuning",
			status: "draft",
			source: "agent",
			pinned: false,
			tags: ["database", "performance", "optimization"],
			markdown: `# Database Performance Tuning

> **Draft** - Requires review by DBA team

## Query Optimization

### Identifying Slow Queries

\`\`\`sql
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
\`\`\`

### Adding Indexes

\`\`\`sql
CREATE INDEX CONCURRENTLY idx_users_email
ON users(email);
\`\`\`

## Connection Pooling

Recommended settings:

\`\`\`
min_connections: 10
max_connections: 100
idle_timeout: 30000
\`\`\`
`,
		},
		{
			title: "Emergency Shutdown Procedure",
			path: "emergency/shutdown",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["emergency", "safety", "shutdown"],
			markdown: `# Emergency Shutdown Procedure

## When to Use

Only use in cases of:
- Security breach
- Data corruption risk
- Uncontrolled resource consumption

## Procedure

### 1. Alert the Team

\`\`\`
[EMERGENCY] Initiating shutdown - <reason>

In #ops-urgent immediately!
\`\`\`

### 2. Stop Traffic

\`\`\`bash
# Enable maintenance mode
kubectl scale deployment api-gateway --replicas=0 -n production
\`\`\`

### 3. Preserve Data

\`\`\`bash
# Create emergency backup
./scripts/emergency-backup.sh
\`\`\`

### 4. Document

Note the time, reason, and actions taken for post-incident review.
`,
		},
	],
	"product-docs": [
		{
			title: "Getting Started Guide",
			path: "intro/getting-started",
			status: "stable",
			source: "human",
			pinned: true,
			tags: ["getting-started", "tutorial", "quickstart"],
			markdown: `# Getting Started with Foundry

Welcome to Foundry! This guide will help you get up and running quickly.

## Quick Start

### 1. Create an Account

Visit [foundry.local/register](http://foundry.local/register) and sign up.

### 2. Create Your First Space

\`\`\`
Spaces → New Space → Enter name → Create
\`\`\`

### 3. Add Your First Page

\`\`\`
Space → Pages → New Page → Add content → Save
\`\`\`

## Key Concepts

| Concept | Description |
|---------|-------------|
| Space | Container for related pages |
| Page | Individual document |
| Runbook | Procedure documentation |
| Project | Documentation project |

## Next Steps

- [ ] Invite team members
- [ ] Import existing docs
- [ ] Set up integrations

Need help? Contact support@foundry.local
`,
		},
		{
			title: "API Authentication",
			path: "api/authentication",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["api", "authentication", "security"],
			markdown: `# API Authentication

## Overview

Foundry provides a REST API for programmatic access. All requests require authentication.

## Getting API Keys

1. Go to Settings → API Tokens
2. Click "Generate New Token"
3. Copy and store securely

## Making Requests

### Authentication Header

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://api.foundry.local/v1/pages
\`\`\`

### Token Scopes

| Scope | Description |
|-------|-------------|
| read:spaces | List and read spaces |
| read:pages | List and read pages |
| write:drafts | Create and edit drafts |
| search | Search content |
| admin | Full access |

## Rate Limits

- **Standard**: 100 requests/minute
- **Premium**: 1000 requests/minute

## Error Handling

\`\`\`json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
\`\`\`
`,
		},
		{
			title: "Webhook Integration",
			path: "integrations/webhooks",
			status: "draft",
			source: "agent",
			pinned: false,
			tags: ["webhooks", "integrations", "automation"],
			markdown: `# Webhook Integration

> **Beta** - Feedback welcome!

## Supported Events

- \`page.created\`
- \`page.updated\`
- \`page.deleted\`
- \`space.created\`

## Configuration

### 1. Register Webhook

\`\`\`bash
curl -X POST https://api.foundry.local/v1/webhooks \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"url": "https://your-app.com/webhook", "events": ["page.created"]}'
\`\`\`

### 2. Verify Endpoint

We send a \`GET\` request with a \`challenge\` parameter. Return it to verify.

### 3. Receive Events

\`\`\`json
{
  "event": "page.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "title": "New Page"
  }
}
\`\`\`

## Security

- Verify \`X-Signature\` header
- Use HTTPS endpoints
- Respond within 5 seconds
`,
		},
		{
			title: "SDK Installation",
			path: "sdks/installation",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["sdk", "libraries", "development"],
			markdown: `# SDK Installation

## Official SDKs

### JavaScript / TypeScript

\`\`\`bash
npm install @foundry/sdk
\`\`\`

\`\`\`typescript
import { FoundryClient } from '@foundry/sdk';

const client = new FoundryClient({
  apiKey: process.env.FOUNDRY_API_KEY
});
\`\`\`

### Python

\`\`\`bash
pip install foundry-sdk
\`\`\`

\`\`\`python
from foundry import Client

client = Client(api_key=os.environ["FOUNDRY_API_KEY"])
\`\`\`

## Requirements

| SDK | Minimum Version |
|-----|-----------------|
| Node.js | 18+ |
| Python | 3.9+ |

## Troubleshooting

**Connection errors:**
- Verify API key is correct
- Check network connectivity
- Ensure IP is allowlisted
`,
		},
		{
			title: "Best Practices",
			path: "guides/best-practices",
			status: "draft",
			source: "human",
			pinned: false,
			tags: ["best-practices", "guidelines", "documentation"],
			markdown: `# Documentation Best Practices

## Writing Guidelines

### Structure

- Start with a clear title
- Add a brief description
- Use headings for sections
- Include examples

### Formatting

\`\`\`markdown
## Code blocks
Use triple backticks

### Lists
- Use bullet points
- For sequential steps

### Tables
For structured data
\`\`\`

## Content Tips

1. **Be concise** - Get to the point
2. **Use examples** - Show, don't just tell
3. **Keep updated** - Review quarterly
4. **Get feedback** - Ask users

## Page Metadata

Always include:
- Clear title
- Relevant tags
- Last updated date
`,
		},
	],
	"eng-wiki": [
		{
			title: "Architecture Overview",
			path: "architecture/system-overview",
			status: "stable",
			source: "human",
			pinned: true,
			tags: ["architecture", "system-design", "overview"],
			markdown: `# Architecture Overview

## System Design

Foundry follows a microservices architecture with the following components:

## Core Services

| Service | Responsibility | Technology |
|---------|----------------|------------|
| API | REST endpoints | Node.js/Express |
| Auth | Authentication | OAuth2/JWT |
| Storage | File management | S3 + PostgreSQL |
| Search | Full-text search | Elasticsearch |
| Queue | Async jobs | RabbitMQ |

## Data Flow

\`\`\`
Client → API → Queue → Workers → Storage
         ↓
      PostgreSQL (metadata)
\`\`\`

## Infrastructure

- **Cloud**: AWS
- **Container**: Kubernetes (EKS)
- **CDN**: CloudFront
- **Monitoring**: Datadog
`,
		},
		{
			title: "Development Setup",
			path: "onboarding/dev-setup",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["onboarding", "setup", "development"],
			markdown: `# Development Setup

## Prerequisites

- Node.js 20+
- Docker Desktop
- PostgreSQL 15+
- VS Code (recommended)

## Local Setup

### 1. Clone Repository

\`\`\`bash
git clone git@github.com:foundry/app.git
cd app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Start Services

\`\`\`bash
docker-compose up -d
npm run dev
\`\`\`

### 4. Verify Setup

Open http://localhost:3000 and log in with test credentials:

- Email: admin@foundry.local
- Password: admin123

## Common Issues

**Port conflicts**: Check \`.env\` for port configuration
**Database errors**: Run \`npm run db:migrate\`
`,
		},
		{
			title: "Code Review Guidelines",
			path: "process/code-review",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["code-review", "process", "guidelines"],
			markdown: `# Code Review Guidelines

## Expectations

- All PRs require at least 1 approval
- No self-merging to main
- Tests must pass

## Review Checklist

### Code Quality

- [ ] Follows style guide
- [ ] No console.log statements
- [ ] Error handling present
- [ ] Types properly defined

### Testing

- [ ] Unit tests added
- [ ] Integration tests pass
- [ ] Coverage maintained

### Documentation

- [ ] Comments for complex logic
- [ ] API docs updated
- [ ] README if needed

## Feedback Format

Use **specific**, **actionable** feedback:

\`\`\`
✅ Good: "Consider using \`async/await\` here for readability"

❌ Bad: "This could be better"
\`\`\`
`,
		},
		{
			title: "Testing Strategy",
			path: "quality/testing-strategy",
			status: "draft",
			source: "agent",
			pinned: false,
			tags: ["testing", "quality", "strategy"],
			markdown: `# Testing Strategy

> **Draft** - Being refined

## Test Pyramid

\`\`\`
       /\\
      /  \\  E2E (10%)
     /    \\
    /------\\
   /        \\  Integration (20%)
  /          \\
 /------------\\
/              \\ Unit (70%)
\`\`\`

## Running Tests

\`\`\`bash
# Unit tests
npm run test

# Integration
npm run test:integration

# E2E
npm run test:e2e
\`\`\`

## Coverage Requirements

- Minimum 80% code coverage
- 100% coverage on critical paths
`,
		},
		{
			title: "Release Process",
			path: "releases/process",
			status: "stable",
			source: "human",
			pinned: false,
			tags: ["releases", "deployment", "process"],
			markdown: `# Release Process

## Versioning

We use **Semantic Versioning**:

- \`MAJOR\`.\`MINOR\`.\`PATCH\`
- Example: 1.2.3

## Release Flow

### 1. Prepare Release

\`\`\`bash
npm version minor -m "Release v%s"
git push && git push --tags
\`\`\`

### 2. CI/CD Pipeline

1. Run all tests
2. Build Docker images
3. Deploy to staging
4. Run smoke tests
5. Deploy to production

### 3. Post-Release

- [ ] Update changelog
- [ ] Announce in #releases
- [ ] Monitor error rates

## Hotfixes

For critical bugs:

\`\`\`bash
git checkout -b hotfix/fix-description
# Fix and test
git merge main
npm version patch
\`\`\`
`,
		},
	],
};

// ============================================================================
// Helper Functions
// ============================================================================

function getRandomDateWithinDays(days: number): Date {
	const now = new Date();
	const pastDate = new Date(
		now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000,
	);
	return pastDate;
}

function generateId(): string {
	return randomUUID();
}

// ============================================================================
// Main Seeding Logic
// ============================================================================

async function cleanup() {
	console.log("🧹 Cleaning up existing data...");

	// Delete all pages first (due to foreign keys)
	await prisma.page.deleteMany({});

	// Delete all space members
	await prisma.spaceMember.deleteMany({});

	// Delete all spaces
	await prisma.space.deleteMany({});

	// Delete all users (except if you want to keep system users)
	await prisma.user.deleteMany({});

	// Clean up data directory
	try {
		await rm(DATA_DIR, { recursive: true, force: true });
	} catch {
		// Directory might not exist
	}

	console.log("✅ Cleanup complete\n");
}

async function seedUsers() {
	console.log("👥 Seeding users...");

	for (const userData of USERS) {
		const passwordHash = await hashPassword(userData.password);

		const user = await prisma.user.upsert({
			where: { email: userData.email },
			update: {
				name: userData.name,
				role: userData.role,
				passwordHash,
			},
			create: {
				email: userData.email,
				name: userData.name,
				role: userData.role,
				passwordHash,
			},
		});
		console.log(`   ✅ Created user: ${user.email} (${user.role})`);
	}

	console.log("");
}

async function seedSpaces() {
	console.log("📁 Seeding spaces...");

	const createdSpaces: { id: string; slug: string; kind: SpaceKind }[] = [];

	for (const spaceData of SPACES) {
		const space = await prisma.space.upsert({
			where: { slug: spaceData.slug },
			update: {
				name: spaceData.name,
				description: spaceData.description,
				icon: spaceData.icon,
				kind: spaceData.kind,
				rootFolder: spaceData.slug,
			},
			create: {
				name: spaceData.name,
				slug: spaceData.slug,
				description: spaceData.description,
				icon: spaceData.icon,
				kind: spaceData.kind,
				rootFolder: spaceData.slug,
			},
		});

		// Create space memberships for users
		const adminUser = await prisma.user.findUnique({
			where: { email: "admin@foundry.local" },
		});
		const editorUser = await prisma.user.findUnique({
			where: { email: "editor@foundry.local" },
		});
		const readerUser = await prisma.user.findUnique({
			where: { email: "reader@foundry.local" },
		});

		if (adminUser) {
			await prisma.spaceMember.upsert({
				where: {
					spaceId_userId: {
						userId: adminUser.id,
						spaceId: space.id,
					},
				},
				update: {},
				create: {
					userId: adminUser.id,
					spaceId: space.id,
					role: "admin",
				},
			});
		}

		if (editorUser && spaceData.kind === "runbooks") {
			await prisma.spaceMember.upsert({
				where: {
					spaceId_userId: {
						userId: editorUser.id,
						spaceId: space.id,
					},
				},
				update: {},
				create: {
					userId: editorUser.id,
					spaceId: space.id,
					role: "editor",
				},
			});
		}

		if (readerUser) {
			await prisma.spaceMember.upsert({
				where: {
					spaceId_userId: {
						userId: readerUser.id,
						spaceId: space.id,
					},
				},
				update: {},
				create: {
					userId: readerUser.id,
					spaceId: space.id,
					role: "reader",
				},
			});
		}

		createdSpaces.push({ id: space.id, slug: space.slug, kind: space.kind });
		console.log(`   ✅ Created space: ${space.name} (${space.kind})`);
	}

	console.log("");
	return createdSpaces;
}

async function seedPages(
	spaces: { id: string; slug: string; kind: SpaceKind }[],
) {
	console.log("📄 Seeding pages...");

	const adminUser = await prisma.user.findUnique({
		where: { email: "admin@foundry.local" },
	});
	if (!adminUser) {
		throw new Error("Admin user not found");
	}

	let totalPages = 0;

	for (const space of spaces) {
		const pagesData = PAGES_BY_SPACE[space.slug] ?? [];

		console.log(
			`   📂 Space: ${space.slug} (${String(pagesData.length)} pages)`,
		);

		for (const pageData of pagesData) {
			const pageId = generateId();
			const slug = slugifyValue(pageData.title);
			const createdAt = getRandomDateWithinDays(30);
			const updatedAt = getRandomDateWithinDays(7);

			// Create the page in database
			const page = await prisma.page.create({
				data: {
					id: pageId,
					title: pageData.title,
					slug,
					path: pageData.path,
					contentPath: `${space.slug}/${pageData.path}`,
					contentText: pageData.markdown.substring(0, 500), // Preview text
					status: pageData.status,
					source: pageData.source,
					pinned: pageData.pinned,
					tags: pageData.tags,
					spaceId: space.id,
					updatedById: adminUser.id,
					createdAt,
					updatedAt,
				},
			});

			// Determine storage kind based on space type
			const storageKind = space.kind === "runbooks" ? "runbooks" : "projects";

			// Create markdown file on disk
			const filePath = resolvePageFilePath(
				DATA_DIR,
				storageKind,
				space.slug,
				pageData.path,
			);

			const frontmatter = fileFrontmatterSchema.parse({
				id: pageId,
				title: pageData.title,
				slug,
				space: space.slug,
				path: pageData.path,
				status: pageData.status,
				tags: pageData.tags,
				updatedBy: adminUser.email,
				updatedAt: updatedAt.toISOString(),
				source: pageData.source,
				pinned: pageData.pinned,
			});

			await writeMarkdownFile(filePath, frontmatter, pageData.markdown);

			totalPages++;
			console.log(
				`      ✅ ${page.title} [${page.status}]${page.pinned ? " 📌" : ""}`,
			);
		}
	}

	console.log(`\n   Total pages created: ${String(totalPages)}`);
	console.log("");
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
	// Prevent seeding in production
	if (process.env.NODE_ENV === "production") {
		console.error("❌ Cannot seed in production environment!");
		process.exit(1);
	}

	console.log("🌱 Starting database seed...\n");

	try {
		// Cleanup existing data
		await cleanup();

		// Seed users
		await seedUsers();

		// Seed spaces
		const spaces = await seedSpaces();

		// Seed pages
		await seedPages(spaces);

		console.log("🎉 Seed completed successfully!");
		console.log("\n📝 Test credentials:");
		console.log("   Admin:   admin@foundry.local / admin123");
		console.log("   Editor:  editor@foundry.local / editor123");
		console.log("   Reader:  reader@foundry.local / reader123");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		process.exit(1);
	}
}

main()
	.catch((error: unknown) => {
		console.error("Unhandled error:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
