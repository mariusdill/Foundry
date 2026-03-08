"use client";

import { slugifyValue } from "@foundry/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Schema for the form (spaceId is passed separately)
const createPageFormSchema = z.object({
	title: z.string().min(1).max(160),
	slug: z.string().min(1).max(160),
	path: z.string().min(1).max(255),
});

type FormValues = z.infer<typeof createPageFormSchema>;

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

	const form = useForm<FormValues>({
		resolver: zodResolver(createPageFormSchema),
		defaultValues: {
			title: "",
			slug: "",
			path: "",
		},
	});

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const title = e.target.value;
		form.setValue("title", title);

		// Only auto-generate slug and path if the user hasn't manually edited them
		// or if they're currently empty
		if (!form.formState.dirtyFields.slug || form.getValues("slug") === "") {
			const slug = slugifyValue(title);
			form.setValue("slug", slug, { shouldValidate: true });
		}

		if (!form.formState.dirtyFields.path || form.getValues("path") === "") {
			const slug = slugifyValue(title);
			form.setValue("path", slug ? `/${slug}` : "", { shouldValidate: true });
		}
	};

	async function onSubmit(data: FormValues) {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/spaces/${spaceId}/pages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...data,
					spaceId,
					markdown: "",
					tags: [],
					pinned: false,
					status: "draft",
					source: "human",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (errorData.error === "Page with this path already exists") {
					form.setError("path", { message: errorData.error });
				} else if (errorData.error === "Page with this slug already exists") {
					form.setError("slug", { message: errorData.error });
				} else {
					throw new Error(errorData.error || "Failed to create page");
				}
				return;
			}

			const page = await response.json();
			onOpenChange(false);
			form.reset();
			router.push(`/pages/${page.id}`);
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Page</DialogTitle>
					<DialogDescription>
						Add a new page to this space. The path determines where it lives in
						the tree.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md mb-4">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. Getting Started"
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleTitleChange(e);
											}}
											autoFocus
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Slug</FormLabel>
									<FormControl>
										<Input placeholder="e.g. getting-started" {...field} />
									</FormControl>
									<FormDescription>
										Used in URLs. Auto-generated from title.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="path"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Path</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g. /docs/getting-started"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Use slashes to create folders (e.g.
										/engineering/frontend/setup)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Create Page
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
