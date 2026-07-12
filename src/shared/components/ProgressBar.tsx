type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = "var(--color-primary)" }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`进度 ${Math.round(safeValue)}%`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${safeValue}%`, background: color }} />
    </div>
  );
}
