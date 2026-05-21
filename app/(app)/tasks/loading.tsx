import { GridSkeleton } from "@/components/ui/grid-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-[#f0f0f0]" />
        <div className="space-y-2">
          <div className="h-6 w-24 animate-pulse rounded bg-[#e5e5e5]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[#f0f0f0]" />
        </div>
      </div>
      <GridSkeleton rows={8} cols={7} />
    </div>
  );
}
