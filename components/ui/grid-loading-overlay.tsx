export function GridLoadingOverlay() {
  return (
    <div className="h-full w-full p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 flex-1 animate-pulse rounded bg-[#e5e5e5]" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e5e5e5]" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="h-4 w-16 animate-pulse rounded bg-[#e5e5e5]" style={{ animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
    </div>
  );
}
