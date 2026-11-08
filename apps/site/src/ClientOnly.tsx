import { type ReactNode, useEffect, useState } from "react";

/** Renders `children` only in the browser; the prerendered HTML shows `fallback`. */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
}
