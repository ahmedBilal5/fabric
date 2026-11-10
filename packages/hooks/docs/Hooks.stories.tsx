import {
  FabricButton,
  FabricChip,
  FabricDialog,
  FabricSwitch,
  FabricTextField,
} from "@fabric-kit/components";
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  formatHotkey,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  useClipboard,
  useDebounce,
  useDisclosure,
  useHotkeys,
  useLocalStorage,
  useRelativeTime,
} from "@fabric-kit/hooks";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Foundations/Hooks and formatting",
  tags: ["test"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CUSTOMERS = ["Acme", "Northwind", "Contoso", "Globex", "Initech", "Umbrella", "Hooli"];

export const Disclosure: Story = {
  render: function Render() {
    const dialog = useDisclosure();
    return (
      <>
        <FabricButton variant="outlined" onClick={dialog.onOpen}>
          Open details
        </FabricButton>
        <FabricDialog
          open={dialog.open}
          onClose={dialog.onClose}
          title="Invoice INV-1042"
          content="Due 12 March 2026 · Acme"
          actions={[{ label: "Close", variant: "outlined", onClick: dialog.onClose }]}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open details" }));
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  },
};

export const Debounce: Story = {
  render: function Render() {
    const [query, setQuery] = useState("");
    const debounced = useDebounce(query, 300);
    const results = useMemo(
      () => CUSTOMERS.filter((c) => c.toLowerCase().includes(debounced.toLowerCase())),
      [debounced],
    );
    return (
      <FabricStack gap="md" sx={{ maxWidth: 360 }}>
        <FabricTextField
          label="Search customers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FabricText variant="body2" color="text.secondary">
          Filtering for “{debounced}” · {results.length} found
        </FabricText>
        <FabricInline gap="xs">
          {results.map((c) => (
            <FabricChip key={c} label={c} />
          ))}
        </FabricInline>
      </FabricStack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Search customers"), "nor");
    // The filter waits until typing stops.
    await waitFor(() => expect(canvas.getByText("Filtering for “nor” · 1 found")).toBeVisible());
  },
};

export const Hotkeys: Story = {
  render: function Render() {
    const [count, setCount] = useState(0);
    useHotkeys("mod+k", () => setCount((c) => c + 1));
    return (
      <FabricStack gap="sm">
        <FabricText variant="body2">
          Press <kbd>{formatHotkey("mod+k")}</kbd> anywhere in this story.
        </FabricText>
        <FabricText variant="body2" color="text.secondary">
          Pressed {count} times
        </FabricText>
      </FabricStack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mod = /mac/i.test(navigator.platform) ? "Meta" : "Control";
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    await expect(await canvas.findByText("Pressed 1 times")).toBeVisible();
  },
};

export const Clipboard: Story = {
  render: function Render() {
    const { copy, copied, error } = useClipboard();
    const key = "sk_live_51Hx…9fQ2";
    return (
      <FabricInline gap="sm">
        <FabricText variant="body2" sx={{ fontFamily: "monospace" }}>
          {key}
        </FabricText>
        <FabricButton size="small" variant="outlined" onClick={() => copy(key)}>
          {copied ? "Copied" : "Copy"}
        </FabricButton>
        {error && (
          <FabricText variant="body2" color="error.main">
            {error.message}
          </FabricText>
        )}
      </FabricInline>
    );
  },
};

export const LocalStorage: Story = {
  render: function Render() {
    const [compact, setCompact, reset] = useLocalStorage("fabric-docs-compact", false);
    return (
      <FabricInline gap="md">
        <FabricSwitch
          label="Compact rows"
          checked={compact}
          onChange={(_e, checked) => setCompact(checked)}
        />
        <FabricButton size="small" variant="text" onClick={reset}>
          Reset
        </FabricButton>
        <FabricText variant="body2" color="text.secondary">
          Reload the page: the choice stays.
        </FabricText>
      </FabricInline>
    );
  },
};

function Ago({ minutes }: { minutes: number }) {
  const [at] = useState(() => Date.now() - minutes * 60_000);
  return <time dateTime={new Date(at).toISOString()}>{useRelativeTime(at)}</time>;
}

export const RelativeTime: Story = {
  render: () => (
    <FabricStack gap="xs">
      <FabricText variant="body2">
        Comment posted <Ago minutes={0} />
      </FabricText>
      <FabricText variant="body2">
        Invoice sent <Ago minutes={42} />
      </FabricText>
      <FabricText variant="body2">
        Account created <Ago minutes={60 * 24 * 3} />
      </FabricText>
    </FabricStack>
  ),
};

const SAMPLE_DATE = "2026-03-12T14:05:00Z";

export const Formatting: Story = {
  render: function Render() {
    const [locale, setLocale] = useState("en-US");
    const rows: [string, string][] = [
      ["formatDate(d)", formatDate(SAMPLE_DATE, "date", { locale, timeZone: "UTC" })],
      ["formatDate(d, 'datetime')", formatDate(SAMPLE_DATE, "datetime", { locale, timeZone: "UTC" })],
      ["formatRelativeTime(d − 3h)", formatRelativeTime(Date.now() - 3 * 3600_000, { locale })],
      ["formatNumber(1234567.89)", formatNumber(1234567.89, { locale })],
      ["formatNumber(1234567, compact)", formatNumber(1234567, { locale, notation: "compact" })],
      ["formatCurrency(1499.5, 'EUR')", formatCurrency(1499.5, "EUR", { locale })],
      ["formatPercent(0.256)", formatPercent(0.256, { locale })],
      ["formatFileSize(1536000)", formatFileSize(1_536_000, { locale })],
    ];
    return (
      <FabricStack gap="md">
        <FabricInline gap="xs">
          {["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP", "ar-EG"].map((l) => (
            <FabricChip
              key={l}
              label={l}
              variant={l === locale ? "filled" : "outlined"}
              onClick={() => setLocale(l)}
            />
          ))}
        </FabricInline>
        <FabricStack gap="xs" component="dl" sx={{ m: 0 }}>
          {rows.map(([call, out]) => (
            <FabricInline key={call} gap="md">
              <FabricText
                component="dt"
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "monospace", minWidth: 280 }}
              >
                {call}
              </FabricText>
              <FabricText component="dd" variant="body2" sx={{ m: 0 }}>
                {out}
              </FabricText>
            </FabricInline>
          ))}
        </FabricStack>
      </FabricStack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("€1,499.50")).toBeVisible();
    await userEvent.click(canvas.getByText("de-DE"));
    await expect(canvas.getByText("1.234.567,89")).toBeVisible();
  },
};
