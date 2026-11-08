import { Box, ButtonBase } from "@mui/material";
import { renderDateViewCalendar } from "@mui/x-date-pickers/dateViewRenderers";
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";

type DateRendererProps = Parameters<typeof renderDateViewCalendar>[0];
type TimeRendererProps = Parameters<typeof renderMultiSectionDigitalClockTimeView>[0];

/** Width of one time column; the readout and headings use the same pitch. */
const COLUMN = 44;

function Panel({
  title,
  column,
  children,
}: {
  title: string;
  /** Grid column inside the date + time layout; omit when the panel stands alone. */
  column?: number;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gridColumn: column,
        px: column === 1 ? 0 : "8px",
        my: column === 1 ? 0 : "6px",
      }}
    >
      <Box
        sx={{
          height: 32,
          p: "4px",
          fontSize: 14,
          lineHeight: "24px",
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        {title}
      </Box>
      {children}
    </Box>
  );
}

/** One `H : M : S` style row aligned with the time columns. */
function ColumnRow({
  cells,
  bold,
  trailing,
}: {
  cells: string[];
  bold?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: 38,
        fontSize: bold ? 16 : 14,
        lineHeight: "32px",
        fontWeight: bold ? 600 : 400,
        color: bold ? "text.primary" : "text.secondary",
      }}
    >
      {cells.map((cell, index) => (
        <Box
          key={cell + String(index)}
          sx={{ position: "relative", width: COLUMN, textAlign: "center" }}
        >
          {cell}
          {index < cells.length - 1 && (
            <Box component="span" sx={{ position: "absolute", right: -3 }}>
              :
            </Box>
          )}
        </Box>
      ))}
      {trailing}
    </Box>
  );
}

/** Date panel: heading above the calendar. */
export function renderDatePanel(props: DateRendererProps) {
  // The layout's own `sx` (grid column, 336px height cap) is replaced by the panel's.
  return (
    <Panel title="Date" column={1}>
      {renderDateViewCalendar({ ...props, sx: undefined })}
    </Panel>
  );
}

/** Time panel: `00 : 00 : 00` readout with AM/PM, `H : M : S` headings, then the columns. */
export function renderTimePanel(props: TimeRendererProps) {
  return <TimePanel {...props} column={3} />;
}

/** Same `Time` panel for the standalone time picker (no surrounding grid). */
export function renderStandaloneTimePanel(props: TimeRendererProps) {
  return <TimePanel {...props} />;
}

function TimePanel({ column, ...props }: TimeRendererProps & { column?: number }) {
  const { value, onChange, ampm, views } = props;
  const current = value as Dayjs | null;
  const withSeconds = views.includes("seconds");
  const format = [ampm ? "hh" : "HH", "mm", ...(withSeconds ? ["ss"] : [])];
  const isPm = current ? current.hour() >= 12 : false;

  const setMeridiem = (pm: boolean) => {
    if (pm === isPm) return;
    const base = current ?? dayjs().startOf("day");
    onChange?.(pm ? base.add(12, "hour") : base.subtract(12, "hour"), "partial");
  };

  const meridiemToggle = ampm ? (
    <Box sx={{ display: "flex", gap: "7px", ml: 1 }}>
      {(["AM", "PM"] as const).map((meridiem) => {
        const active = (meridiem === "PM") === isPm;
        return (
          <ButtonBase
            key={meridiem}
            onClick={() => setMeridiem(meridiem === "PM")}
            aria-pressed={active}
            sx={{
              fontSize: 16,
              lineHeight: "24px",
              fontWeight: active ? 600 : 400,
              color: active ? "text.primary" : "text.disabled",
            }}
          >
            {meridiem}
          </ButtonBase>
        );
      })}
    </Box>
  ) : null;

  return (
    <Panel title="Time" column={column}>
      <ColumnRow
        bold
        cells={format.map((token) => (current ? current.format(token) : "00"))}
        trailing={meridiemToggle}
      />
      <ColumnRow cells={withSeconds ? ["H", "M", "S"] : ["H", "M"]} />
      {renderMultiSectionDigitalClockTimeView({
        ...props,
        // The AM/PM toggle in the readout replaces MUI's meridiem column.
        // MUI centers the clock with auto margins; the readout above is left-aligned.
        sx: {
          margin: 0,
          ...(ampm && {
            "& .MuiMultiSectionDigitalClockSection-root:last-child": { display: "none" },
          }),
        },
        views: views.filter((view) => view !== "meridiem"),
      })}
    </Panel>
  );
}
