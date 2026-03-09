import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	CheckSquare,
	Code,
	Heading1,
	Heading2,
	Heading3,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Minus,
	Quote,
	RemoveFormatting,
	SquareCode,
	Strikethrough,
	Unlink,
} from "lucide-react";
import { useCallback } from "react";
import { Markdown } from "tiptap-markdown";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
	const setLink = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("URL", previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		// update link
		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	}, [editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/50 rounded-t-md">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("bold") && "bg-muted text-foreground",
				)}
				title="Bold"
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("italic") && "bg-muted text-foreground",
				)}
				title="Italic"
			>
				<Italic className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("strike") && "bg-muted text-foreground",
				)}
				title="Strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleCode().run()}
				disabled={!editor.can().chain().focus().toggleCode().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("code") && "bg-muted text-foreground",
				)}
				title="Inline Code"
			>
				<Code className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() =>
					editor.chain().focus().clearNodes().unsetAllMarks().run()
				}
				className="h-8 w-8"
				title="Clear Formatting"
			>
				<RemoveFormatting className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-6" />

			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("heading", { level: 1 }) &&
						"bg-muted text-foreground",
				)}
				title="Heading 1"
			>
				<Heading1 className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("heading", { level: 2 }) &&
						"bg-muted text-foreground",
				)}
				title="Heading 2"
			>
				<Heading2 className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("heading", { level: 3 }) &&
						"bg-muted text-foreground",
				)}
				title="Heading 3"
			>
				<Heading3 className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-6" />

			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("bulletList") && "bg-muted text-foreground",
				)}
				title="Bullet List"
			>
				<List className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("orderedList") && "bg-muted text-foreground",
				)}
				title="Ordered List"
			>
				<ListOrdered className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleTaskList().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("taskList") && "bg-muted text-foreground",
				)}
				title="Task List"
			>
				<CheckSquare className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-6" />

			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("codeBlock") && "bg-muted text-foreground",
				)}
				title="Code Block"
			>
				<SquareCode className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={cn(
					"h-8 w-8",
					editor.isActive("blockquote") && "bg-muted text-foreground",
				)}
				title="Blockquote"
			>
				<Quote className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className="h-8 w-8"
				title="Horizontal Rule"
			>
				<Minus className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="mx-1 h-6" />

			<Button
				variant="ghost"
				size="icon"
				onClick={setLink}
				className={cn(
					"h-8 w-8",
					editor.isActive("link") && "bg-muted text-foreground",
				)}
				title="Add Link"
			>
				<LinkIcon className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => editor.chain().focus().unsetLink().run()}
				disabled={!editor.isActive("link")}
				className="h-8 w-8"
				title="Remove Link"
			>
				<Unlink className="h-4 w-4" />
			</Button>
		</div>
	);
};

export function TiptapEditor({
	content,
	onChange,
	placeholder = "Start writing...",
}: TiptapEditorProps) {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Placeholder.configure({
				placeholder,
				emptyEditorClass: "is-editor-empty",
			}),
			Link.configure({
				openOnClick: false,
				autolink: true,
			}),
			TaskList.configure({
				HTMLAttributes: {
					class: "not-prose",
				},
			}),
			TaskItem.configure({
				nested: true,
			}),
			Markdown,
		],
		content,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4",
			},
		},
		onUpdate: ({ editor }) => {
			// Export as markdown
			const markdown = (
				editor.storage as unknown as { markdown: { getMarkdown: () => string } }
			).markdown.getMarkdown();
			onChange(markdown);
		},
	});

	return (
		<div className="border rounded-md flex flex-col bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
			<MenuBar editor={editor} />
			<div className="flex-1 overflow-y-auto">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
