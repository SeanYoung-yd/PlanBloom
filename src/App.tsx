import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { DailyPlanPage } from "./features/daily-plan/DailyPlanPage";
import { MonthlyPlanPage } from "./features/monthly-plan/MonthlyPlanPage";
import { YearlyPlanPage } from "./features/yearly-plan/YearlyPlanPage";
import { HabitsPage } from "./features/habit-tracker/HabitsPage";
import { HabitDetailPage } from "./features/habit-tracker/HabitDetailPage";
import { MonthlySummaryPage } from "./features/monthly-summary/MonthlySummaryPage";
import { YearlySummaryPage } from "./features/yearly-summary/YearlySummaryPage";
import { SettingsPage } from "./features/settings/SettingsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/daily/:date?" element={<DailyPlanPage />} />
        <Route path="/monthly/:yearMonth?" element={<MonthlyPlanPage />} />
        <Route path="/yearly/:year?" element={<YearlyPlanPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/habits/:habitId" element={<HabitDetailPage />} />
        <Route path="/summary/monthly/:yearMonth?" element={<MonthlySummaryPage />} />
        <Route path="/summary/yearly/:year?" element={<YearlySummaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
