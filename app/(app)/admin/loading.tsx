export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="rounded-lg border bg-white p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b py-3 last:border-0">
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
              <div className="h-3 w-48 animate-pulse rounded bg-zinc-100" />
            </div>
            <div className="h-5 w-20 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
