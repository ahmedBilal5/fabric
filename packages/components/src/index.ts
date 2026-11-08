// Full MUI surface — consumers import everything from this package

export type {
  FabricDatePickerProps,
  FabricDatePickerValue,
  FabricDateRange,
  FabricDateRangePickerProps,
  FabricTimePickerProps,
  FabricTimePickerValue,
} from "@fabric-kit/date-picker";
export { FabricDatePicker, FabricDateRangePicker, FabricTimePicker } from "@fabric-kit/date-picker";
// MUI Lab passthrough for Timeline family (no design-system wrapper yet).
export {
  Timeline as FabricTimeline,
  TimelineConnector as FabricTimelineConnector,
  TimelineContent as FabricTimelineContent,
  TimelineDot as FabricTimelineDot,
  TimelineItem as FabricTimelineItem,
  TimelineSeparator as FabricTimelineSeparator,
} from "@mui/lab";
// Fabric-prefixed aliases for raw MUI shells. Kits and consumers should reach
// for these instead of the bare MUI names so every symbol at a call site starts
// with `Fabric`.
export {
  Box as FabricBox,
  FormControlLabel as FabricFormControlLabel,
  FormGroup as FabricFormGroup,
  InputAdornment as FabricInputAdornment,
  List as FabricList,
  // Raw MUI ListItem passthrough — `FabricListItem` type name is owned by
  // FabricListItemSimple's props interface.
  ListItem as FabricRawListItem,
  ListItemAvatar as FabricListItemAvatar,
  ListItemText as FabricListItemText,
  // Raw MUI RadioGroup passthrough for children-based composition; keeps the
  // `FabricRadioGroup` name for the options-API design-system wrapper.
  RadioGroup as FabricRawRadioGroup,
} from "@mui/material";
export type {
  FabricAccordionLeafProps,
  FabricAccordionLevel,
  FabricAccordionProps,
  FabricAccordionVariant,
} from "./FabricAccordion";
export { FabricAccordion, FabricAccordionLeaf } from "./FabricAccordion";
export type {
  FabricActionBarHeading,
  FabricActionBarProps,
} from "./FabricActionBar";
export { FabricActionBar } from "./FabricActionBar";
export type {
  FabricAlertProps,
  FabricAlertSubVariant,
  FabricAlertVariant,
  FabricInformationBarProps,
  FabricInformationBarVariant,
} from "./FabricAlert";
export { FabricAlert, FabricInformationBar } from "./FabricAlert";
export type { FabricAutocompleteProps } from "./FabricAutocomplete";
export { FabricAutocomplete } from "./FabricAutocomplete";
export type {
  FabricAvatarAppearance,
  FabricAvatarProps,
  FabricAvatarSize,
} from "./FabricAvatar";
export { FabricAvatar } from "./FabricAvatar";
export type {
  FabricAvatarGroupProps,
  FabricAvatarItem,
} from "./FabricAvatarGroup";
export { FabricAvatarGroup } from "./FabricAvatarGroup";
export type { FabricBadgeProps } from "./FabricBadge";
export { FabricBadge } from "./FabricBadge";
export type {
  FabricBreadcrumbItem,
  FabricBreadcrumbsProps,
} from "./FabricBreadcrumbs";
export { FabricBreadcrumbs } from "./FabricBreadcrumbs";
export type { FabricButtonMenuItem, FabricButtonProps } from "./FabricButton";
// Fabric component layer: MUI components with Fabric defaults and extra features
export { FabricButton } from "./FabricButton";
export type { FabricCardProps, FabricCardTint } from "./FabricCard";
export { FabricCard } from "./FabricCard";
export type { FabricCardHeaderProps } from "./FabricCard/FabricCardHeader";
export { FabricCardHeader } from "./FabricCard/FabricCardHeader";
export type { FabricCardRow, FabricCardRowsProps } from "./FabricCard/FabricCardRows";
export { FabricCardRows } from "./FabricCard/FabricCardRows";
export type { FabricCheckboxProps } from "./FabricCheckbox";
export { FabricCheckbox } from "./FabricCheckbox";
export type { CheckboxGroupProps } from "./FabricCheckboxGroup";
export { CheckboxGroup } from "./FabricCheckboxGroup";
export type { FabricChipProps } from "./FabricChip";
export { FabricChip } from "./FabricChip";
export type { FabricCircularProgressProps } from "./FabricCircularProgress";
export { FabricCircularProgress } from "./FabricCircularProgress";
export type { FabricDialogAction, FabricDialogProps } from "./FabricDialog/FabricDialog";
export { FabricDialog } from "./FabricDialog/FabricDialog";
export type { FabricDividerProps } from "./FabricDivider";
export { FabricDivider } from "./FabricDivider";
export type { FabricDrawerProps } from "./FabricDrawer";
export { FabricDrawer } from "./FabricDrawer";
export type {
  FabricGridDirection,
  FabricGridOffset,
  FabricGridProps,
  FabricGridSize,
  FabricGridSpacing,
  FabricGridWrap,
} from "./FabricGrid";
export { FabricGrid } from "./FabricGrid";
export type {
  FabricIconButtonColor,
  FabricIconButtonProps,
  FabricIconButtonSemanticColor,
  FabricIconButtonShape,
  FabricIconButtonVariant,
} from "./FabricIconButton";
export { FabricIconButton } from "./FabricIconButton";
export type {
  FabricListItem,
  FabricListItemSimpleProps,
} from "./FabricListItemSimple";
export { FabricListItemSimple } from "./FabricListItemSimple";
export type { FabricMenuItem, FabricMenuProps } from "./FabricMenu";
export { FabricMenu } from "./FabricMenu";
export type { FabricMenuButtonProps } from "./FabricMenuButton";
export { FabricMenuButton } from "./FabricMenuButton";
export type { FabricPaginationProps } from "./FabricPagination";
export { FabricPagination } from "./FabricPagination";
export type {
  FabricProgressChipProps,
  FabricProgressChipStatus,
} from "./FabricProgressChip";
export { FabricProgressChip } from "./FabricProgressChip";
export type { FabricRadioProps } from "./FabricRadio";
export { FabricRadio } from "./FabricRadio";
export type {
  FabricRadioGroupProps,
  RadioGroupVariant,
  RadioOption,
} from "./FabricRadioGroup";
export { FabricRadioGroup } from "./FabricRadioGroup";
export type { FabricSelectProps, SelectOption } from "./FabricSelect";
export { FabricSelect } from "./FabricSelect";
export type {
  FabricSkeletonProps,
  FabricSkeletonVariant,
} from "./FabricSkeleton";
export { FabricSkeleton } from "./FabricSkeleton";
export type { FabricSnackbarProps } from "./FabricSnackbar";
export { FabricSnackbar } from "./FabricSnackbar";
export type { FabricStepItem, FabricStepperProps } from "./FabricStepper";
export { FabricStepper } from "./FabricStepper";
export type { FabricSwitchProps } from "./FabricSwitch";
export { FabricSwitch } from "./FabricSwitch";
export type { FabricTabItem, FabricTabsAppearance, FabricTabsProps } from "./FabricTabs";
export { FabricTabs } from "./FabricTabs";
export type { FabricTagColor, FabricTagProps, FabricTagVariant } from "./FabricTag";
export { FabricTag } from "./FabricTag";
export type { FabricTextFieldProps } from "./FabricTextField/FabricTextField";
export { FabricTextField } from "./FabricTextField/FabricTextField";
export type {
  FabricToggleButtonGroupProps,
  FabricToggleItem,
} from "./FabricToggleButtonGroup";
export { FabricToggleButtonGroup } from "./FabricToggleButtonGroup";
export type { FabricTooltipProps } from "./FabricTooltip";
export { FabricTooltip } from "./FabricTooltip";
// Explicit named re-exports for x-date-pickers so they shadow the older API
// surface that @mui/lab used to expose under the same names.
export {
  AdapterMoment,
  AdapterMoment as FabricAdapterMoment,
  DatePicker,
  DatePicker as FabricMomentDatePicker,
  LocalizationProvider,
  LocalizationProvider as FabricLocalizationProvider,
  TimePicker,
  TimePicker as FabricMomentTimePicker,
} from "./mui/date-pickers";
export * from "./mui/material";
export * from "./mui/styles";

// Icons are available via '@fabric-kit/icons'
