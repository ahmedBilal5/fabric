import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";

import GitHub from "@fabric-kit/icons/GitHub";
import HomeOutlined from "@fabric-kit/icons/HomeOutlined";
import MenuBookOutlined from "@fabric-kit/icons/MenuBookOutlined";
import { FabricBanner } from "@fabric-kit/layout";
import { DesignSystemProvider } from "@fabric-kit/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AdminApp } from "./AdminApp";
import { BrandProvider } from "./brand";
import { DataProvider } from "./data/store";
import { RouterProvider } from "./router";

// The app is deployed at <site>/admin/, so the site and docs are one folder up.
const go = (url: string) => () => window.location.assign(url);
const LINKS = [
  { id: "site", label: "Fabric home", icon: <HomeOutlined />, onClick: go("../") },
  { id: "docs", label: "Fabric docs", icon: <MenuBookOutlined />, onClick: go("../docs/") },
  {
    id: "github",
    label: "Source on GitHub",
    icon: <GitHub />,
    onClick: go("https://github.com/ahmedBilal5/fabric/tree/main/apps/admin"),
  },
];

const BANNER = (
  <FabricBanner
    fixed={false}
    message="An example app built only from Fabric. The data is made up and resets when you reload."
    action={{ label: "About Fabric", onClick: go("../") }}
  />
);

// biome-ignore lint/style/noNonNullAssertion: the root element is in index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrandProvider>
      {(theme) => (
        <DesignSystemProvider theme={theme}>
          <DataProvider>
            <RouterProvider>
              <AdminApp banner={BANNER} appSwitcherItems={LINKS} />
            </RouterProvider>
          </DataProvider>
        </DesignSystemProvider>
      )}
    </BrandProvider>
  </StrictMode>,
);
