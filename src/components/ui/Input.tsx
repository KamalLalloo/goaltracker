import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
          {label}
        </span>
      )}
      <input
        className={`h-11 w-full rounded-2xl border border-[#1A1A1A] bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#34D399]/70 ${className}`}
        {...props}
      />
    </label>
  );
}
