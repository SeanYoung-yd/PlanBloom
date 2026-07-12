import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <section
      className={`rounded-card border border-bloom-border bg-bloom-surface p-4 shadow-soft ${className}`}
      {...props}
    />
  );
}
