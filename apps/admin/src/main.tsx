import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";

import { DesignSystemProvider } from "@fabric-kit/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApp } from "./AdminApp";
import { BrandProvider } from "./brand";
import { DataProvider } from "./data/store";
import { RouterProvider } from "./router";

// biome-ignore lint/style/noNonNullAssertion: the root element is in index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrandProvider>
      {(theme) => (
        <DesignSystemProvider theme={theme}>
          <DataProvider>
            <RouterProvider>
              <AdminApp />
            </RouterProvider>
          </DataProvider>
        </DesignSystemProvider>
      )}
    </BrandProvider>
  </StrictMode>,
);
