export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-200" />
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-zinc-200" />
            <div className="h-4 w-96 rounded bg-zinc-100" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <div className="h-5 w-32 rounded bg-zinc-200" />
        <div className="mt-4 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 rounded bg-zinc-100" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="space-y-3">
            <div className="h-10 rounded-lg bg-white border" />
            <div className="space-y-2">
              {[1, 2].map((card) => (
                <div key={card} className="h-20 rounded-lg border bg-white p-3">
                  <div className="h-4 w-3/4 rounded bg-zinc-200" />
                  <div className="mt-2 h-3 w-1/4 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
