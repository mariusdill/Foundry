import Link from "next/link";
import type { ReactNode } from "react";

// Regex to match [[Page Title]] syntax
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Extract page titles from wiki link syntax [[Page Title]]
 */
export function extractWikiLinks(content: string): string[] {
	const matches = content.matchAll(WIKI_LINK_REGEX);
	const links: string[] = [];
	for (const match of matches) {
		const title = match[1];
		if (title) {
			links.push(title.trim());
		}
	}
	return [...new Set(links)]; // Remove duplicates
}

/**
 * Replace wiki links with Next.js Link components
 * Returns an array of strings and Link elements
 */
export function renderWikiLinks(
	content: string,
	getPageIdByTitle: (title: string) => string | undefined,
): ReactNode[] {
	const parts: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	// Reset regex
	WIKI_LINK_REGEX.lastIndex = 0;

	while ((match = WIKI_LINK_REGEX.exec(content)) !== null) {
		const fullMatch = match[0];
		const title = match[1];
		const matchIndex = match.index;

		if (!title) continue;

		// Add text before the match
		if (matchIndex > lastIndex) {
			parts.push(content.slice(lastIndex, matchIndex));
		}

		const trimmedTitle = title.trim();
		const pageId = getPageIdByTitle(trimmedTitle);

		if (pageId) {
			parts.push(
				<Link
					key={`${matchIndex}-${trimmedTitle}`}
					href={`/pages/${pageId}`}
					className="text-primary hover:underline"
				>
					{trimmedTitle}
				</Link>,
			);
		} else {
			// Page not found, render as plain text with styling
			parts.push(
				<span
					key={`${matchIndex}-${trimmedTitle}`}
					className="text-muted-foreground border-b border-dashed border-muted-foreground"
					title="Page not found"
				>
					{trimmedTitle}
				</span>,
			);
		}

		lastIndex = matchIndex + fullMatch.length;
	}

	// Add remaining text
	if (lastIndex < content.length) {
		parts.push(content.slice(lastIndex));
	}

	return parts;
}

/**
 * Pre-process markdown content to replace wiki links with markdown links
 * This is useful for ReactMarkdown which expects standard markdown
 */
export function preprocessWikiLinks(
	content: string,
	getPageIdByTitle: (title: string) => string | undefined,
): string {
	return content.replace(WIKI_LINK_REGEX, (match, title) => {
		if (!title) return match;
		const trimmedTitle = title.trim();
		const pageId = getPageIdByTitle(trimmedTitle);
		if (pageId) {
			return `[${trimmedTitle}](/pages/${pageId})`;
		}
		// Return original if page not found
		return match;
	});
}
