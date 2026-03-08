"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePageDialogProps {
	spaceId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreatePageDialog({
	spaceId,
	open,
	onOpenChange,
}: CreatePageDialogProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		path: "",
	});

	// Auto-generate slug and path from title if they are empty or were auto-generated
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value;
		setFormData((prev) => {
			const prevSlug = prev.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)+/g, "");
			const newSlug = newTitle
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)+/g, "");

			const updates: typeof prev = { ...prev, title: newTitle };

			if (prev.slug === "" || prev.slug === prevSlug) {
				updates.slug = newSlug;
			}

			if (prev.path === "" || prev.path === `/${prevSlug}`) {
				updates.path = newSlug ? `/${newSlug}` : "";
			}

			return updates;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/spaces/${spaceId}/pages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: formData.title,
					slug: formData.slug,
					path: formData.path,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to create page");
			}

			const page = await response.json();
			onOpenChange(false);
			router.push(`/pages/${page.id}`);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Page</DialogTitle>
						<DialogDescription>
							Add a new page to this space. The path determines where it lives
							in the tree.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						{error && (
							<div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
								{error}
							</div>
						)}

						<div className="grid gap-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								placeholder="e.g. Getting Started"
								value={formData.title}
								onChange={handleTitleChange}
								required
								autoFocus
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								placeholder="e.g. getting-started"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="path">Path</Label>
							<Input
								id="path"
								placeholder="e.g. /docs/getting-started"
								value={formData.path}
								onChange={(e) =>
									setFormData({ ...formData, path: e.target.value })
								}
								required
							/>
							<p className="text-xs text-muted-foreground">
								Use slashes to create folders (e.g. /engineering/frontend/setup)
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isLoading || !formData.title || !formData.slug || !formData.path
							}
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Page
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
