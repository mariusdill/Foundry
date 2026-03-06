import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap uppercase tracking-[0.24em] transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        draft:
          "border-transparent bg-[color:rgba(240,178,77,0.14)] text-[color:var(--warning)] shadow-[inset_0_0_0_1px_rgba(240,178,77,0.16)]",
        stable:
          "border-transparent bg-[color:rgba(77,204,135,0.14)] text-[color:var(--success)] shadow-[inset_0_0_0_1px_rgba(77,204,135,0.16)]",
        archived:
          "border-transparent bg-[color:rgba(240,107,116,0.14)] text-[color:var(--danger)] shadow-[inset_0_0_0_1px_rgba(240,107,116,0.16)]",
        human:
          "border-transparent bg-[color:rgba(92,124,255,0.16)] text-[color:var(--accent-human)] shadow-[inset_0_0_0_1px_rgba(92,124,255,0.18)]",
        agent:
          "border-transparent bg-[color:rgba(139,109,248,0.16)] text-[color:var(--accent-agent)] shadow-[inset_0_0_0_1px_rgba(139,109,248,0.18)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
