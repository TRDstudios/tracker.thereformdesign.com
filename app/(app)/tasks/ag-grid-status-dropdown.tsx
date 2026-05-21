"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { statusLabels, statusStyles, statusOptions } from "./ag-grid-constants";

interface StatusDropdownProps {
  current: string;
  rect: DOMRect;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function StatusDropdown({ current, rect, onSelect, onClose }: StatusDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick, true);
    return () => document.removeEventListener("mousedown", handleClick, true);
  }, [onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const top = rect.bottom + 4;
  const left = rect.left;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-56 rounded-xl border border-[#e5e5e5] bg-white p-1.5 shadow-xl"
      style={{ top, left }}
    >
      {statusOptions.map((opt) => {
        const isActive = current === opt;
        return (
          <button
            key={opt}
            type="button"
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#f5f5f4]"
                : "text-[#1d1d1d]/70 hover:bg-[#f5f5f4] hover:text-[#1d1d1d]"
            }`}
            onClick={() => onSelect(opt)}
          >
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[opt]}`}>
              {statusLabels[opt]}
            </span>
            {isActive && <Check className="ml-auto h-3.5 w-3.5 text-[#f5eb10]" />}
          </button>
        );
      })}
    </div>
  );
}
