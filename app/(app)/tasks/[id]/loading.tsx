export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[#f0f0f0]" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-2/3 animate-pulse rounded bg-[#e5e5e5]" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-48 animate-pulse rounded bg-[#f0f0f0]" />
            <div className="h-4 w-16 animate-pulse rounded bg-[#f0f0f0]" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-[#f0f0f0]" />
        ))}
      </div>
      <div className="animate-pulse rounded-xl border border-[#e5e5e5] bg-white p-5">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-[#e5e5e5]" />
          <div className="h-4 w-5/6 rounded bg-[#f0f0f0]" />
          <div className="h-4 w-4/6 rounded bg-[#f0f0f0]" />
        </div>
      </div>
    </div>
  );
}
