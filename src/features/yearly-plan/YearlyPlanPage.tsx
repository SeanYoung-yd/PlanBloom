import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Plus } from "lucide-react";
import { BottomSheet } from "../../shared/components/BottomSheet";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { FloatingActionButton } from "../../shared/components/FAB";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { categoryLabels, categories } from "../../shared/utils/categories";
import { nextYear, previousYear, yearKey } from "../../shared/utils/dates";
import { useYearlyGoals, useYearlySummary } from "../../shared/hooks/usePlanBloomData";
import type { GoalCategory } from "../../shared/schemas";
import type { YearlyGoal } from "../../shared/db";

type ViewMode = "timeline" | "category";
type Draft = { id?: string; title: string; category: GoalCategory; targetMonth: string; progress: number };
const emptyDraft: Draft = { title: "", category: "other", targetMonth: "", progress: 0 };

export function YearlyPlanPage() {
  const params = useParams();
  const navigate = useNavigate();
  const year = params.year ?? yearKey();
  const goals = useYearlyGoals(year);
  const summary = useYearlySummary(year);
  const [view, setView] = useState<ViewMode>("timeline");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const goalsByMonth = useMemo(() => {
    return goals.data.reduce<Record<string, YearlyGoal[]>>((acc, goal) => {
      const key = goal.targetMonth?.slice(5, 7) ?? "00";
      acc[key] = [...(acc[key] ?? []), goal];
      return acc;
    }, {});
  }, [goals.data]);

  const goalsByCategory = useMemo(() => {
    return categories.reduce<Record<GoalCategory, YearlyGoal[]>>((acc, category) => {
      acc[category] = goals.data.filter((goal) => goal.category === category);
      return acc;
    }, {} as Record<GoalCategory, YearlyGoal[]>);
  }, [goals.data]);

  function openGoal(goal?: YearlyGoal) {
    setDraft(goal ? { id: goal.id, title: goal.title, category: goal.category, targetMonth: goal.targetMonth ?? "", progress: goal.completed ? 100 : goal.progress } : emptyDraft);
    setOpen(true);
  }

  async function saveGoal() {
    const title = draft.title.trim();
    if (!title) return;
    if (draft.id) {
      await goals.updateGoal(draft.id, { title, category: draft.category, targetMonth: draft.targetMonth || undefined, progress: draft.progress, completed: draft.progress >= 100, completedDate: draft.progress >= 100 ? new Date().toISOString() : undefined });
    } else {
      await goals.addGoal({ title, category: draft.category, targetMonth: draft.targetMonth || undefined });
    }
    setOpen(false);
  }

  const renderGoal = (goal: YearlyGoal) => (
    <button key={goal.id} type="button" onClick={() => openGoal(goal)} className="w-full rounded-card border border-bloom-border bg-white p-3 text-left">
      <div className="mb-2 flex items-center gap-2">
        {goal.completed ? <CheckCircle2 size={18} className="text-bloom-primary" /> : <Circle size={18} className="text-bloom-muted" />}
        <span className="font-semibold">{goal.title}</span>
        <span className="ml-auto text-xs text-bloom-muted">{goal.targetMonth ?? "全年"}</span>
      </div>
      <ProgressBar value={goal.completed ? 100 : goal.progress} />
    </button>
  );

  return (
    <div>
      <PageHeader
        title={`${year} 年`}
        actions={
          <>
            <IconButton label="上一年" onClick={() => navigate(`/yearly/${previousYear(year)}`)}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton label="下一年" onClick={() => navigate(`/yearly/${nextYear(year)}`)}>
              <ChevronRight size={18} />
            </IconButton>
          </>
        }
      />

      <Card className="mb-5">
        <label className="pb-label" htmlFor="year-word">年度关键词</label>
        <input id="year-word" className="pb-input" value={summary.data.yearlyWord ?? ""} placeholder="例如：稳定生长" onChange={(event) => summary.updateSummary({ yearlyWord: event.target.value })} />
      </Card>

      <div className="mb-4">
        <SegmentedControl value={view} onChange={setView} options={[{ label: "时间轴", value: "timeline" }, { label: "分类", value: "category" }]} />
      </div>

      {view === "timeline" ? (
        <div className="space-y-3">
          {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((month) => (
            <Card key={month}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">{Number(month)} 月</h2>
                {month === new Date().toISOString().slice(5, 7) && year === yearKey() ? <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">当前月</span> : null}
              </div>
              <div className="space-y-2">{(goalsByMonth[month] ?? []).map(renderGoal)}</div>
              {!(goalsByMonth[month] ?? []).length ? <p className="text-sm text-bloom-muted">这个月暂无目标。</p> : null}
            </Card>
          ))}
          {goalsByMonth["00"]?.length ? <Card><h2 className="mb-3 font-bold">全年目标</h2><div className="space-y-2">{goalsByMonth["00"].map(renderGoal)}</div></Card> : null}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category}>
              <h2 className="mb-3 font-bold">{categoryLabels[category]}</h2>
              <div className="space-y-2">{goalsByCategory[category].map(renderGoal)}</div>
              {!goalsByCategory[category].length ? <p className="text-sm text-bloom-muted">暂无目标。</p> : null}
            </Card>
          ))}
        </div>
      )}

      {!goals.data.length ? <div className="mt-5"><EmptyState title="还没有年度目标" description="写下一个今年想靠近的方向。" /></div> : null}

      <FloatingActionButton label="新增年度目标" onClick={() => openGoal()}>
        <Plus size={22} />
      </FloatingActionButton>

      <BottomSheet open={open} title={draft.id ? "编辑年度目标" : "新增年度目标"} onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="pb-label" htmlFor="year-goal-title">目标标题</label>
            <input id="year-goal-title" className="pb-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="pb-label" htmlFor="year-goal-category">分类</label>
              <select id="year-goal-category" className="pb-input" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as GoalCategory })}>
                {categories.map((category) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
              </select>
            </div>
            <div>
              <label className="pb-label" htmlFor="year-goal-month">目标月份</label>
              <input id="year-goal-month" type="month" className="pb-input" value={draft.targetMonth} onChange={(event) => setDraft({ ...draft, targetMonth: event.target.value })} />
            </div>
          </div>
          {draft.id ? (
            <div>
              <label className="pb-label" htmlFor="year-goal-progress">进度 {draft.progress}%</label>
              <input id="year-goal-progress" type="range" min="0" max="100" value={draft.progress} onChange={(event) => setDraft({ ...draft, progress: Number(event.target.value) })} className="w-full accent-teal-500" />
            </div>
          ) : null}
          <div className="flex justify-between gap-2">
            {draft.id ? <button type="button" className="rounded-control border border-rose-200 px-3 py-2 font-semibold text-rose-600" onClick={() => draft.id && goals.deleteGoal(draft.id).then(() => setOpen(false))}>删除</button> : <span />}
            <button type="button" className="rounded-control bg-bloom-primary px-5 py-2 font-bold text-white" onClick={saveGoal}>保存</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
