import {
  FabricButton,
  FabricConfirmProvider,
  FabricSelect,
  FabricSwitch,
  FabricToastProvider,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import {
  FabricForm,
  FabricFormActions,
  FabricFormRow,
  FabricFormTextField,
  zodResolver,
} from "@fabric-kit/forms";
import { spacing } from "@fabric-kit/design-tokens";
import CreditCardIcon from "@fabric-kit/icons/CreditCard";
import NotificationsIcon from "@fabric-kit/icons/Notifications";
import PersonIcon from "@fabric-kit/icons/Person";
import SecurityIcon from "@fabric-kit/icons/Security";
import SettingsIcon from "@fabric-kit/icons/Settings";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { z } from "zod";
import { FabricSettingsGroup, FabricSettingsPage, FabricSettingsRow } from "../src";

const meta = {
  title: "Patterns/Settings page",
  component: FabricSettingsPage,
  tags: ["test"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <FabricConfirmProvider>
        <FabricToastProvider>
          <Story />
        </FabricToastProvider>
      </FabricConfirmProvider>
    ),
  ],
} satisfies Meta<typeof FabricSettingsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

const profileSchema = z.object({
  firstName: z.string().min(1, "Enter a first name."),
  lastName: z.string().min(1, "Enter a last name."),
  email: z.email("Enter an email address like name@example.com."),
  title: z.string(),
});
type Profile = z.infer<typeof profileSchema>;

function ProfileSettings() {
  const toast = useToast();
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "Priya", lastName: "Patel", email: "priya@northwind.example.com", title: "Head of Operations" },
    mode: "onTouched",
  });
  return (
    <FabricSettingsGroup title="Personal details" description="Shown to your team on comments and assignments.">
      <FabricForm
        form={form}
        errorSummary={false}
        gap="xlsm"
        onSubmit={async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          form.reset(v);
          toast({ title: "Profile saved" });
        }}
        sx={{ py: `${spacing.xlsm}px` }}
      >
        <FabricFormRow>
          <FabricFormTextField<Profile> name="firstName" label="First name" />
          <FabricFormTextField<Profile> name="lastName" label="Last name" />
        </FabricFormRow>
        <FabricFormRow>
          <FabricFormTextField<Profile> name="email" label="Email" type="email" />
          <FabricFormTextField<Profile> name="title" label="Job title" helperText="Optional" />
        </FabricFormRow>
        <FabricFormActions disableUntilDirty onCancel={() => form.reset()} />
      </FabricForm>
    </FabricSettingsGroup>
  );
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState({ mentions: true, assigned: true, weekly: false, product: false });
  const [digest, setDigest] = useState("daily");
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <>
      <FabricSettingsGroup title="Email" description="Changes save as you make them.">
        <FabricSettingsRow label="Mentions" description="Someone mentions you in a comment." htmlFor="n-mentions">
          <FabricSwitch id="n-mentions" checked={prefs.mentions} onChange={() => toggle("mentions")} />
        </FabricSettingsRow>
        <FabricSettingsRow label="Assigned to you" description="A record is assigned to you or your team." htmlFor="n-assigned">
          <FabricSwitch id="n-assigned" checked={prefs.assigned} onChange={() => toggle("assigned")} />
        </FabricSettingsRow>
        <FabricSettingsRow label="Weekly summary" description="Activity across your workspace, every Monday." htmlFor="n-weekly">
          <FabricSwitch id="n-weekly" checked={prefs.weekly} onChange={() => toggle("weekly")} />
        </FabricSettingsRow>
        <FabricSettingsRow label="Product news" description="New features and tips. About once a month." htmlFor="n-product">
          <FabricSwitch id="n-product" checked={prefs.product} onChange={() => toggle("product")} />
        </FabricSettingsRow>
      </FabricSettingsGroup>
      <FabricSettingsGroup title="In the app">
        <FabricSettingsRow label="Notification digest" description="Bundle notifications instead of showing each one.">
          <FabricSelect
            aria-label="Notification digest"
            value={digest}
            onChange={(e) => setDigest(String(e.target.value))}
            options={[
              { value: "off", label: "Show each one" },
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
            ]}
            sx={{ minWidth: 180 }}
          />
        </FabricSettingsRow>
      </FabricSettingsGroup>
    </>
  );
}

