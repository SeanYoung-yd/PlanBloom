import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarPlus, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { BottomSheet } from "../../shared/components/BottomSheet";
import { CalendarGrid } from "../../shared/components/CalendarGrid";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { categoryIcons, categoryLabels, categories } from "../../shared/utils/categories";
import { formatMonthTitle, monthKey, shiftMonth, todayKey } from "../../shared/utils/dates";
import { useDailyTasks, useMonthlyEvents, useMonthlyGoals, useSettings } from "../../shared/hooks/usePlanBloomData";
import type { GoalCategory } from "../../shared/schemas";
import type { MonthlyGoal } from "../../shared/db";

export function MonthlyPlanPage() {
  const params = useParams();
  const navigate = useNavigate();
  const yearMonth = params.yearMonth ?? monthKey();
  const { data: settings } = useSettings();
  const goals = useMonthlyGoals(yearMonth);
  const events = useMonthlyEvents(yearMonth);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const selectedTasks = useDailyTasks(selectedDate);
  const [goalDraft, setGoalDraft] = useState<{ id?: string; title: string; category: GoalCategory; progress: number }>({ title: "", category: "other", progress: 0 });
  const [eventTitle, setEventTitle] = useState("");
  const [sheet, setSheet] = useState<"day" | "goal" | null>(null);

  const eventsByDate = useMemo(() => {
    return events.data.reduce<Record<string, typeof events.data>>((acc, event) => {
      acc[event.date] = [...(acc[event.date] ?? []), event];
      return acc;
    }, {});
  }, [events.data]);

  function openGoal(goal?: MonthlyGoal) {
    setGoalDraft(goal ? { id: goal.id, title: goal.title, category: goal.category, progress: goal.completed ? 100 : goal.progress } : { title: "", category: "other", progress: 0 });
    setSheet("goal");
  }

  async function saveGoal() {
    const title = goalDraft.title.trim();
    if (!title) return;
    if (goalDraft.id) {
      await goals.updateGoal(goalDraft.id, { title, category: goalDraft.category, progress: goalDraft.progress, completed: goalDraft.progress >= 100 });
    } else {
      await goals.addGoal({ title, category: goalDraft.category });
    }
    setSheet(null);
  }

  return (
    <div>
      <PageHeader
        title={formatMonthTitle(yearMonth)}
        actions={
          <>
            <IconButton label="上个月" onClick={() => navigate(`/monthly/${shiftMonth(yearMonth, -1)}`)}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton label="下个月" onClick={() => navigate(`/monthly/${shiftMonth(yearMonth, 1)}`)}>
              <ChevronRight size={18} />
            </IconButton>
            <button type="button" onClick={() => openGoal()} className="inline-flex items-center gap-2 rounded-control bg-bloom-primary px-3 py-2 text-sm font-bold text-white">
              <Plus size={16} /> 新目标
            </button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CalendarGrid
            yearMonth={yearMonth}
            weekStartsOn={settings.weekStartsOn}
            renderDay={(day) => {
              const dayEvents = eventsByDate[day.key] ?? [];
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.key);
                    setSheet("day");
                  }}
                  className={`min-h-[82px] rounded-card border p-2 text-left transition hover:bg-bloom-soft ${
                    day.isToday ? "border-bloom-primary" : "border-bloom-border"
                  } ${day.inMonth ? "bg-white" : "bg-slate-50 text-bloom-muted"}`}
                >
                  <span className="text-sm font-bold">{day.day}</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span key={event.id} className="h-2 w-2 rounded-full" style={{ background: event.color }} />
                    ))}
                  </div>
                  {day.key === todayKey() ? <span className="mt-2 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">今天</span> : null}
                </button>
              );
            }}
          />
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">月目标</h2>
            <span className="text-sm font-bold text-bloom-muted">{goals.averageProgress}%</span>
          </div>
          <ProgressBar value={goals.averageProgress} />
          <div className="mt-4 space-y-3">
            {goals.data.map((goal) => {
              const Icon = categoryIcons[goal.category];
              return (
                <button key={goal.id} type="button" onClick={() => openGoal(goal)} className="w-full rounded-card border border-bloom-border bg-white p-3 text-left">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon size={17} className="text-bloom-primary" />
                    <span className="font-semibold">{goal.title}</span>
                    <span className="ml-auto text-xs text-bloom-muted">{categoryLabels[goal.category]}</span>
                  </div>
                  <ProgressBar value={goal.completed ? 100 : goal.progress} />
                </button>
              );
            })}
            {!goals.data.length ? <EmptyState title="这个月还没有目标" description="先设一个轻一点的目标。" /> : null}
          </div>
        </Card>
      </div>

      <BottomSheet open={sheet === "day"} title={`${selectedDate} 摘要`} onClose={() => setSheet(null)}>
        <div className="space-y-4">
          <Card className="shadow-none">
            <h3 className="mb-2 font-bold">当天任务</h3>
            {selectedTasks.data.length ? (
              <div className="space-y-2">
                {selectedTasks.data.map((task) => (
                  <div key={task.id} className="rounded-control bg-bloom-soft p-2 text-sm">{task.completed ? "✓ " : ""}{task.title}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bloom-muted">当天还没有任务。</p>
            )}
          </Card>
          <Card className="shadow-none">
            <h3 className="mb-2 font-bold">轻量事件</h3>
            <div className="space-y-2">
              {(eventsByDate[selectedDate] ?? []).map((event) => (
                <div key={event.id} className="flex items-center gap-2 rounded-control bg-bloom-soft p-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ background: event.color }} />
                  <span className="flex-1">{event.title}</span>
                  <button type="button" aria-label="删除事件" onClick={() => events.deleteEvent(event.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input className="pb-input" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="添加生日、截止日或提醒" />
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-bloom-primary text-white"
                aria-label="添加事件"
                onClick={() => {
                  const title = eventTitle.trim();
                  if (!title) return;
                  events.addEvent({ date: selectedDate, title });
                  setEventTitle("");
                }}
              >
                <CalendarPlus size={18} />
              </button>
            </div>
          </Card>
          <Link to={`/daily/${selectedDate}`} className="block rounded-control bg-bloom-primary px-4 py-3 text-center font-bold text-white">
            打开日计划
          </Link>
        </div>
      </BottomSheet>

      <BottomSheet open={sheet === "goal"} title={goalDraft.id ? "编辑月目标" : "新目标"} onClose={() => setSheet(null)}>
        <div className="space-y-4">
          <div>
            <label className="pb-label" htmlFor="goal-title">目标标题</label>
            <input id="goal-title" className="pb-input" value={goalDraft.title} onChange={(event) => setGoalDraft({ ...goalDraft, title: event.target.value })} />
          </div>
          <div>
            <label className="pb-label" htmlFor="goal-category">分类</label>
            <select id="goal-category" className="pb-input" value={goalDraft.category} onChange={(event) => setGoalDraft({ ...goalDraft, category: event.target.value as GoalCategory })}>
              {categories.map((category) => (
                <option key={category} value={category}>{categoryLabels[category]}</option>
              ))}
            </select>
          </div>
          {goalDraft.id ? (
            <div>
              <label className="pb-label" htmlFor="goal-progress">进度 {goalDraft.progress}%</label>
              <input id="goal-progress" type="range" min="0" max="100" className="w-full accent-teal-500" value={goalDraft.progress} onChange={(event) => setGoalDraft({ ...goalDraft, progress: Number(event.target.value) })} />
            </div>
          ) : null}
          <div className="flex justify-between gap-2">
            {goalDraft.id ? (
              <button type="button" className="rounded-control border border-rose-200 px-3 py-2 font-semibold text-rose-600" onClick={() => goalDraft.id && goals.deleteGoal(goalDraft.id).then(() => setSheet(null))}>
                删除
              </button>
            ) : <span />}
            <button type="button" className="rounded-control bg-bloom-primary px-5 py-2 font-bold text-white" onClick={saveGoal}>
              保存
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
