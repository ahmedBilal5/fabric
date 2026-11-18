import { type ReactNode, Suspense } from "react";
import { ClientOnly } from "../ClientOnly";

interface SheetProps {
  /** Accessible name for the live screen. */
  label: string;
  /** Screen height in px at desktop widths. */
  height: number;
  children: ReactNode;
  className?: string;
}

/**
 * A cotton sheet on the desk holding one live Fabric screen. `transform` on the
 * frame makes it the containing block for the app shell's fixed bars, so the
 * whole app renders inside the sheet instead of the page.
 */
export function Sheet({ label, height, children, className }: SheetProps) {
  const fallback = <p className="sheet__fallback">{label}. It runs in your browser.</p>;
  return (
    <figure
      className={`sheet ${className ?? ""}`}
      aria-label={label}
      style={{ "--sheet-h": `${height}px` } as React.CSSProperties}
    >
      <div className="sheet__screen">
        <ClientOnly fallback={fallback}>
          {/* Screens are lazy: the same note shows while one loads. */}
          <Suspense fallback={fallback}>{children}</Suspense>
        </ClientOnly>
      </div>
    </figure>
  );
}
