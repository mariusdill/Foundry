"use client";

import {
	createSpaceSchema,
	slugifyValue,
} from "@foundry/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { z } from "zod";

type FormValues = z.input<typeof createSpaceSchema>;

interface CreateSpaceDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSpaceDialog({ open: controlledOpen, onOpenChange: setControlledOpen, onSuccess }: CreateSpaceDialogProps = {}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
	const setOpen = setControlledOpen || setUncontrolledOpen;
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const form = useForm<FormValues>({
		resolver: zodResolver(createSpaceSchema),
		defaultValues: {
			name: "",
			slug: "",
			description: "",
			kind: "projects",
			icon: "FolderGit2",
		},
	});

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		form.setValue("name", name);

		// Only auto-generate slug if the user hasn't manually edited it
		// or if it's currently empty
		if (!form.formState.dirtyFields.slug || form.getValues("slug") === "") {
			form.setValue("slug", slugifyValue(name), { shouldValidate: true });
		}
	};

	async function onSubmit(data: FormValues) {
		setIsLoading(true);
		try {
			const response = await fetch("/api/spaces", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				if (error.error === "Space with this slug already exists") {
					form.setError("slug", { message: error.error });
					return;
				}
				throw new Error(error.error || "Failed to create space");
			}

			setOpen(false);
			form.reset();
			if (onSuccess) {
				onSuccess();
			} else {
				router.refresh();
			}
		} catch (error) {
			console.error("Failed to create space:", error);
			// You could add a toast notification here
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Create Space
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Space</DialogTitle>
					<DialogDescription>
						Create a new space to organize your pages and runbooks.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Engineering"
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleNameChange(e);
											}}
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
										<Input placeholder="engineering" {...field} />
									</FormControl>
									<FormDescription>
										Used in URLs. Must be unique and contain only lowercase
										letters, numbers, and hyphens.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="kind"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Kind</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a kind" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="projects">Projects</SelectItem>
											<SelectItem value="runbooks">Runbooks</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Documentation and runbooks for the engineering team."
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Create Space
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
