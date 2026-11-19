import { FormControlLabel, MenuItem, Button as MuiButton, Switch, TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { lazy, useState } from "react";
import { ClientOnly } from "./ClientOnly";
import {
  CREATE_COMMAND,
  docsUrl,
  EXAMPLE_APP_URL,
  GITHUB_URL,
  INSTALL_COMMAND,
  NPM_URL,
  ROADMAP_URL,
  WHATS_NEW,
} from "./links";
import { SiteHeader } from "./SiteHeader";
import { Sheet } from "./screens/Sheet";

const plainMui = createTheme();

// Each live screen is its own chunk and loads in the browser when its sheet shows. The
// prerendered page carries the text, so none of this blocks reading it.
const AnalyticsDashboard = lazy(() =>
  import("./screens/AnalyticsDashboard").then((m) => ({ default: m.AnalyticsDashboard })),
);
const AdminConsole = lazy(() =>
  import("./screens/AdminConsole").then((m) => ({ default: m.AdminConsole })),
);
const WorkflowBuilder = lazy(() =>
  import("./screens/WorkflowBuilder").then((m) => ({ default: m.WorkflowBuilder })),
);
const WorkspaceWizard = lazy(() =>
  import("./screens/WorkspaceWizard").then((m) => ({ default: m.WorkspaceWizard })),
);
const AssistantScreen = lazy(() =>
  import("./screens/AssistantScreen").then((m) => ({ default: m.AssistantScreen })),
);
const VersionScreen = lazy(() =>
  import("./screens/VersionScreen").then((m) => ({ default: m.VersionScreen })),
);

function InstallCommand({
  tone = "card",
  command = INSTALL_COMMAND,
}: {
  tone?: "card" | "board";
  command?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`cmd cmd--${tone}`}>
      <code className="cmd__text">{command}</code>
      <button
        type="button"
        className="cmd__copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Command copied" : ""}
      </span>
    </div>
  );
}

/** The same plain MUI JSX, rendered once with MUI's default theme and once with Fabric's. */
function InviteForm() {
  const [role, setRole] = useState("editor");
  return (
    <form className="invite" onSubmit={(e) => e.preventDefault()}>
      <TextField
        label="Email"
        type="email"
        defaultValue="ana@acme.example"
        size="small"
        fullWidth
      />
      <TextField
        select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        size="small"
        fullWidth
      >
        <MenuItem value="viewer">Viewer</MenuItem>
        <MenuItem value="editor">Editor</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
      </TextField>
      <FormControlLabel control={<Switch defaultChecked />} label="Send a welcome email" />
      <MuiButton variant="contained" type="submit">
        Invite
      </MuiButton>
    </form>
  );
}

const SCREENS = [
  {
    id: "admin",
    label: "Admin console",
    caption:
      "FabricListPage with search, filters and bulk actions; open a member for FabricDetailPage.",
    Screen: AdminConsole,
  },
  {
    id: "signup",
    label: "Sign-up form",
    caption: "FabricWizard with Zod validation, an error summary and a review step.",
    Screen: WorkspaceWizard,
  },
  {
    id: "workflow",
    label: "Workflow builder",
    caption: "FabricCanvasBuilder on React Flow. Drag a step, or connect two handles.",
    Screen: WorkflowBuilder,
  },
  {
    id: "assistant",
    label: "AI assistant",
    caption: "FabricChatbot, streaming a canned answer. Ask about refunds.",
    Screen: AssistantScreen,
  },
] as const;

