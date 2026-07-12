import { Link } from "react-router-dom";
import { CalendarDays, Plus, Settings, Target } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { PageHeader } from "../../shared/components/PageHeader";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { StickerBadge } from "../../shared/components/StickerBadge";
import { useDailyNote, useMonthlyGoals, useSettings, useTodayHabits, useTodayTasks } from "../../shared/hooks/usePlanBloomData";
import { monthKey, todayKey } from "../../shared/utils/dates";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export function DashboardPage() {
  const today = todayKey();
  const currentMonth = monthKey();
  const { data: settings, updateSettings } = useSettings();
  const { data: note, updateNote } = useDailyNote(today);
  const tasks = useTodayTasks();
  const habits = useTodayHabits();
  const monthlyGoals = useMonthlyGoals(currentMonth);
  const completedHabitIds = new Set(habits.checkins.map((checkin) => checkin.habitId));
  const visibleTasks = tasks.data.slice(0, 6);

  async function quickAddTask(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    await tasks.addTask({ title });
    (document.getElementById("quick-task-form") as HTMLFormElement | null)?.reset();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="今天"
        description={format(new Date(), "M月d日 EEEE", { locale: zhCN })}
        actions={
          <Link to="/settings" className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-bloom-border bg-white" aria-label="设置">
            <Settings size={18} />
          </Link>
        }
      />

      <section className="rounded-2xl bg-teal-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">{greeting()}</p>
            <h2 className="mt-1 text-2xl font-bold">{settings.userName ? `${settings.userName}，今天也慢慢开花` : "今天也慢慢开花"}</h2>
          </div>
          {!settings.userName ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const value = new FormData(event.currentTarget).get("name");
                updateSettings({ userName: String(value ?? "").trim() || undefined });
              }}
            >
              <input name="name" className="pb-input max-w-[180px]" placeholder="你的名字" />
              <button type="submit" className="rounded-control bg-bloom-primary px-3 py-2 text-sm font-bold text-white">
                保存
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <Card>
        <label className="pb-label" htmlFor="today-focus">
          今日重点
        </label>
        <input
          id="today-focus"
          className="pb-input"
          value={note.focus}
          placeholder="写下今天最重要的一件事"
          onChange={(event) => updateNote({ focus: event.target.value })}
        />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold">今日任务</h2>
          <Link to={`/daily/${today}`} className="text-sm font-bold text-teal-700">
            打开日计划
          </Link>
        </div>
        <form
          id="quick-task-form"
          className="mb-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            quickAddTask(new FormData(event.currentTarget));
          }}
        >
          <input name="title" className="pb-input" placeholder="快速添加一件事" />
          <button type="submit" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-bloom-primary text-white" aria-label="添加任务">
            <Plus size={18} />
          </button>
        </form>
        {visibleTasks.length ? (
          <div className="space-y-2">
            {visibleTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => tasks.updateTask(task.id, { completed: !task.completed })}
                className="flex w-full items-center gap-3 rounded-control border border-bloom-border bg-white p-3 text-left"
              >
                <span className={`h-5 w-5 rounded border ${task.completed ? "border-bloom-primary bg-bloom-primary" : "border-bloom-border"}`} />
                <span className={task.completed ? "text-bloom-muted line-through" : ""}>{task.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="今天还没有任务" description="先写下一件小事吧。" />
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} className="text-bloom-primary" />
          <h2 className="font-bold">今日习惯贴纸</h2>
        </div>
        {habits.habits.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {habits.habits.map((habit) => {
              const checked = completedHabitIds.has(habit.id);
              return (
                <div key={habit.id} className="flex min-w-[72px] flex-col items-center gap-1 text-center">
                  <StickerBadge
                    emoji={habit.stickerEmoji}
                    color={habit.color}
                    label={`${checked ? "取消" : "完成"} ${habit.name}`}
                    checked={checked}
                    seed={`${habit.id}-${today}`}
                    onClick={() => habits.toggleCheckin(habit.id, today)}
                  />
                  <span className="w-full truncate text-xs font-semibold text-bloom-muted">{habit.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="还没有习惯贴纸"
            description="创建一个习惯，就能在日历上贴起来。"
            action={
              <Link to="/habits" className="rounded-control bg-bloom-primary px-3 py-2 text-sm font-bold text-white">
                去创建
              </Link>
            }
          />
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">本月目标进度</h2>
          <Link to={`/monthly/${currentMonth}`} className="inline-flex items-center gap-1 text-sm font-bold text-teal-700">
            <CalendarDays size={16} /> 月历
          </Link>
        </div>
        <ProgressBar value={monthlyGoals.averageProgress} />
        <p className="mt-2 text-sm font-semibold text-bloom-muted">{monthlyGoals.averageProgress}% 完成</p>
        <div className="mt-3 space-y-2">
          {monthlyGoals.data.slice(0, 3).map((goal) => (
            <div key={goal.id} className="rounded-control bg-bloom-soft p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">{goal.title}</span>
                <span className="text-bloom-muted">{goal.completed ? 100 : goal.progress}%</span>
              </div>
              <ProgressBar value={goal.completed ? 100 : goal.progress} />
            </div>
          ))}
          {!monthlyGoals.data.length ? <p className="text-sm text-bloom-muted">这个月还没有目标。</p> : null}
        </div>
      </Card>
    </div>
  );
}
