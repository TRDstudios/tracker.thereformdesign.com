export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-[#f0f0f0]" />
          <div className="space-y-2">
            <div className="h-7 w-64 animate-pulse rounded bg-[#e5e5e5]" />
            <div className="h-4 w-96 animate-pulse rounded bg-[#f0f0f0]" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-[#f0f0f0]" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-[#f0f0f0]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-[#e5e5e5] bg-white p-5" />
        ))}
      </div>
      <div className="h-[500px] animate-pulse rounded-xl border border-[#e5e5e5] bg-white" />
    </div>
  );
}
