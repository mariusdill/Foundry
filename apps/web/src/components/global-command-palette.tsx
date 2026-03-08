"use client";

import { Command as CommandIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";
import { commandNavigation } from "@/lib/navigation";

const OPEN_COMMAND_PALETTE_EVENT = "foundry:open-command-palette";

function isEditableElement(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	if (target.isContentEditable) {
		return true;
	}

	const tag = target.tagName.toLowerCase();
	if (tag === "input" || tag === "textarea" || tag === "select") {
		return true;
	}

	return target.getAttribute("role") === "textbox";
}

export function GlobalCommandPalette({
	showTrigger = true,
}: {
	showTrigger?: boolean;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const items = useMemo(() => commandNavigation, []);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				!(event.metaKey || event.ctrlKey) ||
				event.key.toLowerCase() !== "k"
			) {
				return;
			}

			if (pathname === "/search") {
				return;
			}

			if (isEditableElement(event.target)) {
				return;
			}

			event.preventDefault();
			setOpen((previousOpen) => !previousOpen);
		};

		const onOpenPalette = () => setOpen(true);

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenPalette);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onOpenPalette);
		};
	}, [pathname]);

	const handleSelect = (href: string) => {
		setOpen(false);
		router.push(href);
	};

	return (
		<>
			{showTrigger ? (
				<Button
					type="button"
					variant="ghost"
					onClick={() => setOpen(true)}
					className="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-[13px] text-muted-foreground transition-colors hover:border-[color:var(--border-strong)] hover:bg-surface-2 hover:text-foreground"
				>
					<CommandIcon className="size-3.5" />
					<span className="flex-1 text-left">Search and commands...</span>
					<span className="text-[11px] text-[color:var(--text-muted)]">
						Cmd K
					</span>
				</Button>
			) : null}

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search routes and jump quickly..." />
				<CommandList>
					<CommandEmpty>No matches found.</CommandEmpty>
					<CommandGroup heading="Quick Navigation">
						{items.map((item) => {
							const Icon = item.icon;

							return (
								<CommandItem
									key={item.href}
									onSelect={() => handleSelect(item.href)}
								>
									<Icon className="size-4" />
									<span>{item.label}</span>
									{item.shortcut ? (
										<CommandShortcut>{item.shortcut}</CommandShortcut>
									) : null}
								</CommandItem>
							);
						})}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}

export { OPEN_COMMAND_PALETTE_EVENT };
