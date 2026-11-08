import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist-mono/400.css";
import "./styles/page.css";

import { ThemeProvider, theme } from "@fabric-kit/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// The live screens use Fabric's theme in light mode. No CssBaseline: the page's own
// stylesheet owns the body, and the screens style themselves.
// biome-ignore lint/style/noNonNullAssertion: the root element is in index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="light" modeStorageKey="fabric-site-mode">
      <App />
    </ThemeProvider>
  </StrictMode>,
);
