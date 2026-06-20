import type { ComponentPropsWithoutRef, ReactNode } from "react";

type CardProps = ComponentPropsWithoutRef<"section"> & {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export function Card({
  title,
  eyebrow,
  action,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={`rounded-[22px] border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-2xl shadow-black/20 ${className}`}
      {...props}
    >
      {(title || eyebrow || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#34D399]">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
