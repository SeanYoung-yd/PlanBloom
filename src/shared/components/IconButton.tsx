import type { ComponentPropsWithoutRef, ReactNode } from "react";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  label: string;
  children: ReactNode;
  variant?: "ghost" | "solid" | "soft";
};

export function IconButton({ label, children, className = "", variant = "ghost", ...props }: IconButtonProps) {
  const variants = {
    ghost: "border-bloom-border bg-white text-bloom-text hover:bg-bloom-soft",
    solid: "border-bloom-primary bg-bloom-primary text-white hover:brightness-95",
    soft: "border-transparent bg-teal-50 text-teal-700 hover:bg-teal-100",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
