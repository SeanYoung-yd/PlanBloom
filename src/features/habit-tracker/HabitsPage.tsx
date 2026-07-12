import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomSheet } from "../../shared/components/BottomSheet";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { FloatingActionButton } from "../../shared/components/FAB";
import { PageHeader } from "../../shared/components/PageHeader";
import { StickerBadge } from "../../shared/components/StickerBadge";
import { StickerPicker } from "../../shared/components/StickerPicker";
import { useHabitCheckins, useHabits, calculateStreak, calculateWeekProgress } from "../../shared/hooks/usePlanBloomData";
import { PRESET_STICKERS, type PresetSticker } from "../../shared/stickers";

export function HabitsPage() {
  const habits = useHabits();
  const checkins = useHabitCheckins();
  const [open, setOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<PresetSticker>(PRESET_STICKERS[0]);
  const [name, setName] = useState("");

  const checkinsByHabit = useMemo(() => {
    return checkins.data.reduce<Record<string, typeof checkins.data>>((acc, checkin) => {
      acc[checkin.habitId] = [...(acc[checkin.habitId] ?? []), checkin];
      return acc;
    }, {});
  }, [checkins.data]);

  async function createHabit() {
    const habitName = name.trim() || selectedSticker.name;
    await habits.addHabit({
      name: habitName,
      stickerId: selectedSticker.id,
      stickerEmoji: selectedSticker.emoji,
      color: selectedSticker.color,
      weeklyTarget: 7,
    });
    setName("");
    setOpen(false);
  }

  return (
    <div>
      <PageHeader title="习惯贴纸" description="把坚持贴到月历上。" />
      <div className="space-y-3">
        {habits.data.map((habit) => {
          const records = checkinsByHabit[habit.id] ?? [];
          return (
            <Card key={habit.id} className="p-0">
              <Link to={`/habits/${habit.id}`} className="flex items-center gap-3 p-4">
                <StickerBadge emoji={habit.stickerEmoji} color={habit.color} label={habit.name} checked />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">{habit.name}</h2>
                  <p className="text-sm text-bloom-muted">本周 {calculateWeekProgress(records)}/7 · 连续 {calculateStreak(records)} 天</p>
                </div>
                <button
                  type="button"
                  aria-label="归档习惯"
                  className="rounded-control p-2 text-bloom-muted hover:bg-bloom-soft"
                  onClick={(event) => {
                    event.preventDefault();
                    habits.archiveHabit(habit.id);
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </Link>
            </Card>
          );
        })}
        {!habits.data.length ? <EmptyState title="还没有习惯贴纸" description="从一个小习惯开始，贴上第一枚贴纸。" /> : null}
      </div>

      <FloatingActionButton label="新增习惯" onClick={() => setOpen(true)}>
        <Plus size={22} />
      </FloatingActionButton>

      <BottomSheet open={open} title="选择贴纸" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <StickerPicker value={selectedSticker.id} onChange={setSelectedSticker} />
          <div>
            <label className="pb-label" htmlFor="habit-name">习惯名称</label>
            <input id="habit-name" className="pb-input" value={name} placeholder={selectedSticker.name} onChange={(event) => setName(event.target.value)} />
          </div>
          <button type="button" className="w-full rounded-control bg-bloom-primary px-4 py-3 font-bold text-white" onClick={createHabit}>
            创建习惯
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
