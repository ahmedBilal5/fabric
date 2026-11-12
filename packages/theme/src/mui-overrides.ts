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

  /**
   * Neutral colors for form and navigation controls: field labels, tab text, input
   * underlines and disabled tabs. `createFabricTheme` derives them from your
   * `text` and `divider` colors when you change those, so a brand's neutrals reach
   * every control.
   */
  interface ControlPalette {
    /** Field labels, unselected tab text, picker navigation and other quiet control text. */
    label: string;
    /** Label and tab text on hover: between `text.secondary` and `text.primary`. */
    labelHover: string;
    /** Resting underline of standard and filled inputs. */
    underline: string;
    /** Fill of a disabled tab, and its text on outline tab styles. */
    disabled: string;
  }

  /** Chart colors. Charts take series colors from `categorical`, in order. */
  interface ChartPalette {
    /** Series colors in a fixed order. Keep eight or fewer and validate a new set for color-blind readers. */
    categorical: string[];
  }

  interface Palette {
    chart: ChartPalette;
    semantic: SemanticPalette;
    control: ControlPalette;
    appShell: AppShellPalette;
    datagrid: DatagridPalette;
  }

  interface PaletteOptions {
    /** Chart colors. A `categorical` list you pass replaces Fabric's whole list. */
    chart?: Partial<ChartPalette>;
    semantic?: SemanticPalette;
    /** Merged onto Fabric's control colors by `createFabricTheme`, so set only what you change. */
    control?: Partial<ControlPalette>;
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
