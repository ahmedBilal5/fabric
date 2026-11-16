/**
 * Each page is its own chunk (see `React.lazy` in the app), so the first visit only
 * downloads the shell and the page you open. This boundary shows a spinner while a
 * page's code loads, and tells the app once the page is on screen.
 */

import { FabricCircularProgress } from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import Box from "@mui/material/Box";
import { type ReactNode, Suspense, useEffect, useState } from "react";

export interface PageSuspenseProps {
  /** Changes on every navigation, e.g. the path. */
  pageKey: string;
  /** Runs once the new page has rendered: a good time to focus its heading. */
  onShown: () => void;
  children: ReactNode;
}

export function PageSuspense({ pageKey, onShown, children }: PageSuspenseProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      {children}
      {/* Inside the boundary, so its effect waits until the page's code has loaded. */}
      <Shown key={pageKey} onShown={onShown} />
    </Suspense>
  );
}

function Shown({ onShown }: { onShown: () => void }) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: once per page; keyed by path
  useEffect(() => onShown(), []);
  return null;
}

/** Waits a moment before showing a spinner, so fast loads don't flash. */
function PageLoading() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Box
      role="status"
      aria-label="Loading page"
      sx={{ display: "flex", justifyContent: "center", py: `${spacing["3xl"]}px` }}
    >
      {visible && <FabricCircularProgress aria-hidden />}
    </Box>
  );
}
