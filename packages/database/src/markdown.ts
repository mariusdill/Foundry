import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import matter from "gray-matter";

import {
  type FileFrontmatter,
  fileFrontmatterSchema,
  normalizeLogicalPath,
} from "@foundry/shared";

type StorageKind = "drafts" | "attachments" | "runbooks" | "projects";

function storageRoot(dataDir: string, kind: StorageKind): string {
  switch (kind) {
    case "drafts":
      return join(dataDir, "drafts");
    case "attachments":
      return join(dataDir, "attachments");
    case "runbooks":
      return join(dataDir, "runbooks");
    case "projects":
      return join(dataDir, "projects");
  }
}

export function resolvePageFilePath(dataDir: string, kind: StorageKind, spaceSlug: string, logicalPath: string): string {
  return join(storageRoot(dataDir, kind), spaceSlug, `${normalizeLogicalPath(logicalPath)}.md`);
}

export async function writeMarkdownFile(filePath: string, frontmatter: FileFrontmatter, markdown: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const payload = matter.stringify(markdown, frontmatter);
  await writeFile(filePath, payload, "utf8");
}

export async function readMarkdownFile(filePath: string): Promise<{ frontmatter: FileFrontmatter; markdown: string }> {
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);
  return {
    frontmatter: fileFrontmatterSchema.parse(parsed.data),
    markdown: parsed.content,
  };
}

export async function moveMarkdownFile(sourcePath: string, targetPath: string): Promise<void> {
  await mkdir(dirname(targetPath), { recursive: true });
  await rename(sourcePath, targetPath);
}
