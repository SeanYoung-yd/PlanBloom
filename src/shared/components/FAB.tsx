import type { ReactNode } from "react";

type FloatingActionButtonProps = {
  label: string;
  children: ReactNode;
  onClick: () => void;
};

export function FloatingActionButton({ label, children, onClick }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="fixed bottom-24 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-bloom-primary text-white shadow-soft transition hover:brightness-95 md:right-[calc(50%-430px)]"
    >
      {children}
    </button>
  );
}
