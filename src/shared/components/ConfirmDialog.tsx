import { BottomSheet } from "./BottomSheet";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, message, confirmLabel = "确认", onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <BottomSheet open={open} title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-bloom-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="rounded-control border border-bloom-border px-4 py-2 font-semibold" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="rounded-control bg-bloom-coral px-4 py-2 font-semibold text-white" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
