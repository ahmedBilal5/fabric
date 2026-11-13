import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";

import { DesignSystemProvider } from "@fabric-kit/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ProjectsProvider } from "./data";
import { RouterProvider } from "./router";
import { theme } from "./theme";

// biome-ignore lint/style/noNonNullAssertion: the root element is in index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesignSystemProvider theme={theme}>
      <ProjectsProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </ProjectsProvider>
    </DesignSystemProvider>
  </StrictMode>,
);
