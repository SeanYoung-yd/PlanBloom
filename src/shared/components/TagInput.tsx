import { Plus, X } from "lucide-react";
import { useState } from "react";

type TagInputProps = {
  value: string[];
  placeholder?: string;
  onChange: (value: string[]) => void;
};

export function TagInput({ value, placeholder = "添加一个亮点", onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const next = draft.trim();
    if (!next) return;
    onChange([...value, next]);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            {tag}
            <button type="button" aria-label={`移除 ${tag}`} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="pb-input"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addTag();
          }}
        />
        <button
          type="button"
          aria-label="添加"
          onClick={addTag}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-bloom-primary text-white"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
