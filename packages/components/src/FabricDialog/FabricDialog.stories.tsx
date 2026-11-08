import AddIcon from "@fabric-kit/icons/Add";
import ArrowForwardIcon from "@fabric-kit/icons/ArrowForward";
import CloudUploadIcon from "@fabric-kit/icons/CloudUpload";
import DeleteIcon from "@fabric-kit/icons/Delete";
import ErrorOutlinedIcon from "@fabric-kit/icons/ErrorOutlined";
import FileDownloadIcon from "@fabric-kit/icons/FileDownload";
import FileUploadIcon from "@fabric-kit/icons/FileUpload";
import InfoOutlinedIcon from "@fabric-kit/icons/InfoOutlined";
import PersonAddIcon from "@fabric-kit/icons/PersonAdd";
import ShareIcon from "@fabric-kit/icons/Share";
import WarningAmberIcon from "@fabric-kit/icons/WarningAmber";
import { Box, Stack, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { dialogWidth } from "@fabric-kit/design-tokens";
import { FabricInline, FabricText } from "@fabric-kit/primitives";
import { useState } from "react";
import { expect, fireEvent, screen, userEvent, waitFor, within } from "storybook/test";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton/FabricButton";
import { FabricCheckbox } from "../FabricCheckbox";
import { FabricChip } from "../FabricChip";
import { FabricRadioGroup } from "../FabricRadioGroup";
import { FabricTextField } from "../FabricTextField/FabricTextField";
import { FabricDialog, type FabricDialogAction } from "./FabricDialog";

const meta = {
  title: "Components/FabricDialog",
  component: FabricDialog,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Design-system modal dialog. Extends MUI `Dialog` (the full `DialogProps` surface) " +
          "and adds a data-driven `actions` API, first-class `title` / `subtitle` / `titleIcon` slots, " +
          "and an optional `confirmDelete` mode that gates the destructive action behind typing " +
          '"DELETE". The theme owns the 8px panel, ' +
          "shadow, title typography and body / footer padding, while the component owns the bordered " +
          "close button and the tinted `titleIconTone` circle. Every dimension routes through " +
          "`@fabric-kit/design-tokens`. `onClose` preserves MUI's " +
          "`(event, reason) => void` signature so consumers can distinguish backdrop dismissal " +
          "from explicit close. ARIA linkage is wired automatically via `useId()`: the dialog root " +
          "gets `aria-labelledby` on the title and `aria-describedby` on the subtitle. " +
          "`confirmDelete` is uncontrolled by default and switches to controlled when both " +
          "`deleteConfirmValue` and `onDeleteConfirmValueChange` are set.",
      },
    },
  },
  argTypes: {
    maxWidth: {
      control: "select",
      options: [false, "xs", "sm", "md", "lg", "xl"],
    },
    fullWidth: { control: "boolean" },
    closable: { control: "boolean" },
    dividers: { control: "boolean" },
    confirmDelete: { control: "boolean" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function useToggle(initial = false) {
  const [open, setOpen] = useState(initial);
  return {
    open,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
  };
}

// Dialog width is left to you; these examples use the `dialogWidth.md` token.
const EXAMPLE_WIDTH_SX = { width: "100%", maxWidth: dialogWidth.md } as const;

// A dark round CTA, using the app-shell press color from the palette.
const NAVY_ROUND_CTA_SX = {
  minWidth: 0,
  backgroundColor: "var(--mui-palette-appShell-press)",
  "&:hover": { backgroundColor: "var(--mui-palette-appShell-press)", opacity: 0.9 },
  "&.Mui-disabled": { backgroundColor: "var(--mui-palette-action-disabledBackground)" },
} as const;

// These examples end with a single round arrow button; the X in the header acts as cancel.
const arrowAction = (
  label: string,
  onClick: () => void,
  disabled = false,
): FabricDialogAction => ({
  "aria-label": label,
  onClick,
  disabled,
  variant: "contained",
  shape: "round",
  sx: NAVY_ROUND_CTA_SX,
  children: <ArrowForwardIcon />,
});

// ─── Basics ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => {
    const t = useToggle();
    const actions: FabricDialogAction[] = [
      { label: "Cancel", onClick: t.onClose, variant: "outlined" },
      { label: "Save", onClick: t.onClose, variant: "contained" },
    ];
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open dialog</FabricButton>
        <FabricDialog
          {...args}
          open={t.open}
          onClose={t.onClose}
          title="Save changes"
          subtitle="Review the pending edits before applying."
          actions={actions}
        >
          <Typography variant="body2">
            Any unsaved edits to the current record will be persisted.
          </Typography>
        </FabricDialog>
      </>
    );
  },
  args: {
    fullWidth: true,
    maxWidth: "sm",
    closable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open dialog/i }));
    // Dialog is rendered in a Portal, so query the global screen.
    await expect(await screen.findByRole("dialog", { name: /save changes/i })).toBeInTheDocument();
  },
};

