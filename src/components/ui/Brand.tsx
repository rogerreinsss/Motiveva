"use client";

import { useId } from "react";
import Link from "next/link";
import { BRAND_COLORS, RIBBON_PATHS } from "@/lib/brand";

interface BrandProps {
  href?: string;
  compact?: boolean;
  className?: string;
}

export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-symbol ${className}`} aria-hidden="true">
      <svg viewBox="0 0 324 140" width="100%" height="100%" fill="none">
        <path d={RIBBON_PATHS.main} fill="currentColor" />
        <path d={RIBBON_PATHS.upright} fill="currentColor" opacity=".72" />
      </svg>
    </span>
  );
}

export function Brand({ href = "/", compact = false, className = "" }: BrandProps) {
  // Unique per instance: duplicate SVG ids break the fill when the first Brand
  // (e.g. the hidden sidebar) is not rendered.
  const gradientId = `motiveva-ribbon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 324 140" width="100%" height="100%" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={BRAND_COLORS.softGreen} />
              <stop offset="0.52" stopColor={BRAND_COLORS.sage} />
              <stop offset="1" stopColor={BRAND_COLORS.softGreen} />
            </linearGradient>
          </defs>
          <path d={RIBBON_PATHS.main} fill={`url(#${gradientId})`} />
          <path d={RIBBON_PATHS.upright} fill={BRAND_COLORS.softGreen} />
        </svg>
      </span>
      {!compact && <span className="brand-name">motiveva</span>}
    </>
  );

  if (!href) {
    return <span className={`brand ${className}`}>{content}</span>;
  }

  const accessibleSuffix = compact ? "Motiveva, inicio" : "Inicio";

  return (
    <Link href={href} className={`brand ${className}`}>
      {content}
      <span className="sr-only">{accessibleSuffix}</span>
    </Link>
  );
}
