import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-[#34D399] text-black hover:bg-[#10B981]",
  secondary: "border border-[#1A1A1A] bg-white/[0.04] text-white hover:bg-white/[0.08]",
  ghost: "text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white",
  danger: "border border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/15",
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
