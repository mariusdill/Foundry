import * as React from "react";

import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[color:var(--border-strong)] bg-[linear-gradient(135deg,var(--accent-human),color-mix(in_srbg,var(--accent-human)_70%,white))] text-[color:var(--text-primary)] shadow-[0_16px_40px_rgba(22,32,66,0.28)] hover:brightness-110",
  secondary:
    "border border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-3)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--text-secondary)] hover:border-[color:var(--border-subtle)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--text-primary)]",
  danger:
    "border border-transparent bg-[color:var(--danger)] text-white hover:bg-[color:color-mix(in_srgb,var(--danger)_88%,black)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-1)] disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
