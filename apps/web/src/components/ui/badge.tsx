import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 [&>svg]:pointer-events-none [&>svg]:size-3",
	{
		variants: {
			variant: {
				default: "bg-primary/10 text-primary [a&]:hover:bg-primary/14",
				secondary:
					"bg-secondary text-secondary-foreground [a&]:hover:bg-surface-3",
				destructive:
					"bg-destructive/12 text-destructive [a&]:hover:bg-destructive/18",
				outline:
					"border-border bg-transparent text-foreground [a&]:hover:bg-surface-2",
				ghost:
					"border-transparent text-muted-foreground [a&]:hover:text-foreground",
				draft: "bg-amber-500/12 text-amber-300 [a&]:hover:bg-amber-500/18",
				stable:
					"bg-emerald-500/12 text-emerald-300 [a&]:hover:bg-emerald-500/18",
				archived: "bg-red-500/12 text-red-300 [a&]:hover:bg-red-500/18",
				human: "bg-sky-500/12 text-sky-300 [a&]:hover:bg-sky-500/18",
				agent: "bg-violet-500/12 text-violet-300 [a&]:hover:bg-violet-500/18",
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
