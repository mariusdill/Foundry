import {
  ActivitySquare,
  BookMarked,
  FolderKanban,
  History,
  LayoutDashboard,
  Search,
  Settings2,
  ShieldEllipsis,
  Sparkles,
} from "lucide-react";

export const primaryNavigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, count: null },
  { href: "/search", label: "Search", icon: Search, count: "Cmd K" },
  { href: "/drafts", label: "Drafts", icon: Sparkles, count: 14 },
  { href: "/spaces", label: "Spaces", icon: FolderKanban, count: 6 },
];

export const knowledgeNavigation = [
  { href: "/spaces/runbooks", label: "Runbooks", icon: BookMarked, hint: "Operational truth" },
  { href: "/spaces/projects", label: "Projects", icon: FolderKanban, hint: "Execution notes" },
  { href: "/audit", label: "Audit log", icon: History, hint: "Every write is attributable" },
  { href: "/settings/tokens", label: "Token settings", icon: ShieldEllipsis, hint: "Scoped access" },
  { href: "/settings/profile", label: "Profile", icon: Settings2, hint: "Workspace defaults" },
  { href: "/activity", label: "Recent agent activity", icon: ActivitySquare, hint: "Draft-first writes" },
];

export const sidebarSpaceGroups = [
  {
    title: "Recents",
    items: [
      { label: "Incident response handbook", meta: "runbooks/operations" },
      { label: "Launch review notes", meta: "projects/marketing" },
      { label: "API token hardening", meta: "projects/platform" },
    ],
  },
  {
    title: "Pinned",
    items: [
      { label: "Search tuning checklist", meta: "runbooks/platform" },
      { label: "Draft promotion policy", meta: "runbooks/knowledge" },
      { label: "Quarterly roadmap", meta: "projects/product" },
    ],
  },
];
