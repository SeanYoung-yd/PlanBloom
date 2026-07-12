import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "../../shared/components/CalendarGrid";
import { Card } from "../../shared/components/Card";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { StickerBadge } from "../../shared/components/StickerBadge";
import { useHabit, useHabitCheckins, useSettings, calculateStreak } from "../../shared/hooks/usePlanBloomData";
import { daysInMonth, formatMonthTitle, monthKey, shiftMonth, todayKey } from "../../shared/utils/dates";

export function HabitDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const habitId = params.habitId ?? "";
  const [currentMonth, setCurrentMonth] = useState(monthKey());
  const habit = useHabit(habitId);
  const { data: settings } = useSettings();
  const checkins = useHabitCheckins(habitId, `${currentMonth}-01`, `${currentMonth}-31`);
  const checkedDates = new Set(checkins.data.map((checkin) => checkin.date));
  const monthDays = daysInMonth(currentMonth).length;
  const streak = calculateStreak(checkins.data);
  const longestStreak = useMemo(() => {
    let best = 0;
    let running = 0;
    daysInMonth(currentMonth).forEach((date) => {
      if (checkedDates.has(date)) {
        running += 1;
        best = Math.max(best, running);
      } else {
        running = 0;
      }
    });
    return best;
  }, [checkedDates, currentMonth]);

  if (!habit.data) {
    return <PageHeader title="习惯不存在" description="这个习惯可能已经被归档。" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={habit.data.name}
        description={`连续 ${streak} 天 · ${formatMonthTitle(currentMonth)}`}
        actions={
          <>
            <IconButton label="上个月" onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton label="下个月" onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}>
              <ChevronRight size={18} />
            </IconButton>
          </>
        }
      />

      <Card>
        <div className="mb-4 flex items-center gap-4">
          <StickerBadge emoji={habit.data.stickerEmoji} color={habit.data.color} label={habit.data.name} large checked />
          <div>
            <p className="text-sm font-semibold text-bloom-muted">在日历上贴下今天</p>
            <h2 className="text-xl font-bold">{habit.data.name}</h2>
          </div>
        </div>
        <CalendarGrid
          yearMonth={currentMonth}
          weekStartsOn={settings.weekStartsOn}
          renderDay={(day) => {
            const checked = checkedDates.has(day.key);
            const canToggle = checked || day.key === todayKey();
            return (
              <button
                key={day.key}
                type="button"
                disabled={!canToggle}
                onClick={() => checkins.toggleCheckin(habit.data!.id, day.key)}
                className={`min-h-[74px] rounded-card border p-2 text-left ${day.inMonth ? "bg-white" : "bg-slate-50"} ${day.isToday ? "border-bloom-primary" : "border-bloom-border"}`}
              >
                <span className="text-sm font-bold text-bloom-muted">{day.day}</span>
                <div className="mt-2 flex justify-center">
                  {checked ? (
                    <StickerBadge emoji={habit.data!.stickerEmoji} color={habit.data!.color} label="取消打卡" checked seed={`${habit.data!.id}-${day.key}`} />
                  ) : day.key === todayKey() ? (
                    <StickerBadge emoji={habit.data!.stickerEmoji} color={habit.data!.color} label="今日打卡" ghost />
                  ) : null}
                </div>
              </button>
            );
          }}
        />
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-bloom-muted">本月打卡</p>
          <p className="mt-1 text-2xl font-bold">{checkins.data.length} 天</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-bloom-muted">打卡率</p>
          <p className="mt-1 text-2xl font-bold">{Math.round((checkins.data.length / monthDays) * 100)}%</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-bloom-muted">最长连续</p>
          <p className="mt-1 text-2xl font-bold">{longestStreak} 天</p>
        </Card>
      </div>

      <button type="button" className="rounded-control border border-bloom-border bg-white px-4 py-2 font-bold" onClick={() => navigate("/habits")}>
        返回习惯列表
      </button>
    </div>
  );
}
