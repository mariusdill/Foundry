import { z } from "zod";

export const pageStatusSchema = z.enum(["draft", "stable", "archived"]);
export type PageStatus = z.infer<typeof pageStatusSchema>;

export const pageSourceSchema = z.enum(["human", "agent"]);
export type PageSource = z.infer<typeof pageSourceSchema>;

export const userRoleSchema = z.enum(["admin", "editor", "reader"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const tokenScopeSchema = z.enum([
  "read:spaces",
  "read:pages",
  "search",
  "write:drafts",
  "write:attachments",
  "admin",
]);
export type TokenScope = z.infer<typeof tokenScopeSchema>;

export const fileFrontmatterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  space: z.string().min(1),
  path: z.string().min(1),
  status: pageStatusSchema,
  tags: z.array(z.string()).default([]),
  updatedBy: z.string().min(1),
  updatedAt: z.string().min(1),
  source: pageSourceSchema,
  pinned: z.boolean().default(false),
});
export type FileFrontmatter = z.infer<typeof fileFrontmatterSchema>;

export const createSpaceSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(280).optional(),
  kind: z.enum(["runbooks", "projects"]).default("projects"),
  icon: z.string().max(48).default("FolderGit2"),
});
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;

export const createPageSchema = z.object({
  spaceId: z.string().uuid(),
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  path: z.string().min(1).max(255),
  markdown: z.string().default(""),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  status: pageStatusSchema.default("draft"),
  source: pageSourceSchema.default("human"),
  draftOfPageId: z.string().uuid().optional(),
});
export type CreatePageInput = z.infer<typeof createPageSchema>;

export const updatePageSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  markdown: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  status: pageStatusSchema.optional(),
});
export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const searchFiltersSchema = z.object({
  q: z.string().default(""),
  space: z.string().optional(),
  status: pageStatusSchema.optional(),
  source: pageSourceSchema.optional(),
  tag: z.string().optional(),
  pinned: z.coerce.boolean().optional(),
  sort: z.enum(["relevance", "updatedAt"]).default("relevance"),
});
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const createTokenSchema = z.object({
  name: z.string().min(1).max(80),
  scopes: z.array(tokenScopeSchema).min(1),
  allowedSpaceIds: z.array(z.string().uuid()).default([]),
  allowedPathPrefixes: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});
export type CreateTokenInput = z.infer<typeof createTokenSchema>;

export const promoteDraftSchema = z.object({
  targetPageId: z.string().uuid().optional(),
});
export type PromoteDraftInput = z.infer<typeof promoteDraftSchema>;

export const revertPageSchema = z.object({
  versionId: z.string().uuid(),
});
export type RevertPageInput = z.infer<typeof revertPageSchema>;

export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeLogicalPath(value: string): string {
  return value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\.{2,}/g, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .trim();
}

export function extractTextPreview(markdown: string): string {
  return markdown
    .replace(/^```[\s\S]*?```$/gm, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[>#_*~-]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleFromPath(path: string): string {
  return path
    .split("/")
    .pop()
    ?.replace(/\.md$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "Untitled";
}
