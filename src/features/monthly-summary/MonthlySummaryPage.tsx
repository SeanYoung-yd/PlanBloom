import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarGrid } from "../../shared/components/CalendarGrid";
import { Card } from "../../shared/components/Card";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { TagInput } from "../../shared/components/TagInput";
import { useMonthlyStats, useMonthlySummary, useSettings } from "../../shared/hooks/usePlanBloomData";
import { formatMonthTitle, monthKey, shiftMonth, yearKey } from "../../shared/utils/dates";

export function MonthlySummaryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const yearMonth = params.yearMonth ?? monthKey();
  const stats = useMonthlyStats(yearMonth);
  const summary = useMonthlySummary(yearMonth);
  const { data: settings } = useSettings();

  return (
    <div>
      <PageHeader
        title={`${formatMonthTitle(yearMonth)} 总结`}
        actions={
          <>
            <SegmentedControl value="monthly" onChange={(value) => value === "yearly" && navigate(`/summary/yearly/${yearKey()}`)} options={[{ label: "月度", value: "monthly" }, { label: "年度", value: "yearly" }]} />
            <IconButton label="上个月" onClick={() => navigate(`/summary/monthly/${shiftMonth(yearMonth, -1)}`)}><ChevronLeft size={18} /></IconButton>
            <IconButton label="下个月" onClick={() => navigate(`/summary/monthly/${shiftMonth(yearMonth, 1)}`)}><ChevronRight size={18} /></IconButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card><p className="text-sm text-bloom-muted">完成任务</p><p className="mt-1 text-2xl font-bold">{stats.data.completedTasks}</p></Card>
        <Card><p className="text-sm text-bloom-muted">习惯打卡</p><p className="mt-1 text-2xl font-bold">{stats.data.habitCheckins}</p></Card>
        <Card><p className="text-sm text-bloom-muted">目标进度</p><p className="mt-1 text-2xl font-bold">{stats.data.goalProgress}%</p></Card>
        <Card><p className="text-sm text-bloom-muted">记录天数</p><p className="mt-1 text-2xl font-bold">{stats.data.recordedDays}</p></Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <h2 className="mb-3 font-bold">习惯热力图</h2>
          <CalendarGrid
            yearMonth={yearMonth}
            weekStartsOn={settings.weekStartsOn}
            renderDay={(day) => {
              const count = stats.data.dailyHabitCounts[day.key] ?? 0;
              return (
                <div key={day.key} className={`min-h-[52px] rounded-card border border-bloom-border p-2 text-sm ${day.inMonth ? "" : "opacity-40"}`} style={{ background: count ? `rgba(20, 184, 166, ${Math.min(0.15 + count * 0.14, 0.8)})` : "#fff" }}>
                  <span className="font-bold">{day.day}</span>
                  {count ? <span className="mt-1 block text-xs font-bold">{count}</span> : null}
                </div>
              );
            }}
          />
        </Card>

        <div className="space-y-5">
          <Card>
            <label className="pb-label" htmlFor="monthly-mood">本月心情</label>
            <select id="monthly-mood" className="pb-input" value={summary.data.mood ?? ""} onChange={(event) => summary.updateSummary({ mood: event.target.value as typeof summary.data.mood })}>
              <option value="">选择心情</option>
              <option value="great">很棒</option>
              <option value="good">不错</option>
              <option value="okay">还行</option>
              <option value="tired">有点累</option>
            </select>
          </Card>
          <Card>
            <h2 className="mb-3 font-bold">目标回顾</h2>
            <div className="space-y-3">
              {stats.data.goals.map((goal) => <div key={goal.id}><div className="mb-1 flex justify-between text-sm"><span>{goal.title}</span><span>{goal.completed ? 100 : goal.progress}%</span></div><ProgressBar value={goal.completed ? 100 : goal.progress} /></div>)}
              {!stats.data.goals.length ? <p className="text-sm text-bloom-muted">本月还没有目标。</p> : null}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-bold">月度亮点</h2>
          <TagInput value={summary.data.highlights} onChange={(highlights) => summary.updateSummary({ highlights })} />
        </Card>
        <Card>
          <label className="pb-label" htmlFor="monthly-reflection">月度感悟</label>
          <textarea id="monthly-reflection" className="pb-input min-h-[180px]" value={summary.data.reflection} onChange={(event) => summary.updateSummary({ reflection: event.target.value })} />
        </Card>
      </div>
      <Link className="mt-4 inline-block text-sm font-bold text-teal-700" to={`/monthly/${yearMonth}`}>返回月计划</Link>
    </div>
  );
}
