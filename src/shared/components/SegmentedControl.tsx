type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-control border border-bloom-border bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
            value === option.value ? "bg-bloom-primary text-white" : "text-bloom-muted hover:bg-bloom-soft"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
