import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-bloom-border bg-bloom-soft p-5 text-center">
      <p className="font-semibold text-bloom-text">{title}</p>
      {description ? <p className="mt-1 text-sm text-bloom-muted">{description}</p> : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}
