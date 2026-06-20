export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#1A1A1A] bg-black/20 px-4 py-8 text-center text-sm text-[#A1A1AA]">
      {children}
    </div>
  );
}
