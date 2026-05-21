import { LoaderCircle } from "lucide-react";

export function GridLoadingOverlay() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white/80">
      <div className="flex items-center gap-2.5 text-sm text-[#a1a1a1]">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#f5eb10]" />
        Loading...
      </div>
    </div>
  );
}
