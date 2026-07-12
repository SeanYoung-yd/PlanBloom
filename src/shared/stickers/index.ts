export const PRESET_STICKERS = [
  { id: "exercise", emoji: "🏃", name: "运动", color: "#ef4444" },
  { id: "reading", emoji: "📖", name: "阅读", color: "#3b82f6" },
  { id: "water", emoji: "💧", name: "喝水", color: "#06b6d4" },
  { id: "sleep", emoji: "😴", name: "早睡", color: "#6366f1" },
  { id: "journal", emoji: "📝", name: "日记", color: "#f59e0b" },
  { id: "meditation", emoji: "🧘", name: "冥想", color: "#8b5cf6" },
  { id: "walk", emoji: "🚶", name: "散步", color: "#22c55e" },
  { id: "study", emoji: "📚", name: "学习", color: "#14b8a6" },
  { id: "music", emoji: "🎵", name: "音乐", color: "#ec4899" },
  { id: "draw", emoji: "🎨", name: "绘画", color: "#a855f7" },
  { id: "cook", emoji: "🍳", name: "做饭", color: "#f97316" },
  { id: "no-screen", emoji: "📵", name: "少看手机", color: "#64748b" },
  { id: "fruit", emoji: "🍎", name: "吃水果", color: "#dc2626" },
  { id: "stretch", emoji: "🤸", name: "拉伸", color: "#10b981" },
  { id: "gratitude", emoji: "🙏", name: "感恩", color: "#eab308" },
  { id: "custom", emoji: "⭐", name: "自定义", color: "#f472b6" },
] as const;

export type PresetSticker = (typeof PRESET_STICKERS)[number];
