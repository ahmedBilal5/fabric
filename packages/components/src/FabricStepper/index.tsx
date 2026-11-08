/**
 * FabricStepper — the design-system stepper / wizard rail.
 *
 * Data-driven wrapper over MUI `Stepper`. Accepts a `steps` array where each
 * item carries a `label`, optional `description`, `icon`, `completed`,
 * `disabled`, `error`, and (for vertical orientation) `content`, so you don't
 * wire MUI Step / StepLabel / StepContent by hand.
 *
 * Preserves MUI Stepper props (`nonLinear`, `connector`, `alternativeLabel`,
 * `orientation`, `elevation`, `sx`). `content` on a step only renders when
 * `orientation="vertical"` (matches MUI's own behavior for `StepContent`).
 *
 * If you need full compositional
 * control (custom StepButton, StepIcon, animated connectors) can compose
 * MUI parts directly; MUI Stepper and Step are re-exported from
 * `@fabric-kit/components`.
 *
 * --- Look ---
 * Steps render a 32px circle that is blue with a dot for
 * the current step, green-tinted with a check for completed steps, and grey
 * with a dot for steps not reached yet. Error steps keep a red tint with an
 * exclamation mark. Labels sit under the icons on horizontal steppers
 * (`alternativeLabel` defaults to `true`) and use heading/xs, and a 1px line
 * joins the icons. A step's own `icon` or `StepIconComponent` still wins.
 *
 * @example
 * ```tsx
 * <FabricStepper
 *   activeStep={step}
 *   steps={[
 *     { label: 'Cart' },
 *     { label: 'Address' },
 *     { label: 'Payment' },
 *     { label: 'Review' },
 *   ]}
 * />
 * ```
 */

import {
  border,
  dark,
  fontWeight,
  iconSize,
  radii,
  spacing,
  status,
  stepper,
  text,
  textVariant,
} from "@fabric-kit/design-tokens";
import CheckIcon from "@fabric-kit/icons/Check";
import CircleIcon from "@fabric-kit/icons/Circle";
import PriorityHighIcon from "@fabric-kit/icons/PriorityHigh";
import {
  Step,
  StepButton,
  StepContent,
  type StepIconProps,
  StepLabel,
  Stepper,
  type StepperProps,
} from "@mui/material";
import { type SxProps, styled, type Theme } from "@mui/material/styles";
import { type ElementType, forwardRef, memo, type ReactNode } from "react";

export interface FabricStepItem {
  /** Displayed label. Widened to `ReactNode`. */
  label: ReactNode;
  /** Optional description under the label (vertical) or below the label (horizontal + `alternativeLabel`). */
  description?: ReactNode;
  /** Custom step icon. Overrides the default step icon. */
  icon?: ReactNode;
  /**
   * Custom step-icon component that receives `StepIconProps` (`active`,
   * `completed`, `error`, `icon`). Use for state-aware icons; use `icon` for
   * a static node.
   */
  StepIconComponent?: ElementType<StepIconProps>;
  /** Rendered inside `<StepContent>` for vertical orientation. Ignored horizontally. */
  content?: ReactNode;
  /** Mark this step as completed. */
  completed?: boolean;
  /** Disable interaction on this step. */
  disabled?: boolean;
  /** Show the step in an error state (red icon, error text). */
  error?: boolean;
  /** `sx` forwarded to the underlying `<StepLabel>`. */
  labelSx?: SxProps<Theme>;
  /** Optional stable React key. Falls back to array index. */
  key?: string | number;
}

export interface FabricStepperProps extends Omit<StepperProps, "children"> {
  /** Ordered steps. */
  steps: FabricStepItem[];
  /** Called when a step label is clicked. When set, each step is rendered as a `StepButton`. */
  onStepClick?: (index: number) => void;
  /**
   * Put each label under its icon. Pass `false` for labels beside the
   * icons. Ignored for `orientation="vertical"`.
   * @default true
   */
  alternativeLabel?: boolean;
}

/** Colors one scheme needs to paint the stepper. */
interface StepperSchemeColors {
  current: string;
  dot: string;
  checkedBg: string;
  check: string;
  disabledBg: string;
  label: string;
  line: string;
}

const LIGHT: StepperSchemeColors = {
  current: "var(--mui-palette-primary-main)",
  dot: text.inverse,
  checkedBg: stepper.checkedBg,
  check: status.success,
  disabledBg: stepper.disabledBg,
  label: stepper.label,
  line: border.default,
};

const DARK: StepperSchemeColors = {
  current: "var(--mui-palette-primary-main)",
  dot: dark.text.inverse,
  checkedBg: dark.stepper.checkedBg,
  check: dark.status.success,
  disabledBg: dark.stepper.disabledBg,
  label: dark.stepper.label,
  line: dark.border.default,
};

// Step icon: 32px circle with 4px padding around a 24px glyph.
const STEP_ICON_SIZE = iconSize["3xl"];
const STEP_ICON_HALF = STEP_ICON_SIZE / 2;

type StepIconState = "current" | "checked" | "disabled" | "error";