export const WithTitleIcon: Story = {
  name: "With title icon",
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open with icon</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Upload dataset"
          subtitle="CSV, JSON, and Parquet supported."
          titleIcon={<CloudUploadIcon color="primary" />}
          fullWidth
          maxWidth="sm"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            { label: "Upload", onClick: t.onClose, variant: "contained" },
          ]}
        >
          <Typography variant="body2">Drop files here or click to browse.</Typography>
        </FabricDialog>
      </>
    );
  },
};

// ─── Message dialogs ──────────────────────────────────────────────────

export const GeneralMessage: Story = {
  name: "General message",
  parameters: {
    docs: {
      description: {
        story:
          '`titleIconTone="info"` draws the blue circle; ' +
          "the footer carries a single round, icon-only primary action.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open general message</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="General message"
          titleIcon={<InfoOutlinedIcon />}
          titleIconTone="info"
          actions={[arrowAction("Continue", t.onClose)]}
        >
          <FabricText textVariant="bodyLg">
            Your changes have been saved. You can continue working or close this window.
          </FabricText>
        </FabricDialog>
      </>
    );
  },
};

export const DualConfirmation: Story = {
  name: "Revoke access (dual confirmation)",
  parameters: {
    docs: {
      description: {
        story:
          '`titleIconTone="attention"` draws the orange circle. The typed ' +
          "confirmation is a plain text field (not `confirmDelete`), so any phrase can gate the " +
          "action. The round arrow stays disabled until the phrase matches.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    const [phrase, setPhrase] = useState("");
    const close = () => {
      setPhrase("");
      t.onClose();
    };
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open dual confirmation</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={close}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Revoke access"
          titleIcon={<ErrorOutlinedIcon />}
          titleIconTone="attention"
          actions={[
            arrowAction("Confirm revoke", close, phrase.trim().toUpperCase() !== "REVOKE"),
          ]}
        >
          <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
            <FabricText textVariant="bodyLg">
              You're about to revoke an admin. Confirm this action to proceed. Changes will be
              logged for security and accountability.
            </FabricText>
            <FabricChip label="muhammad.chambs@companyname.com" />
            <FabricTextField
              fullWidth
              required
              size="small"
              label='Type "Revoke" To Remove Access'
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
            />
          </Stack>
        </FabricDialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open dual confirmation/i }));
    const dialog = await screen.findByRole("dialog", { name: /revoke access/i });
    await expect(within(dialog).getByRole("button", { name: /confirm revoke/i })).toBeDisabled();
    await fireEvent.change(within(dialog).getByLabelText(/type "revoke"/i), {
      target: { value: "revoke" },
    });
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: /confirm revoke/i })).toBeEnabled(),
    );
  },
};