function SecuritySettings() {
  const confirm = useConfirm();
  const toast = useToast();
  return (
    <>
      <FabricSettingsGroup title="Sign-in">
        <FabricSettingsRow label="Password" description="Last changed 3 months ago.">
          <FabricButton variant="outlined">Change password</FabricButton>
        </FabricSettingsRow>
        <FabricSettingsRow label="Two-step verification" description="A code from your phone each time you sign in.">
          <FabricButton variant="contained">Turn on</FabricButton>
        </FabricSettingsRow>
      </FabricSettingsGroup>
      <FabricSettingsGroup title="Danger zone" description="These can't be undone." danger>
        <FabricSettingsRow label="Sign out everywhere" description="Ends every session except this one.">
          <FabricButton
            variant="outlined"
            color="error"
            onClick={async () => {
              if (await confirm({ title: "Sign out of every other device?", confirmLabel: "Sign out", danger: true }))
                toast({ title: "Signed out of 3 other devices" });
            }}
          >
            Sign out everywhere
          </FabricButton>
        </FabricSettingsRow>
        <FabricSettingsRow label="Delete account" description="Removes your account and personal data from Northwind.">
          <FabricButton variant="contained" color="error">
            Delete account
          </FabricButton>
        </FabricSettingsRow>
      </FabricSettingsGroup>
    </>
  );
}

const sections = [
  { id: "profile", label: "Profile", icon: <PersonIcon />, description: "Your name and contact details.", content: <ProfileSettings /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationsIcon />,
    description: "Choose what you hear about, and how.",
    content: <NotificationSettings />,
  },
  { id: "security", label: "Security", icon: <SecurityIcon />, description: "Sign-in and sessions.", content: <SecuritySettings /> },
  {
    id: "billing",
    label: "Billing",
    icon: <CreditCardIcon />,
    description: "Plan, seats and invoices.",
    content: (
      <FabricSettingsGroup title="Plan">
        <FabricSettingsRow label="Growth · 48 seats" description="Renews on 1 January 2027 for $13,824.">
          <FabricButton variant="outlined">Change plan</FabricButton>
        </FabricSettingsRow>
      </FabricSettingsGroup>
    ),
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: <SettingsIcon />,
    content: (
      <FabricSettingsGroup title="Region">
        <FabricSettingsRow label="Data region" description="Where your data is stored. Contact support to move it." stacked>
          <span>European Union (Frankfurt)</span>
        </FabricSettingsRow>
      </FabricSettingsGroup>
    ),
  },
];

/** A section list on the left; each section's settings in groups of rows. */
export const Default: Story = {
  args: { title: "Settings", sections },
  render: () => <FabricSettingsPage title="Settings" description="Manage your account and preferences." sections={sections} />,
};

/** Settings that save as you change them, grouped into cards. */
export const Notifications: Story = {
  render: () => <FabricSettingsPage title="Settings" sections={sections} section="notifications" />,
  args: { title: "Settings", sections },
};

/** A danger zone group for actions that can't be undone. */
export const DangerZone: Story = {
  render: () => <FabricSettingsPage title="Settings" sections={sections} section="security" />,
  args: { title: "Settings", sections },
};

/** Clicking a section shows it and moves focus to its heading; arrow keys move through the list. */
export const Navigation: Story = {
  args: { title: "Settings", sections },
  render: () => <FabricSettingsPage title="Settings" sections={sections} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Settings sections" });
    await userEvent.click(within(nav).getByRole("button", { name: "Notifications" }));
    await waitFor(() => expect(canvas.getByRole("heading", { level: 2, name: "Notifications" })).toHaveFocus());
    await expect(within(nav).getByRole("button", { name: "Notifications" })).toHaveAttribute("aria-current", "page");
    within(nav).getByRole("button", { name: "Notifications" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(nav).getByRole("button", { name: "Security" })).toHaveFocus();
  },
};

/** On phones the section list scrolls sideways above the content and rows stack. */
export const Mobile: Story = {
  args: { title: "Settings", sections },
  render: () => <FabricSettingsPage title="Settings" sections={sections} section="notifications" />,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
