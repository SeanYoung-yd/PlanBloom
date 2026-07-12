import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { BottomSheet } from "../../shared/components/BottomSheet";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { FloatingActionButton } from "../../shared/components/FAB";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { useDailyNote, useDailyTasks } from "../../shared/hooks/usePlanBloomData";
import type { DailyTask } from "../../shared/db";
import type { Priority } from "../../shared/schemas";
import { formatDateTitle, hourSlots, shiftDay, todayKey } from "../../shared/utils/dates";

const priorityClasses: Record<Priority, string> = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

type Draft = {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: Priority;
  note: string;
};

const emptyDraft: Draft = { title: "", startTime: "", endTime: "", priority: "medium", note: "" };

export function DailyPlanPage() {
  const params = useParams();
  const navigate = useNavigate();
  const date = params.date ?? todayKey();
  const tasks = useDailyTasks(date);
  const note = useDailyNote(date);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [sheetOpen, setSheetOpen] = useState(false);

  const timedTasks = useMemo(() => tasks.data.filter((task) => task.startTime), [tasks.data]);
  const todoTasks = useMemo(() => tasks.data.filter((task) => !task.startTime), [tasks.data]);

  function openTask(task?: DailyTask, startTime = "") {
    setDraft(
      task
        ? {
            id: task.id,
            title: task.title,
            startTime: task.startTime ?? "",
            endTime: task.endTime ?? "",
            priority: task.priority,
            note: task.note ?? "",
          }
        : { ...emptyDraft, startTime },
    );
    setSheetOpen(true);
  }

  async function saveTask() {
    const title = draft.title.trim();
    if (!title) return;
    const payload = {
      title,
      startTime: draft.startTime || undefined,
      endTime: draft.endTime || undefined,
      priority: draft.priority,
      note: draft.note || undefined,
    };
    if (draft.id) await tasks.updateTask(draft.id, payload);
    else await tasks.addTask(payload);
    setSheetOpen(false);
    setDraft(emptyDraft);
  }

  function renderTask(task: DailyTask) {
    return (
      <button
        key={task.id}
        type="button"
        onClick={() => openTask(task)}
        className={`flex w-full items-start gap-3 rounded-control border p-3 text-left ${priorityClasses[task.priority]}`}
      >
        <span
          role="button"
          tabIndex={0}
          aria-label={task.completed ? "取消完成" : "标记完成"}
          onClick={(event) => {
            event.stopPropagation();
            tasks.updateTask(task.id, { completed: !task.completed });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") tasks.updateTask(task.id, { completed: !task.completed });
          }}
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-white ${task.completed ? "border-bloom-primary text-bloom-primary" : "border-current"}`}
        >
          {task.completed ? <Check size={14} /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold ${task.completed ? "text-bloom-muted line-through" : ""}`}>{task.title}</span>
          {task.startTime ? <span className="mt-1 block text-xs opacity-80">{task.startTime}{task.endTime ? ` - ${task.endTime}` : ""}</span> : null}
        </span>
      </button>
    );
  }

  return (
    <div>
      <PageHeader
        title={formatDateTitle(date)}
        actions={
          <>
            <IconButton label="前一天" onClick={() => navigate(`/daily/${shiftDay(date, -1)}`)}>
              <ChevronLeft size={18} />
            </IconButton>
            <Link to={`/daily/${todayKey()}`} className="rounded-control border border-bloom-border bg-white px-3 py-2 text-sm font-bold">
              今天
            </Link>
            <IconButton label="后一天" onClick={() => navigate(`/daily/${shiftDay(date, 1)}`)}>
              <ChevronRight size={18} />
            </IconButton>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <h2 className="mb-3 font-bold">时间安排</h2>
          <div className="space-y-2">
            {hourSlots.map((hour) => {
              const matched = timedTasks.filter((task) => task.startTime?.startsWith(hour.slice(0, 2)));
              return (
                <div key={hour} className="grid grid-cols-[58px_1fr] gap-3">
                  <button type="button" onClick={() => openTask(undefined, hour)} className="text-left text-sm font-bold text-bloom-muted">
                    {hour}
                  </button>
                  <div className="min-h-12 border-l border-bloom-border pl-3">
                    {matched.length ? <div className="space-y-2">{matched.map(renderTask)}</div> : <button type="button" className="h-9 w-full rounded-control text-left text-sm text-bloom-muted hover:bg-bloom-soft" onClick={() => openTask(undefined, hour)}>添加安排</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 font-bold">待办清单</h2>
            {todoTasks.length ? <div className="space-y-2">{todoTasks.map(renderTask)}</div> : <EmptyState title="今天还没有安排" description="先写下一件小事吧。" />}
          </Card>
          <Card>
            <label className="pb-label" htmlFor="daily-note">随手记</label>
            <textarea
              id="daily-note"
              className="pb-input min-h-[140px] resize-y"
              value={note.data.content}
              placeholder="今天发生了什么，顺手记一下。"
              onChange={(event) => note.updateNote({ content: event.target.value })}
            />
          </Card>
        </div>
      </div>

      <FloatingActionButton label="新增任务" onClick={() => openTask()}>
        <Plus size={22} />
      </FloatingActionButton>

      <BottomSheet open={sheetOpen} title={draft.id ? "编辑任务" : "新增任务"} onClose={() => setSheetOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="pb-label" htmlFor="task-title">任务标题</label>
            <input id="task-title" className="pb-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pb-label" htmlFor="task-start">开始时间</label>
              <input id="task-start" type="time" className="pb-input" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} />
            </div>
            <div>
              <label className="pb-label" htmlFor="task-end">结束时间</label>
              <input id="task-end" type="time" className="pb-input" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="pb-label" htmlFor="task-priority">优先级</label>
            <select id="task-priority" className="pb-input" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="pb-label" htmlFor="task-note">备注</label>
            <textarea id="task-note" className="pb-input min-h-[96px]" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              {draft.id ? (
                <>
                  <button type="button" className="inline-flex items-center gap-2 rounded-control border border-bloom-border px-3 py-2 font-semibold" onClick={() => tasks.data.find((task) => task.id === draft.id) && tasks.copyToTomorrow(tasks.data.find((task) => task.id === draft.id)!)}>
                    <Copy size={16} /> 复制到明天
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-control border border-rose-200 px-3 py-2 font-semibold text-rose-600" onClick={() => draft.id && tasks.deleteTask(draft.id).then(() => setSheetOpen(false))}>
                    <Trash2 size={16} /> 删除
                  </button>
                </>
              ) : null}
            </div>
            <button type="button" className="rounded-control bg-bloom-primary px-5 py-2 font-bold text-white" onClick={saveTask}>
              保存
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
