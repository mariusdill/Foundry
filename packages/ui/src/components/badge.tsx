import * as React from "react";

import { cn } from "../lib/utils";

const intentClasses = {
  neutral: "border-[color:var(--border-subtle)] bg-[color:var(--surface-2)] text-[color:var(--text-secondary)]",
  draft: "border-[color:color-mix(in_srgb,var(--warning)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color:var(--warning)]",
  stable: "border-[color:color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[color:var(--success)]",
  archived: "border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] text-[color:var(--danger)]",
  human: "border-[color:color-mix(in_srgb,var(--accent-human)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-human)_12%,transparent)] text-[color:var(--accent-human)]",
  agent: "border-[color:color-mix(in_srgb,var(--accent-agent)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-agent)_12%,transparent)] text-[color:var(--accent-agent)]",
} as const;

export type BadgeIntent = keyof typeof intentClasses;

export function Badge({
  className,
  intent = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { intent?: BadgeIntent }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-[0.22em]",
        intentClasses[intent],
        className,
      )}
      {...props}
    />
  );
}
