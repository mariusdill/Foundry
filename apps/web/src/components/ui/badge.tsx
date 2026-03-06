import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"border-transparent bg-surface-2 text-secondary-foreground [a&]:hover:bg-surface-3",
				destructive:
					"border-transparent bg-destructive/15 text-destructive [a&]:hover:bg-destructive/25",
				outline: "border-border text-foreground [a&]:hover:bg-surface-2",
				ghost:
					"border-transparent text-muted-foreground [a&]:hover:text-foreground",
				draft:
					"border-transparent bg-amber-500/15 text-amber-400 [a&]:hover:bg-amber-500/25",
				stable:
					"border-transparent bg-emerald-500/15 text-emerald-400 [a&]:hover:bg-emerald-500/25",
				archived:
					"border-transparent bg-red-500/15 text-red-400 [a&]:hover:bg-red-500/25",
				human:
					"border-transparent bg-indigo-500/15 text-indigo-400 [a&]:hover:bg-indigo-500/25",
				agent:
					"border-transparent bg-violet-500/15 text-violet-400 [a&]:hover:bg-violet-500/25",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant = "default",
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
