"use client";

import { ArrowLeft, Edit2, Eye, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { TiptapEditor } from "@/components/tiptap-editor";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PageData = {
	id: string;
	title: string;
	tags: string[];
	space: { id: string; name: string; slug: string };
	markdown: string;
};

export function EditPageClient({ id }: { id: string }) {
	const router = useRouter();
	const [page, setPage] = useState<PageData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Form state
	const [title, setTitle] = useState("");
	const [markdown, setMarkdown] = useState("");
	const [tagsInput, setTagsInput] = useState("");
	const [isDirty, setIsDirty] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchPage() {
			try {
				const res = await fetch(`/api/pages/${id}`);
				if (!res.ok) {
					throw new Error("Failed to fetch page");
				}
				const data = await res.json();
				setPage(data);
				setTitle(data.title || "");
				setMarkdown(data.markdown || "");
				setTagsInput((data.tags || []).join(", "));
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		}

		fetchPage();
	}, [id]);

	// Track dirty state
	useEffect(() => {
		if (!page) return;

		const currentTags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		const originalTags = page.tags || [];

		const tagsChanged =
			currentTags.length !== originalTags.length ||
			!currentTags.every((t) => originalTags.includes(t));

		const hasChanges =
			title !== page.title || markdown !== page.markdown || tagsChanged;

		setIsDirty(hasChanges);

		if (title.trim()) {
			setValidationError(null);
		}
	}, [title, markdown, tagsInput, page]);

	const handleSave = async () => {
		if (!title.trim()) {
			setValidationError("Title is required");
			return;
		}

		setSaving(true);
		setValidationError(null);

		const tags = tagsInput
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		try {
			const res = await fetch(`/api/pages/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, markdown, tags }),
			});

			if (!res.ok) {
				throw new Error("Failed to save page");
			}

			router.push(`/pages/${id}`);
			router.refresh();
		} catch (err) {
			setValidationError(err instanceof Error ? err.message : "Failed to save");
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (isDirty) {
			if (
				!window.confirm(
					"You have unsaved changes. Are you sure you want to leave?",
				)
			) {
				return;
			}
		}
		router.push(`/pages/${id}`);
	};

	if (loading) {
		return (
			<div className="container mx-auto max-w-5xl py-8 space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-4 w-64" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
				<Skeleton className="h-[400px] w-full" />
			</div>
		);
	}

	if (error || !page) {
		return (
			<div className="container mx-auto max-w-5xl py-8">
				<div className="bg-destructive/10 text-destructive p-4 rounded-md">
					{error || "Page not found"}
				</div>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.push(`/pages/${id}`)}
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Page
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-5xl py-8 flex flex-col gap-6">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={`/spaces/${page.space.id}`}>
										{page.space.name}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={`/pages/${id}`}>{page.title}</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Edit</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<h1 className="text-2xl font-bold tracking-tight">Edit Page</h1>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" onClick={handleCancel} disabled={saving}>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!isDirty || saving}>
						{saving ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			{validationError && (
				<div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
					{validationError}
				</div>
			)}

			{/* Form Section */}
			<div className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Page title"
							className="text-lg font-medium"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="tags">Tags (comma separated)</Label>
						<Input
							id="tags"
							value={tagsInput}
							onChange={(e) => setTagsInput(e.target.value)}
							placeholder="e.g. documentation, guide, api"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label>Content</Label>
					<Tabs
						defaultValue="edit"
						className="w-full border rounded-md overflow-hidden"
					>
						<div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
							<TabsList className="h-9">
								<TabsTrigger value="edit" className="text-xs">
									<Edit2 className="h-3.5 w-3.5 mr-1.5" />
									Edit
								</TabsTrigger>
								<TabsTrigger value="preview" className="text-xs">
									<Eye className="h-3.5 w-3.5 mr-1.5" />
									Preview
								</TabsTrigger>
							</TabsList>

							{isDirty && (
								<span className="text-xs text-muted-foreground italic">
									Unsaved changes
								</span>
							)}
						</div>

						<TabsContent value="edit" className="m-0 border-0">
							<TiptapEditor
								content={markdown}
								onChange={setMarkdown}
								placeholder="Start writing your page content..."
							/>
						</TabsContent>

						<TabsContent
							value="preview"
							className="m-0 border-0 p-6 min-h-[400px] bg-background"
						>
							{markdown ? (
								<MarkdownPreview content={markdown} />
							) : (
								<div className="text-center text-muted-foreground py-12 italic">
									Nothing to preview
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
