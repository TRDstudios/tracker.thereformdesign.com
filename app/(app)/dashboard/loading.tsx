export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border bg-white p-4">
            <div className="h-4 w-20 rounded bg-zinc-200" />
            <div className="mt-4 h-8 w-12 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
