export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-[#f0f0f0]" />
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded bg-[#e5e5e5]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[#f0f0f0]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-[#e5e5e5] bg-white p-5">
            <div className="h-4 w-16 rounded bg-[#e5e5e5]" />
            <div className="mt-4 h-8 w-12 rounded bg-[#f0f0f0]" />
          </div>
        ))}
      </div>
    </div>
  );
}
