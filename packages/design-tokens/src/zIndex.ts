export const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  sticky: 10,
  fab: 950,
  dropdown: 1000,
  speedDial: 950,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1300,
  popover: 1400,
  tooltip: 1500,
  overlay: 9999,
} as const;

export type ZIndex = typeof zIndex;
