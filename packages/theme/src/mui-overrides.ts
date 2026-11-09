import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    "2xl": true;
  }

  interface SemanticStateColor {
    main: string;
    bg: string;
    /** Darker shade of `main` for text on `bg`. Only defined for states that have a dedicated text color. */
    text?: string;
  }

  interface SemanticPalette {
    queued: SemanticStateColor;
    running: SemanticStateColor;
    success: SemanticStateColor;
    warning: SemanticStateColor;
    cancelled: SemanticStateColor;
    error: SemanticStateColor;
    suspended: SemanticStateColor;
    archived: SemanticStateColor;
    unknown: SemanticStateColor;
  }

  /** App-shell colors not covered by the core palette. */
  interface AppShellPalette {
    /** Item labels, item icons and top-bar action icons. */
    text: string;
    /** Side-bar toggle hover. */
    hover: string;
    /** Side-bar toggle press. */
    press: string;
    /** Closed side-bar toggle fills. */
    toggleBg: string;
    toggleBgHover: string;
    toggleBgPress: string;
    /** Notification count pill. */
    badgeBg: string;
  }

  /** Data grid colors not covered by the core palette. */
  interface DatagridPalette {
    /** Column header fill. */
    headerBg: string;
    /** Line between rows. */
    rowLine: string;
    /** Line above the footer. */
    footerLine: string;
    /** "No data available" text and icon. */
    emptyText: string;
  }

  interface Palette {
    semantic: SemanticPalette;
    appShell: AppShellPalette;
    datagrid: DatagridPalette;
  }

  interface PaletteOptions {
    semantic?: SemanticPalette;
    /** Merged onto Fabric's app-shell colors by `createFabricTheme`, so set only what you change. */
    appShell?: Partial<AppShellPalette>;
    /** Merged onto Fabric's data grid colors by `createFabricTheme`, so set only what you change. */
    datagrid?: Partial<DatagridPalette>;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    /** Solid saturated fill with inverse text. */
    filledAlt: true;
  }

  interface ChipPropsColorOverrides {
    queued: true;
    running: true;
    cancelled: true;
    suspended: true;
    archived: true;
    unknown: true;
  }
}