export const TransferOwnership: Story = {
  name: "Transfer ownership",
  parameters: {
    docs: {
      description: {
        story:
          'Info circle, a `FabricRadioGroup` whose option labels hold a ' +
          "`FabricAvatar`, and a typed confirmation. The arrow needs both a selection and the phrase.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    const [owner, setOwner] = useState("");
    const [phrase, setPhrase] = useState("");
    const close = () => {
      setOwner("");
      setPhrase("");
      t.onClose();
    };
    const person = (name: string) => (
      <FabricInline gap="sm">
        <FabricAvatar name={name} size="xs" />
        <span>{name}</span>
      </FabricInline>
    );
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open transfer ownership</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={close}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Transfer ownership"
          titleIcon={<InfoOutlinedIcon />}
          titleIconTone="info"
          actions={[
            arrowAction(
              "Confirm transfer",
              close,
              !owner || phrase.trim().toUpperCase() !== "TRANSFER",
            ),
          ]}
        >
          <Stack spacing={2}>
            <FabricText textVariant="bodyLg">
              Confirms with two-factor authentication, and finalizes the handover with all changes
              securely logged
            </FabricText>
            <FabricRadioGroup
              aria-label="New owner"
              value={owner}
              onValueChange={setOwner}
              options={[
                { value: "jon-1", label: person("Jon Doe") },
                { value: "jon-2", label: person("Jane Doe") },
              ]}
            />
            <FabricTextField
              fullWidth
              required
              size="small"
              label='Type "Transfer" To Make Admin Owner'
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
            />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const ActionPills: Story = {
  name: "Title with action pills",
  parameters: {
    docs: {
      description: {
        story:
          'An attention dialog. Two small round pill buttons sit inside the body, above a ' +
          "required label field.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open action pills</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Title"
          titleIcon={<ErrorOutlinedIcon />}
          titleIconTone="attention"
          actions={[arrowAction("Continue", t.onClose)]}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <FabricText textVariant="bodyLg" sx={{ alignSelf: "flex-start" }}>
              Enter the message here regarding the action
            </FabricText>
            <FabricInline gap="sm">
              <FabricButton variant="outlined" shape="round" size="small">
                Action
              </FabricButton>
              <FabricButton variant="contained" shape="round" size="small" sx={NAVY_ROUND_CTA_SX}>
                Action
              </FabricButton>
            </FabricInline>
            <FabricTextField fullWidth required size="small" label="Label" />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const WithCheckbox: Story = {
  name: "Title with checkbox",
  parameters: {
    docs: {
      description: {
        story: 'An attention dialog with a `FabricCheckbox` above a required label field.',
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open with checkbox</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Title"
          titleIcon={<ErrorOutlinedIcon />}
          titleIconTone="attention"
          actions={[arrowAction("Continue", t.onClose)]}
        >
          <Stack spacing={2}>
            <FabricText textVariant="bodyLg">Enter the message here regarding the action</FabricText>
            <FabricCheckbox label="Label" />
            <FabricTextField fullWidth required size="small" label="Label" />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

// ─── Form dialogs: plain primary icon, no tinted circle ──────────────────

export const AddMember: Story = {
  name: "Add member",
  parameters: {
    docs: {
      description: {
        story:
          'Form dialogs use a plain primary-coloured icon (no `titleIconTone`). ' +
          "The body holds an Upload button, a template download link and an email field.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open add member</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Add member"
          titleIcon={<PersonAddIcon color="primary" />}
          actions={[arrowAction("Add", t.onClose)]}
        >
          <Stack spacing={2}>
            <FabricInline gap="sm" sx={{ justifyContent: "space-between" }}>
              <FabricButton variant="outlined" size="small" startIcon={<FileUploadIcon />}>
                Upload
              </FabricButton>
              <FabricButton variant="text" size="small" startIcon={<FileDownloadIcon />}>
                Download Format File.csv
              </FabricButton>
            </FabricInline>
            <FabricText textVariant="bodyLg">
              Enter the email of the users/members you want to add
            </FabricText>
            <FabricTextField fullWidth size="small" label="Enter Email Address" />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const Share: Story = {
  name: "Share",
  parameters: {
    docs: { description: { story: 'A plain primary icon and a single email field.' } },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open share</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Share"
          titleIcon={<ShareIcon color="primary" />}
          actions={[arrowAction("Share", t.onClose)]}
        >
          <Stack spacing={2}>
            <FabricText textVariant="bodyLg">
              Enter the email of the users/members you want to share with
            </FabricText>
            <FabricTextField fullWidth size="small" label="Enter Email Address" />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const CreateNew: Story = {
  name: "Create new",
  parameters: {
    docs: {
      description: {
        story: 'A plain primary icon, a Name field and a multi-line Description.',
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open create new</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          title="Create new"
          titleIcon={<AddIcon color="primary" />}
          actions={[arrowAction("Create", t.onClose)]}
        >
          <Stack spacing={2}>
            <FabricTextField fullWidth size="small" label="Name" />
            <FabricTextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Enter text"
            />
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const LongContent: Story = {
  name: "Long content scrolls",
  parameters: {
    docs: {
      description: {
        story:
          "Header and footer stay pinned; only the body scrolls once the content outgrows the viewport.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open long content</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          maxWidth={false}
          paperSx={EXAMPLE_WIDTH_SX}
          scroll="paper"
          title="A deliberately long dialog title that has to wrap onto a second line to prove the close button stays aligned"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            { label: "Accept", onClick: t.onClose, variant: "contained" },
          ]}
        >
          <Stack spacing={2}>
            {Array.from({ length: 20 }, (_, i) => (
              <FabricText key={i} textVariant="bodyLg">
                Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </FabricText>
            ))}
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

export const MobileFullScreen: Story = {
  name: "Mobile (full screen)",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Below the `sm` breakpoint the dialog goes full screen (`responsiveFullScreen`, default on) " +
          "and drops its rounded corners.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open on mobile</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Mobile dialog"
          actions={[{ label: "Done", onClick: t.onClose, variant: "contained" }]}
        >
          <FabricText textVariant="bodyLg">Full-screen layout for small viewports.</FabricText>
        </FabricDialog>
      </>
    );
  },
};

export const WithDividers: Story = {
  name: "With dividers",
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open with dividers</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Preferences"
          dividers
          fullWidth
          maxWidth="sm"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            { label: "Apply", onClick: t.onClose, variant: "contained" },
          ]}
        >
          <Stack spacing={2}>
            <Typography variant="body2">Toggle each section.</Typography>
            <Typography variant="body2">Dividers separate header, body, and actions.</Typography>
          </Stack>
        </FabricDialog>
      </>
    );
  },
};

// ─── Confirm-delete (uncontrolled) ──────────────────────────────────────────

export const ConfirmDeleteUncontrolled: Story = {
  name: "Confirm delete — uncontrolled",
  parameters: {
    docs: {
      description: {
        story:
          "Default mode. The dialog owns the confirm-input state — the destructive action " +
          'stays disabled until the user types "DELETE" (case-insensitive, trimmed).',
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton color="error" onClick={t.onOpen}>
          Delete workspace
        </FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Delete workspace"
          subtitle="This permanently removes the workspace and its data."
          titleIcon={<WarningAmberIcon color="error" />}
          confirmDelete
          fullWidth
          maxWidth="sm"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            {
              label: "Delete",
              onClick: t.onClose,
              variant: "contained",
              color: "error",
              startIcon: <DeleteIcon />,
            },
          ]}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /delete workspace/i }));
    const dialog = await screen.findByRole("dialog", { name: /delete workspace/i });
    await expect(within(dialog).getByRole("button", { name: /^delete$/i })).toBeDisabled();
    await fireEvent.change(within(dialog).getByLabelText(/type "delete"/i), {
      target: { value: "delete" },
    });
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: /^delete$/i })).toBeEnabled(),
    );
  },
};

// ─── Confirm-delete (controlled) ────────────────────────────────────────────

export const ConfirmDeleteControlled: Story = {
  name: "Confirm delete — controlled",
  parameters: {
    docs: {
      description: {
        story:
          "Controlled mode. Pair `deleteConfirmValue` + `onDeleteConfirmValueChange` when the " +
          "confirm input has to participate in a surrounding form (react-hook-form, redux-form, " +
          "a parent-owned useReducer).",
      },
    },
  },
  render: () => {
    const t = useToggle();
    const [value, setValue] = useState("");
    return (
      <>
        <FabricButton color="error" onClick={t.onOpen}>
          Delete (controlled)
        </FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Delete record"
          confirmDelete
          deleteConfirmValue={value}
          onDeleteConfirmValueChange={setValue}
          fullWidth
          maxWidth="sm"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            {
              label: "Delete",
              onClick: () => {
                setValue("");
                t.onClose();
              },
              variant: "contained",
              color: "error",
            },
          ]}
        >
          <Typography variant="body2">Current input: {value || <em>(empty)</em>}</Typography>
        </FabricDialog>
      </>
    );
  },
};

// ─── Consumer overrides ─────────────────────────────────────────────────────

export const PaperSxOverride: Story = {
  name: "Paper style override",
  parameters: {
    docs: {
      description: {
        story:
          "Consumers override the paper visual via `paperSx` (or `slotProps.paper.sx` — either " +
          "works). Consumer keys win on collisions with the DS defaults.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open styled</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Styled paper"
          paperSx={{ borderRadius: 4, minWidth: 480 }}
          actions={[{ label: "Close", onClick: t.onClose, variant: "contained" }]}
        >
          <Typography variant="body2">
            `borderRadius: 4` overrides the DS default of 8px.
          </Typography>
        </FabricDialog>
      </>
    );
  },
};

export const NotClosable: Story = {
  name: "Not closable",
  parameters: {
    docs: {
      description: {
        story:
          "`closable={false}` hides the X button. Escape still dismisses the dialog and reports " +
          "`reason: 'escapeKeyDown'` through `onClose`.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open not closable</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          closable={false}
          title="No close button"
          actions={[{ label: "Got it", onClick: t.onClose, variant: "contained" }]}
        >
          <FabricText textVariant="bodyLg">Use the action, or press Escape.</FabricText>
        </FabricDialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open not closable/i }));
    const dialog = await screen.findByRole("dialog", { name: /no close button/i });
    await expect(within(dialog).queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

// ─── onClose reason handling ────────────────────────────────────────────────

export const OnCloseReason: Story = {
  name: "onClose(event, reason)",
  parameters: {
    docs: {
      description: {
        story:
          "FabricDialog preserves MUI's `(event, reason) => void` signature. Backdrop clicks " +
          "and Escape key presses arrive with `reason` — use it to distinguish accidental " +
          "dismissal from explicit cancel.",
      },
    },
  },
  render: () => {
    const t = useToggle();
    const [lastReason, setLastReason] = useState<string>("—");
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={(_event, reason) => {
            setLastReason(reason);
            t.onClose();
          }}
          title="Dismissal reason"
          fullWidth
          maxWidth="xs"
        >
          <Typography variant="body2">Last close reason: {lastReason}</Typography>
        </FabricDialog>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption">Last dismissal reason: {lastReason}</Typography>
        </Box>
      </>
    );
  },
};

// ─── Kitchen sink ───────────────────────────────────────────────────────────

export const KitchenSink: Story = {
  name: "Kitchen sink",
  render: () => {
    const t = useToggle();
    return (
      <>
        <FabricButton onClick={t.onOpen}>Open kitchen sink</FabricButton>
        <FabricDialog
          open={t.open}
          onClose={t.onClose}
          title="Publish changes"
          subtitle="12 updated pages will go live on your public site."
          titleIcon={<CloudUploadIcon color="primary" />}
          dividers
          fullWidth
          maxWidth="md"
          actions={[
            { label: "Cancel", onClick: t.onClose, variant: "outlined" },
            {
              label: "Review",
              onClick: t.onClose,
              variant: "outlined",
            },
            {
              label: "Publish",
              onClick: t.onClose,
              variant: "contained",
              color: "primary",
            },
          ]}
        >
          <Stack spacing={2}>
            <Typography variant="body2">Every switch below toggles a subsystem.</Typography>
            <Typography variant="body2">
              Rich content, dividers, three actions, custom icon, and semantic subtitle all coexist
              without extra config.
            </Typography>
          </Stack>
        </FabricDialog>
      </>
    );
  },
};
