import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import html2canvas from "html2canvas";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Card } from "../../shared/components/Card";
import { IconButton } from "../../shared/components/IconButton";
import { PageHeader } from "../../shared/components/PageHeader";
import { ProgressBar } from "../../shared/components/ProgressBar";
import { SegmentedControl } from "../../shared/components/SegmentedControl";
import { TagInput } from "../../shared/components/TagInput";
import { useYearlyStats, useYearlySummary } from "../../shared/hooks/usePlanBloomData";
import { nextYear, previousYear, yearKey } from "../../shared/utils/dates";

export function YearlySummaryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const year = params.year ?? yearKey();
  const stats = useYearlyStats(year);
  const summary = useYearlySummary(year);
  const reportRef = useRef<HTMLDivElement>(null);

  async function exportPng() {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#fffdf7", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `planbloom-yearly-${year}.png`;
    link.click();
  }

  return (
    <div>
      <PageHeader
        title={`${year} 年总结`}
        actions={
          <>
            <SegmentedControl value="yearly" onChange={(value) => value === "monthly" && navigate("/summary/monthly")} options={[{ label: "月度", value: "monthly" }, { label: "年度", value: "yearly" }]} />
            <IconButton label="上一年" onClick={() => navigate(`/summary/yearly/${previousYear(year)}`)}><ChevronLeft size={18} /></IconButton>
            <IconButton label="下一年" onClick={() => navigate(`/summary/yearly/${nextYear(year)}`)}><ChevronRight size={18} /></IconButton>
            <IconButton label="导出年度报告" variant="solid" onClick={exportPng}><Download size={18} /></IconButton>
          </>
        }
      />

      <div ref={reportRef} className="space-y-5">
        <Card>
          <label className="pb-label" htmlFor="yearly-word-summary">年度关键词</label>
          <input id="yearly-word-summary" className="pb-input" value={summary.data.yearlyWord ?? ""} onChange={(event) => summary.updateSummary({ yearlyWord: event.target.value })} />
        </Card>
        <div className="grid gap-3 sm:grid-cols-4">
          <Card><p className="text-sm text-bloom-muted">完成任务</p><p className="mt-1 text-2xl font-bold">{stats.data.completedTasks}</p></Card>
          <Card><p className="text-sm text-bloom-muted">全年打卡</p><p className="mt-1 text-2xl font-bold">{stats.data.habitCheckins}</p></Card>
          <Card><p className="text-sm text-bloom-muted">目标进度</p><p className="mt-1 text-2xl font-bold">{stats.data.goalProgress}%</p></Card>
          <Card><p className="text-sm text-bloom-muted">最佳习惯</p><p className="mt-1 text-xl font-bold">{stats.data.bestHabit}</p></Card>
        </div>
        <Card>
          <h2 className="mb-3 font-bold">习惯年度排行</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.data.habitCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-bold">年度目标回顾</h2>
            <div className="space-y-3">
              {stats.data.goals.map((goal) => <div key={goal.id}><div className="mb-1 flex justify-between text-sm"><span>{goal.completed ? "✓ " : ""}{goal.title}</span><span>{goal.completed ? 100 : goal.progress}%</span></div><ProgressBar value={goal.completed ? 100 : goal.progress} /></div>)}
              {!stats.data.goals.length ? <p className="text-sm text-bloom-muted">还没有年度目标。</p> : null}
            </div>
          </Card>
          <Card>
            <h2 className="mb-3 font-bold">年度亮点</h2>
            <TagInput value={summary.data.highlights} onChange={(highlights) => summary.updateSummary({ highlights })} />
          </Card>
        </div>
        <Card>
          <label className="pb-label" htmlFor="yearly-reflection">年度感悟</label>
          <textarea id="yearly-reflection" className="pb-input min-h-[180px]" value={summary.data.reflection} onChange={(event) => summary.updateSummary({ reflection: event.target.value })} />
        </Card>
      </div>
    </div>
  );
}
