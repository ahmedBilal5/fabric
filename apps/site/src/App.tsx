import { FormControlLabel, MenuItem, Button as MuiButton, Switch, TextField } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { ClientOnly } from "./ClientOnly";
import { Finder } from "./Finder";
import {
  CREATE_COMMAND,
  docsUrl,
  EXAMPLE_APP_URL,
  GITHUB_URL,
  INSTALL_COMMAND,
  NPM_URL,
} from "./links";
import { AdminConsole } from "./screens/AdminConsole";
import { AnalyticsDashboard } from "./screens/AnalyticsDashboard";
import { AssistantScreen } from "./screens/AssistantScreen";
import { Sheet } from "./screens/Sheet";
import { VersionScreen } from "./screens/VersionScreen";
import { WorkflowBuilder } from "./screens/WorkflowBuilder";

const plainMui = createTheme();

function Wordmark() {
  return (
    <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="Fabric home">
      <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true">
        <g className="wordmark__weft">
          <rect x="6" y="12" width="36" height="6" rx="3" />
          <rect x="6" y="21" width="36" height="6" rx="3" />
          <rect x="6" y="30" width="36" height="6" rx="3" />
        </g>
        <g className="wordmark__warp">
          <rect x="12" y="6" width="6" height="36" rx="3" />
          <rect x="21" y="6" width="6" height="36" rx="3" />
          <rect x="30" y="6" width="6" height="36" rx="3" />
        </g>
        <g className="wordmark__weft">
          <rect x="10" y="12" width="10" height="6" />
          <rect x="28" y="12" width="10" height="6" />
          <rect x="19" y="21" width="10" height="6" />
          <rect x="10" y="30" width="10" height="6" />
          <rect x="28" y="30" width="10" height="6" />
        </g>
      </svg>
      Fabric
    </a>
  );
}

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
    caption: "FabricActionBar, FabricTabs, FabricDatagrid, FabricAvatar and FabricSwitch.",
    Screen: AdminConsole,
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

const PACKAGES = [
  {
    name: "@fabric-kit/theme",
    what: "Light and dark themes, plus your brand",
    peers: "@mui/material",
  },
  {
    name: "@fabric-kit/components",
    what: "MUI components, better defaults",
    peers: "@mui/lab, @mui/x-date-pickers",
  },
  { name: "@fabric-kit/layout", what: "App shell, sidebar, top bar", peers: "none" },
  { name: "@fabric-kit/datagrid", what: "The free data grid, styled", peers: "@mui/x-data-grid" },
  { name: "@fabric-kit/global-search", what: "A search palette", peers: "@mui/x-data-grid" },
  { name: "@fabric-kit/chatbot", what: "A streaming assistant", peers: "none" },
  { name: "@fabric-kit/versioning", what: "Version history", peers: "none" },
  {
    name: "@fabric-kit/canvas-builder",
    what: "A workflow canvas",
    peers: "@xyflow/react, react-dnd",
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
      <header className="nav">
        <div className="container nav__inner">
          <Wordmark />
          <Finder />
          <nav aria-label="Primary" className="nav__links">
            <a href={EXAMPLE_APP_URL}>Example app</a>
            <a href={docsUrl()}>Docs</a>
            <a href={GITHUB_URL}>GitHub</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <div className="desk">
          <section className="hero" aria-labelledby="hero-title">
            <div className="container hero__inner">
              <h1 id="hero-title">MUI, with the app already built.</h1>
              <div className="hero__side">
                <p className="lead">A free, open-source design system and app kits for MUI.</p>
                <InstallCommand />
                <a className="btn btn--quiet" href={docsUrl("foundations-installation--docs")}>
                  Installation guide
                </a>
              </div>
            </div>
          </section>

          <section className="showcase" aria-label="Analytics dashboard built with Fabric">
            <div className="container">
              <Sheet label="Live analytics dashboard built with Fabric" height={680}>
                <AnalyticsDashboard />
              </Sheet>
              <p className="caption">
                A live analytics screen: FabricAppShell, FabricCard and FabricDatagrid with sample
                data. Click the sidebar.
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
              <h2 id="switcher-title">Three more screens, same parts</h2>
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
              <tbody>
                {PACKAGES.map((p) => (
                  <tr key={p.name}>
                    <th scope="row">
                      <code>{p.name}</code>
                    </th>
                    <td>{p.what}</td>
                    <td className="table__peers">{p.peers}</td>
                  </tr>
                ))}
              </tbody>
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
                Start with one command
              </h2>
              <p className="board__lead">
                A new app with the theme, the app shell and a dashboard, list, detail, form and
                settings page.
              </p>
              <InstallCommand tone="board" command={CREATE_COMMAND} />
              <a className="btn btn--card" href={docsUrl("examples-starter-app--overview")}>
                What the starter includes
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
