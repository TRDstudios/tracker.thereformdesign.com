export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-200" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-2/3 rounded bg-zinc-200" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-48 rounded bg-zinc-100" />
            <div className="h-4 w-16 rounded bg-zinc-100" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-28 rounded-lg bg-zinc-200" />
        <div className="h-9 w-28 rounded-lg bg-zinc-200" />
        <div className="h-9 w-28 rounded-lg bg-zinc-200" />
        <div className="h-9 w-28 rounded-lg bg-zinc-200" />
      </div>
      <div className="rounded-xl border bg-white p-5">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-zinc-200" />
          <div className="h-4 w-5/6 rounded bg-zinc-200" />
          <div className="h-4 w-4/6 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
