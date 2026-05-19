export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border bg-white p-4">
            <div className="h-5 w-3/4 rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-full rounded bg-zinc-100" />
            <div className="mt-4 h-5 w-16 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
