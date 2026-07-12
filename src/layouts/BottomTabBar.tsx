import { BarChart3, CalendarDays, CheckSquare, Home, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { monthKey, yearKey } from "../shared/utils/dates";

const tabs = [
  { label: "今日", to: "/", icon: Home },
  { label: "月历", to: `/monthly/${monthKey()}`, icon: CalendarDays },
  { label: "年度", to: `/yearly/${yearKey()}`, icon: BarChart3 },
  { label: "习惯", to: "/habits", icon: Sparkles },
  { label: "总结", to: `/summary/monthly/${monthKey()}`, icon: CheckSquare },
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-bloom-border bg-white/95 px-2 py-2 shadow-soft backdrop-blur">
      <div className="mx-auto grid max-w-[720px] grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.label}
              to={tab.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-control px-2 py-2 text-xs font-bold transition ${
                  isActive ? "bg-teal-50 text-teal-700" : "text-bloom-muted hover:bg-bloom-soft"
                }`
              }
            >
              <Icon size={20} />
              <span className="truncate">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
