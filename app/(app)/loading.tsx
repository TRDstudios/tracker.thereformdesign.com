export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 animate-pulse border-r border-[#e5e5e5] bg-white lg:block">
        <div className="flex h-14 items-center border-b border-[#e5e5e5] px-4">
          <div className="h-4 w-20 rounded bg-[#e5e5e5]" />
        </div>
        <div className="space-y-1 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 rounded-lg bg-[#f0f0f0] px-3" />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-6" />
    </div>
  );
}
