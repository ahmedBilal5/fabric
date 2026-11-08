export const panelWidth = {
  narrow: 309,
  standard: 340,
  wide: 400,
} as const;

export const drawerWidth = {
  mobileMax: "85vw",
} as const;

export const dialogWidth = {
  sm: 480,
  md: 700,
  lg: 800,
} as const;

export const containerWidth = {
  content: 1200,
  page: 1440,
} as const;

export type PanelWidth = typeof panelWidth;
export type DrawerWidth = typeof drawerWidth;
export type DialogWidth = typeof dialogWidth;
export type ContainerWidth = typeof containerWidth;
