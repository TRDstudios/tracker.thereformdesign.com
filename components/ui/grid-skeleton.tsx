export function GridSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  const colWidths = [
    "flex-[2]",
    "flex-[1]",
    "flex-[1]",
    "flex-[1]",
    "flex-[1]",
  ];
  return (
    <div className="h-[600px] w-full rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4 h-11 bg-[#fafafa]">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className={`${colWidths[i] || "flex-1"} h-3 animate-pulse rounded bg-[#e5e5e5]`}
            style={{ maxWidth: i === 0 ? "240px" : i === cols - 1 ? "100px" : "150px" }}
          />
        ))}
      </div>
      <div className="divide-y divide-[#f5f5f4]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-2 px-4 h-14">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`${colWidths[c] || "flex-1"} h-3 animate-pulse rounded bg-[#f0f0f0]`}
                style={{
                  maxWidth: c === 0 ? "200px" : c === cols - 1 ? "80px" : "120px",
                  animationDelay: `${r * 50}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
