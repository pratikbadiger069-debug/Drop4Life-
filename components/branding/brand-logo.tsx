import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  clickable?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
  showTagline = false,
  clickable = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Brand Icon: Blood Drop with subtle life heart motif */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-sm ring-1 ring-red-900/20",
          iconSizes[size]
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3/5 h-3/5 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        >
          {/* Blood Drop path with inner pulse curve */}
          <path d="M12 2.5C12 2.5 5 11.5 5 16C5 19.866 8.134 23 12 23C15.866 23 19 19.866 19 16C19 11.5 12 2.5 12 2.5ZM12 21C9.239 21 7 18.761 7 16C7 13.067 10.33 7.82 12 5.37C13.67 7.82 17 13.067 17 16C17 18.761 14.761 21 12 21Z" />
          <path
            d="M12 12C11.17 12 10.5 12.67 10.5 13.5C10.5 14.33 11.17 15 12 15C12.83 15 13.5 14.33 13.5 13.5C13.5 12.67 12.83 12 12 12Z"
            fill="white"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline font-bold tracking-tight text-slate-900 leading-none">
          <span className={cn(textSizes[size], "font-extrabold text-slate-900")}>
            Drop<span className="text-red-700">4</span>Life
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-0.5">
            Every Drop Can Save a Life.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link
        href="/"
        className="group inline-flex items-center focus-visible:ring-2 focus-visible:ring-primary rounded-lg transition-opacity hover:opacity-90"
        aria-label="Drop4Life Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
