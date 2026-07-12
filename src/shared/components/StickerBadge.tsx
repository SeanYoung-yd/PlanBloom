import { motion } from "framer-motion";
import { softColor, stableRotation } from "../utils/color";

type StickerBadgeProps = {
  emoji: string;
  color: string;
  label: string;
  checked?: boolean;
  large?: boolean;
  ghost?: boolean;
  seed?: string;
  onClick?: () => void;
};

export function StickerBadge({ emoji, color, label, checked, large, ghost, seed = label, onClick }: StickerBadgeProps) {
  const size = large ? "h-14 w-14 text-2xl" : "h-9 w-9 text-lg";
  const rotation = checked ? stableRotation(seed) : 0;
  const content = (
    <motion.span
      aria-hidden="true"
      animate={{ scale: checked ? [1, 1.12, 1] : 1, rotate: rotation }}
      transition={{ duration: 0.2 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sticker ${size} ${
        ghost ? "border-dashed opacity-60 shadow-none" : ""
      }`}
      style={{ background: checked || large ? softColor(color, 0.24) : softColor(color, 0.1) }}
    >
      {emoji}
    </motion.span>
  );

  if (!onClick) {
    return (
      <span aria-label={label} title={label} className="inline-flex">
        {content}
      </span>
    );
  }

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="inline-flex rounded-full">
      {content}
    </button>
  );
}