/** Every public package, grouped by job. Peers beyond React, MUI and Emotion. */
const PACKAGE_GROUPS = [
  {
    group: "Start",
    packages: [
      {
        name: "@fabric-kit/create-app",
        what: "A new app: theme, shell and six pages",
        peers: "none",
      },
    ],
  },
  {
    group: "Foundations",
    packages: [
      { name: "@fabric-kit/theme", what: "Light and dark themes, plus your brand", peers: "none" },
      {
        name: "@fabric-kit/design-tokens",
        what: "Colour, type, spacing and motion",
        peers: "none",
      },
      { name: "@fabric-kit/primitives", what: "Flex, Stack, Grid, Text, Surface", peers: "none" },
      { name: "@fabric-kit/icons", what: "Material Symbols, one import each", peers: "none" },
      { name: "@fabric-kit/hooks", what: "Hotkeys, debounce, dates and numbers", peers: "none" },
    ],
  },
  {
    group: "Components",
    packages: [
      {
        name: "@fabric-kit/components",
        what: "MUI components, better defaults",
        peers: "@mui/lab, @mui/x-date-pickers",
      },
      {
        name: "@fabric-kit/forms",
        what: "Form fields bound to React Hook Form",
        peers: "react-hook-form, zod",
      },
      {
        name: "@fabric-kit/charts",
        what: "Charts, stat cards, sparklines",
        peers: "@mui/x-charts",
      },
      {
        name: "@fabric-kit/datagrid",
        what: "The free data grid, styled",
        peers: "@mui/x-data-grid",
      },
      {
        name: "@fabric-kit/date-picker",
        what: "Date, time and range pickers",
        peers: "@mui/x-date-pickers",
      },
      {
        name: "@fabric-kit/tree-view",
        what: "The free tree view, styled",
        peers: "@mui/x-tree-view",
      },
    ],
  },
  {
    group: "Pages and app kits",
    packages: [
      {
        name: "@fabric-kit/patterns",
        what: "List, detail, form, settings and dashboard pages",
        peers: "@mui/x-data-grid, react-hook-form",
      },
      { name: "@fabric-kit/layout", what: "App shell, sidebar, top bar", peers: "none" },
      { name: "@fabric-kit/global-search", what: "A search palette", peers: "@mui/x-data-grid" },
      { name: "@fabric-kit/chatbot", what: "A streaming assistant", peers: "none" },
      { name: "@fabric-kit/versioning", what: "Version history", peers: "@mui/lab" },
      {
        name: "@fabric-kit/canvas-builder",
        what: "A workflow canvas",
        peers: "@xyflow/react, react-dnd",
      },
    ],
  },
];

