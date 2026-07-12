import { PRESET_STICKERS, type PresetSticker } from "../stickers";
import { StickerBadge } from "./StickerBadge";

type StickerPickerProps = {
  value?: string;
  onChange: (sticker: PresetSticker) => void;
};

export function StickerPicker({ value, onChange }: StickerPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {PRESET_STICKERS.map((sticker) => (
        <button
          key={sticker.id}
          type="button"
          onClick={() => onChange(sticker)}
          className={`flex flex-col items-center gap-1 rounded-card border p-2 text-xs font-semibold transition ${
            value === sticker.id ? "border-bloom-primary bg-teal-50" : "border-bloom-border bg-white hover:bg-bloom-soft"
          }`}
        >
          <StickerBadge emoji={sticker.emoji} color={sticker.color} label={sticker.name} checked />
          <span className="truncate">{sticker.name}</span>
        </button>
      ))}
    </div>
  );
}