/** Fill and glyph color per state (current / completed / not reached / error). */
function stepIconColors(state: StepIconState, c: StepperSchemeColors) {
  switch (state) {
    case "current":
      return { backgroundColor: c.current, color: c.dot };
    case "checked":
      return { backgroundColor: c.checkedBg, color: c.check };
    // The theme's semantic error tint keeps failed steps visible.
    case "error":
      return {
        backgroundColor: "var(--mui-palette-semantic-error-bg)",
        color: "var(--mui-palette-semantic-error-main)",
      };
    default:
      return { backgroundColor: c.disabledBg, color: c.dot };
  }
}

const StepIconRoot = styled("span", {
  shouldForwardProp: (prop) => prop !== "iconState",
})<{ iconState: StepIconState }>(({ theme, iconState }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  width: STEP_ICON_SIZE,
  height: STEP_ICON_SIZE,
  padding: spacing.xs,
  borderRadius: radii.full,
  ...stepIconColors(iconState, LIGHT),
  ...theme.applyStyles("dark", stepIconColors(iconState, DARK)),
  // Check and exclamation at 16px; the dot at 12px draws a 10px dot.
  "& .MuiSvgIcon-root": { fontSize: iconSize.sm },
  "& .FabricStepIcon-dot": { fontSize: iconSize.xs },
}));

/** Default step icon. A custom node passed as a step's `icon` renders as-is, like MUI's own. */
function FabricStepIcon({ active, completed, error, icon, className }: StepIconProps) {
  if (icon !== undefined && typeof icon !== "number" && typeof icon !== "string") {
    return <>{icon}</>;
  }
  const state: StepIconState = error
    ? "error"
    : completed
      ? "checked"
      : active
        ? "current"
        : "disabled";
  return (
    <StepIconRoot className={className} iconState={state}>
      {state === "checked" ? (
        <CheckIcon />
      ) : state === "error" ? (
        <PriorityHighIcon />
      ) : (
        <CircleIcon className="FabricStepIcon-dot" />
      )}
    </StepIconRoot>
  );
}

// Labels: heading/xs, capitalized, 4px under the icon. Steps get 8px padding, and the connector
// runs through the icon centers from one icon edge to the next. Vertical steppers center their
// connector and content rail on the 32px icon.
const stepperLayoutSx = {
  "& .MuiStepLabel-label": {
    ...textVariant.headingXs,
    textTransform: "capitalize",
    "&.Mui-active, &.Mui-completed": { fontWeight: fontWeight.semiBold },
    "&.MuiStepLabel-alternativeLabel": { marginTop: `${spacing.xs}px` },
  },
  "& .MuiStep-alternativeLabel": { padding: `${spacing.sm}px` },
  "& .MuiStepConnector-alternativeLabel": {
    top: spacing.sm + STEP_ICON_HALF,
    left: `calc(-50% + ${STEP_ICON_HALF}px)`,
    right: `calc(50% + ${STEP_ICON_HALF}px)`,
  },
  "& .MuiStepConnector-vertical": { marginLeft: `${STEP_ICON_HALF}px` },
  "& .MuiStepContent-root": { marginLeft: `${STEP_ICON_HALF}px`, paddingLeft: `${spacing.xl}px` },
} as const;

// One label color for every state, so the active / completed selectors are listed to
// outrank MUI's own state colors.
const stepperColors = (c: StepperSchemeColors) => ({
  "& .MuiStepLabel-label, & .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: c.label,
  },
  "& .MuiStepConnector-line": { borderColor: c.line },
  "& .MuiStepContent-root": { borderLeftColor: c.line },
});

const stepperColorSx = (theme: Theme) => ({
  ...stepperColors(LIGHT),
  ...theme.applyStyles("dark", stepperColors(DARK)),
  "& .MuiStepLabel-label.Mui-error": { color: "var(--mui-palette-semantic-error-main)" },
});

const FabricStepperImpl = forwardRef<HTMLDivElement, FabricStepperProps>(function FabricStepper(
  { steps, onStepClick, orientation = "horizontal", alternativeLabel, sx, ...rest },
  ref,
) {
  const isVertical = orientation === "vertical";
  return (
    <Stepper
      ref={ref}
      orientation={orientation}
      alternativeLabel={alternativeLabel ?? !isVertical}
      sx={[stepperLayoutSx, stepperColorSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    >
      {steps.map((step, index) => {
        const key = step.key ?? index;
        const iconProp = step.icon ? { icon: step.icon } : {};
        const label = (
          <StepLabel
            error={step.error}
            optional={step.description}
            slots={{ stepIcon: step.StepIconComponent ?? FabricStepIcon }}
            sx={step.labelSx}
            {...iconProp}
          >
            {step.label}
          </StepLabel>
        );
        return (
          <Step key={key} completed={step.completed} disabled={step.disabled}>
            {onStepClick ? (
              <StepButton
                onClick={() => onStepClick(index)}
                optional={step.description}
                icon={step.icon}
              >
                {label}
              </StepButton>
            ) : (
              label
            )}
            {isVertical && step.content ? <StepContent>{step.content}</StepContent> : null}
          </Step>
        );
      })}
    </Stepper>
  );
});

FabricStepperImpl.displayName = "FabricStepper";

export const FabricStepper = memo(FabricStepperImpl);
