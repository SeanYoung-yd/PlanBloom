import {
  Briefcase,
  CircleEllipsis,
  Coins,
  GraduationCap,
  HeartPulse,
  Home,
  Palette,
  Users,
} from "lucide-react";
import type { GoalCategory } from "../schemas";

export const categoryLabels: Record<GoalCategory, string> = {
  work: "工作",
  life: "生活",
  health: "健康",
  learn: "学习",
  finance: "财务",
  relationship: "关系",
  creative: "创造",
  other: "其他",
};

export const categoryIcons = {
  work: Briefcase,
  life: Home,
  health: HeartPulse,
  learn: GraduationCap,
  finance: Coins,
  relationship: Users,
  creative: Palette,
  other: CircleEllipsis,
};

export const categories = Object.keys(categoryLabels) as GoalCategory[];
