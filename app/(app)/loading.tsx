export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 animate-pulse border-r bg-zinc-50 lg:block">
        <div className="h-14 border-b px-4">
          <div className="mt-4 h-4 w-20 rounded bg-zinc-200" />
        </div>
        <div className="space-y-1 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-md bg-zinc-200 px-3" />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-6">{/* Content loads per-route */}</div>
    </div>
  );
}
