import {
  ArrowUpRight,
  BrainCircuit,
  Clock3,
  FileText,
  FolderKanban,
  ScanSearch,
  ShieldEllipsis,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    label: "Stable pages",
    value: "218",
    detail: "+12 this week",
    icon: FileText,
    accent: "var(--success)",
  },
  {
    label: "Drafts awaiting review",
    value: "14",
    detail: "7 agent-authored",
    icon: Sparkles,
    accent: "var(--warning)",
  },
  {
    label: "Search coverage",
    value: "99.2%",
    detail: "Title, content, tags, paths",
    icon: ScanSearch,
    accent: "var(--info)",
  },
  {
    label: "Scoped tokens",
    value: "8",
    detail: "2 expire this month",
    icon: ShieldEllipsis,
    accent: "var(--accent-agent)",
  },
];

const reviewQueue = [
  {
    title: "Incident playbook refresh",
    path: "runbooks/operations/incident-playbook",
    updatedAt: "8 minutes ago",
    updatedBy: "ops-agent-02",
    source: "agent",
  },
  {
    title: "MCP onboarding guidance",
    path: "projects/platform/mcp-onboarding",
    updatedAt: "21 minutes ago",
    updatedBy: "Dillmar",
    source: "human",
  },
  {
    title: "Search ranking notes",
    path: "projects/product/search-ranking-notes",
    updatedAt: "52 minutes ago",
    updatedBy: "research-agent",
    source: "agent",
  },
];

const searchHighlights = [
  {
    title: "Postgres FTS relevance tuning",
    excerpt: "Weighted title hits and path-prefix filters keep search fast without drifting into vector features.",
    space: "Platform",
  },
  {
    title: "Draft promotion checklist",
    excerpt: "Stable content stays human-owned. Promotions create a new version snapshot and a linked audit event.",
    space: "Knowledge",
  },
];

const activityFeed = [
  {
    title: "ops-agent-02 appended notes to incident draft",
    detail: "write:drafts token used within runbooks/operations",
    when: "10:18",
  },
  {
    title: "Search index refreshed for platform space",
    detail: "218 pages updated with weighted text vectors",
    when: "09:54",
  },
  {
    title: "API token rotated for Cursor MCP client",
    detail: "Old token revoked and audit trail preserved",
    when: "09:21",
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="gap-5 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Flagship surface / search</p>
                <CardTitle className="mt-2 text-[1.8rem] leading-tight tracking-[-0.04em] sm:text-[2.2rem]">Find the right page before the browser tab pile-up starts.</CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">
                  Search is meant to feel central, not bolted on. Results stay compact, filterable, and fast enough to trust when an agent or human needs context immediately.
                </CardDescription>
              </div>
              <Button className="rounded-2xl px-5">Open search</Button>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-[color:var(--border-subtle)] bg-[linear-gradient(180deg,rgba(10,17,27,0.92),rgba(13,19,29,0.94))] p-4 sm:grid-cols-2">
              {searchHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.8)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</p>
                    <ArrowUpRight className="size-4 text-[color:var(--text-muted)]" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.excerpt}</p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{item.space}</p>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Workspace pulse</p>
            <CardTitle className="text-[1.5rem] tracking-[-0.03em]">Review console</CardTitle>
            <CardDescription>Draft-first workflows stay visible, attributable, and easy to clear.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQueue.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.76)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.path}</p>
                  </div>
                  <Badge variant={item.source === "agent" ? "agent" : "human"}>{item.source}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[color:var(--text-secondary)]">
                  <span>{item.updatedBy}</span>
                  <span>{item.updatedAt}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[color:var(--text-secondary)]">{item.label}</p>
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.82)]">
                    <Icon className="size-4" style={{ color: item.accent }} />
                  </div>
                </div>
                <CardTitle className="text-[2rem] tracking-[-0.05em]">{item.value}</CardTitle>
                <CardDescription>{item.detail}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Recent activity</p>
            <CardTitle className="text-[1.5rem] tracking-[-0.03em]">What changed in the workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((item) => (
              <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.7)] px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-[color:var(--text-primary)]">{item.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{item.detail}</p>
                </div>
                <p className="shrink-0 font-mono text-xs text-[color:var(--text-muted)]">{item.when}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Foundations</p>
            <CardTitle className="text-[1.5rem] tracking-[-0.03em]">Phase 1 surfaces</CardTitle>
            <CardDescription>The MVP starts with tokens, shell, markdown storage, and the database spine because everything else builds on them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Design tokens", value: "Dark-first CSS variables with premium surfaces" },
              { label: "App shell", value: "Sidebar, top bar, dashboard shell, keyboard-friendly framing" },
              { label: "Prisma schema", value: "Users, spaces, pages, versions, audit events, tokens" },
              { label: "Markdown boundary", value: "Files on disk with frontmatter as content source of truth" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.78)] p-4">
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.label}</p>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{item.value}</p>
              </div>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="secondary" className="rounded-2xl">
                <FolderKanban className="size-4" />
                Browse spaces
              </Button>
              <Button variant="ghost" className="rounded-2xl">
                <BrainCircuit className="size-4" />
                Review drafts
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Current focus</p>
                <CardTitle className="mt-2 text-[1.45rem] tracking-[-0.03em]">Draft review remains the core workflow.</CardTitle>
              </div>
              <Badge variant="draft">14 queued</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Search before writing",
                detail: "Agents and humans start with workspace search to avoid duplicate work.",
              },
              {
                title: "Drafts as default write target",
                detail: "Stable pages remain human-owned unless a deliberate promotion happens.",
              },
              {
                title: "Audit every mutation",
                detail: "Tokens, MCP writes, and human edits all leave a visible attribution trail.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.78)] p-4">
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Velocity</p>
            <CardTitle className="text-[1.45rem] tracking-[-0.03em]">Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Clock3, label: "Average review lag", value: "19m" },
              { icon: Sparkles, label: "Agent-created drafts", value: "7" },
              { icon: BrainCircuit, label: "Knowledge lookups", value: "126" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(18,27,40,0.78)] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border border-[color:var(--border-subtle)] bg-[color:rgba(10,15,24,0.86)]">
                      <Icon className="size-4 text-[color:var(--text-secondary)]" />
                    </div>
                    <span className="text-sm text-[color:var(--text-secondary)]">{item.label}</span>
                  </div>
                  <span className="font-mono text-sm text-[color:var(--text-primary)]">{item.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
