import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-[#A1A1AA]">
          {label}
        </span>
      )}
      <textarea
        className={`min-h-32 w-full resize-y rounded-[18px] border border-[#1A1A1A] bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#34D399]/70 ${className}`}
        {...props}
      />
    </label>
  );
}
