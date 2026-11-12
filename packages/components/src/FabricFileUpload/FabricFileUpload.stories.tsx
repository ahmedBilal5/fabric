import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  FabricFileUpload,
  type FabricFileUploadProps,
  type FabricUploadContext,
  type FabricUploadFile,
  useFileUpload,
} from ".";

const meta = {
  title: "Components/FabricFileUpload",
  component: FabricFileUpload,
  tags: ["test"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FabricFileUpload>;
export default meta;
type Story = StoryObj;

/** Pretend upload: reports progress; files with "fail" in the name fail. */
function fakeUpload(file: File, { onProgress, signal }: FabricUploadContext) {
  return new Promise<{ id: string }>((resolve, reject) => {
    let p = 0;
    const timer = setInterval(() => {
      p += 0.25;
      onProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        if (file.name.includes("fail")) reject(new Error("The server rejected this file."));
        else resolve({ id: file.name });
      }
    }, 150);
    signal.addEventListener("abort", () => clearInterval(timer));
  });
}

const saved: FabricUploadFile[] = [
  { id: "1", name: "Northwind order form (signed).pdf", size: 482_133, type: "application/pdf", status: "done" },
  { id: "2", name: "warehouse-photo.jpg", size: 2_340_000, type: "image/jpeg", status: "uploading", progress: 0.45 },
  {
    id: "3",
    name: "tax-certificate-2026.pdf",
    size: 120_400,
    type: "application/pdf",
    status: "error",
    error: "The server rejected this file.",
    file: new File(["x"], "tax-certificate-2026.pdf", { type: "application/pdf" }),
  },
];

function Live(props: Partial<FabricFileUploadProps> & { initialFiles?: FabricUploadFile[] }) {
  const { initialFiles, ...rest } = props;
  const uploads = useFileUpload({ upload: fakeUpload, initialFiles });
  return (
    <Box sx={{ maxWidth: 520 }}>
      <FabricFileUpload
        label="Attachments"
        {...rest}
        files={uploads.files}
        onAdd={uploads.add}
        onRemove={uploads.remove}
        onRetry={uploads.retry}
      />
    </Box>
  );
}

/** Drag files in or click to browse. Uploads run through `useFileUpload`. */
export const Default: Story = {
  render: () => <Live accept=".pdf,image/*" maxSize={10_000_000} maxFiles={5} />,
};

/** Uploaded, uploading and failed files. */
export const FileStates: Story = {
  render: () => <Live initialFiles={saved} accept=".pdf,image/*" maxSize={10_000_000} />,
};

/** A compact Choose files button, for tight spaces. */
export const ButtonVariant: Story = {
  render: () => <Live variant="button" accept=".csv" multiple={false} label="Import file" />,
};

/** Error and disabled. */
export const States: Story = {
  render: () => (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Live error helperText="Add the signed order form." accept=".pdf" />
      <Live disabled initialFiles={[saved[0]]} />
    </Box>
  ),
};

/** Long names are cut with an ellipsis; the full name is in the tooltip. */
export const LongContent: Story = {
  render: () => (
    <Live
      initialFiles={[
        {
          id: "a",
          name: "Northwind Traders – master services agreement – countersigned by legal – final v7 (1).pdf",
          size: 9_812_000,
          type: "application/pdf",
          status: "done",
        },
      ]}
    />
  ),
};

/** Files that break the rules are refused with a reason; good ones upload. */
export const RulesAndUpload: Story = {
  render: () => <Live accept=".pdf" maxSize={1_000_000} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(
      input,
      [
        new File(["%PDF"], "order-form.pdf", { type: "application/pdf" }),
        new File(["img"], "photo.png", { type: "image/png" }),
      ],
      { applyAccept: false },
    );
    await expect(await canvas.findByText("photo.png isn't an allowed file type.")).toBeVisible();
    await waitFor(() => expect(canvas.getByText("Uploaded")).toBeVisible(), { timeout: 3000 });
    await userEvent.click(canvas.getByRole("button", { name: "Remove order-form.pdf" }));
    await expect(canvas.queryByText("order-form.pdf")).not.toBeInTheDocument();
  },
};

/** A failed upload can be retried. */
export const RetryFailed: Story = {
  render: () => <Live />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(["x"], "will-fail.pdf", { type: "application/pdf" }));
    await waitFor(() => expect(canvas.getByText("The server rejected this file.")).toBeVisible(), {
      timeout: 3000,
    });
    await userEvent.click(canvas.getByRole("button", { name: "Retry will-fail.pdf" }));
    await expect(canvas.getByText(/Uploading/)).toBeVisible();
  },
};
