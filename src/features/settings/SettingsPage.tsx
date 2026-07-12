import { ChangeEvent, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Card } from "../../shared/components/Card";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { PageHeader } from "../../shared/components/PageHeader";
import { exportAllData, importAllData, useSettings } from "../../shared/hooks/usePlanBloomData";
import { todayKey } from "../../shared/utils/dates";

export function SettingsPage() {
  const { data: settings, updateSettings } = useSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<Awaited<ReturnType<typeof exportAllData>> | null>(null);

  async function downloadBackup() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `planbloom-backup-${todayKey()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPendingImport(JSON.parse(text));
    event.target.value = "";
  }

  return (
    <div>
      <PageHeader title="设置" description="所有数据都保存在这台设备的浏览器里。" />

      <div className="space-y-5">
        <Card>
          <h2 className="mb-4 font-bold">个人偏好</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="pb-label" htmlFor="user-name">用户名</label>
              <input id="user-name" className="pb-input" value={settings.userName ?? ""} onChange={(event) => updateSettings({ userName: event.target.value })} />
            </div>
            <div>
              <label className="pb-label" htmlFor="week-start">周起始日</label>
              <select id="week-start" className="pb-input" value={settings.weekStartsOn} onChange={(event) => updateSettings({ weekStartsOn: event.target.value as "monday" | "sunday" })}>
                <option value="monday">周一</option>
                <option value="sunday">周日</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">主题</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { value: "fresh", label: "清爽", color: "#14b8a6" },
              { value: "sunny", label: "晴朗", color: "#f59e0b" },
              { value: "mint", label: "薄荷", color: "#10b981" },
            ].map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => updateSettings({ theme: theme.value as typeof settings.theme })}
                className={`flex items-center gap-3 rounded-card border p-3 text-left font-bold ${settings.theme === theme.value ? "border-bloom-primary bg-teal-50" : "border-bloom-border bg-white"}`}
              >
                <span className="h-5 w-5 rounded-full" style={{ background: theme.color }} />
                {theme.label}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-bold">导入导出</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={downloadBackup} className="inline-flex items-center gap-2 rounded-control bg-bloom-primary px-4 py-2 font-bold text-white">
              <Download size={18} /> 导出数据
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-control border border-bloom-border bg-white px-4 py-2 font-bold">
              <Upload size={18} /> 导入数据
            </button>
            <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleFile} />
          </div>
          <p className="mt-3 text-sm text-bloom-muted">导入会覆盖当前浏览器里的 PlanBloom 数据。</p>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(pendingImport)}
        title="确认导入数据"
        message="导入后会清空并覆盖当前本地数据。请确认你已经导出了当前数据，或者确定不再需要它。"
        confirmLabel="导入"
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return;
          importAllData(pendingImport).then(() => setPendingImport(null));
        }}
      />
    </div>
  );
}