export function App() {
  const [screen, setScreen] = useState<(typeof SCREENS)[number]["id"]>("admin");
  const current = SCREENS.find((s) => s.id === screen) ?? SCREENS[0];

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <div className="desk">
          <section className="hero" aria-labelledby="hero-title">
            <div className="container">
              <p className="news">
                <strong className="news__label">{WHATS_NEW.label}</strong>
                <span>{WHATS_NEW.text}</span>
                <a href={ROADMAP_URL}>See the roadmap</a>
              </p>
            </div>
            <div className="container hero__inner">
              <h1 id="hero-title">MUI, with the app already built.</h1>
              <div className="hero__side">
                <p className="lead">
                  A free, open-source design system and app kits for MUI. Start a new app with one
                  command.
                </p>
                <InstallCommand command={CREATE_COMMAND} />
                <div className="hero__links">
                  <a className="btn btn--quiet" href={EXAMPLE_APP_URL}>
                    Open the example app
                  </a>
                  <a className="btn btn--quiet" href={docsUrl("examples-starter-app--overview")}>
                    What the starter includes
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="showcase" aria-label="Analytics dashboard built with Fabric">
            <div className="container">
              <Sheet label="Live analytics dashboard built with Fabric" height={680}>
                <AnalyticsDashboard />
              </Sheet>
              <p className="caption">
                A live analytics screen: FabricDashboardPage with stat cards, an area and a pie
                chart, and FabricDatagrid, on sample data. Click the sidebar or refresh.
              </p>
              <a className="btn btn--quiet" href={EXAMPLE_APP_URL}>
                Open the full example app
              </a>
            </div>
          </section>
        </div>

        <section className="switcher" aria-labelledby="switcher-title">
          <div className="container">
            <div className="head">
              <h2 id="switcher-title">Four more screens, same parts</h2>
              <div className="groove" role="tablist" aria-label="Concept screens">
                {SCREENS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`tab-${s.id}`}
                    aria-selected={s.id === screen}
                    aria-controls="screen-panel"
                    className="groove__stop"
                    onClick={() => setScreen(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div id="screen-panel" role="tabpanel" aria-labelledby={`tab-${current.id}`}>
              <Sheet
                label={`Live ${current.label.toLowerCase()} built with Fabric`}
                height={600}
                key={current.id}
              >
                <current.Screen />
              </Sheet>
              <p className="caption">{current.caption}</p>
            </div>
          </div>
        </section>

        <section className="compare" aria-labelledby="compare-title">
          <div className="container">
            <div className="head head--split">
              <h2 id="compare-title">Same JSX, better defaults</h2>
              <p className="lead">
                Plain MUI components. On the right, they sit inside Fabric’s provider.
              </p>
            </div>
            <div className="compare__pair">
              <figure className="compare__side">
                <div className="compare__frame compare__frame--plain">
                  <ClientOnly>
                    <ThemeProvider theme={plainMui}>
                      <InviteForm />
                    </ThemeProvider>
                  </ClientOnly>
                </div>
                <figcaption>MUI’s default theme</figcaption>
              </figure>
              <figure className="compare__side">
                <div className="compare__frame">
                  <ClientOnly>
                    <InviteForm />
                  </ClientOnly>
                </div>
                <figcaption>With Fabric</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="packages" aria-labelledby="packages-title">
          <div className="container packages__inner">
            <div className="head">
              <h2 id="packages-title">Install only what you use</h2>
              <p className="lead">
                Every package is MIT licensed and built on free MUI packages. No license key.
              </p>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Package</th>
                  <th scope="col">What you get</th>
                  <th scope="col">Extra peers</th>
                </tr>
              </thead>
              {PACKAGE_GROUPS.map(({ group, packages }) => (
                <tbody key={group}>
                  <tr className="table__group">
                    <th scope="colgroup" colSpan={3}>
                      {group}
                    </th>
                  </tr>
                  {packages.map((p) => (
                    <tr key={p.name}>
                      <th scope="row">
                        <code>{p.name}</code>
                      </th>
                      <td>{p.what}</td>
                      <td className="table__peers">{p.peers}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section className="needs" aria-labelledby="needs-title">
          <div className="container">
            <h2 id="needs-title" className="visually-hidden">
              Requirements
            </h2>
            <dl className="rows">
              <div className="rows__row">
                <dt>Works with</dt>
                <dd>Vite, Next.js and any React setup MUI supports.</dd>
              </div>
              <div className="rows__row">
                <dt>Needs</dt>
                <dd>React 18 or 19, MUI 9 and Emotion 11.</dd>
              </div>
              <div className="rows__row">
                <dt>Costs</dt>
                <dd>Nothing. MIT, no license key.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="board" aria-labelledby="close-title">
          <div className="container board__inner">
            <div>
              <h2 id="close-title" className="board__title">
                Already have an MUI app?
              </h2>
              <p className="board__lead">
                Add the theme and the components, then only the packages you need. Your existing MUI
                code picks up the new look.
              </p>
              <InstallCommand tone="board" />
              <a className="btn btn--card" href={docsUrl("foundations-installation--docs")}>
                Installation guide
              </a>
            </div>
            <Sheet
              label="Live version history built with Fabric"
              height={520}
              className="sheet--board"
            >
              <VersionScreen />
            </Sheet>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer__statement">
            Fabric is free and open source, under the MIT license.
          </p>
          <ul className="footer__links">
            <li>
              <a href={docsUrl()}>Documentation</a>
            </li>
            <li>
              <a href={EXAMPLE_APP_URL}>Example app</a>
            </li>
            <li>
              <a href={GITHUB_URL}>Source on GitHub</a>
            </li>
            <li>
              <a href={NPM_URL}>Packages on npm</a>
            </li>
            <li>
              <a href={`${GITHUB_URL}/blob/main/LICENSE`}>License</a>
            </li>
          </ul>
          <p className="footer__legal">
            Built on MUI, which is not affiliated with Fabric. Icons are Google’s Material Symbols.
          </p>
        </div>
      </footer>
    </>
  );
}
