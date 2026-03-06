import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Import highlight.js styles for dark mode
import "highlight.js/styles/github-dark.css";

interface MarkdownPreviewProps {
	content: string;
	className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
	return (
		<div
			className={cn(
				"prose prose-invert max-w-none",
				"prose-headings:font-semibold prose-headings:tracking-tight",
				"prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl",
				"prose-p:leading-relaxed",
				"prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
				"prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-surface-2 prose-code:text-primary prose-code:before:content-none prose-code:after:content-none",
				"prose-pre:bg-surface-2 prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-lg",
				"prose-blockquote:border-l-primary prose-blockquote:bg-surface-2/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic",
				"prose-img:rounded-lg prose-img:border prose-img:border-border",
				"prose-hr:border-border",
				"prose-th:border-border prose-td:border-border",
				"prose-ul:list-disc prose-ol:list-decimal",
				"prose-li:marker:text-muted-foreground",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeHighlight]}
				components={{
					// Custom renderers can be added here if needed
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					a: ({ node, ...props }) => (
						<a target="_blank" rel="noopener noreferrer" {...props} />
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
