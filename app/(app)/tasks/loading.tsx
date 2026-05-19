export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border bg-white p-4">
            <div className="h-4 w-3/4 rounded bg-zinc-200" />
            <div className="mt-2 flex gap-2">
              <div className="h-4 w-16 rounded bg-zinc-100" />
              <div className="h-4 w-12 rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
