import {
  FabricButton,
  FabricSelect,
  FabricSwitch,
  FabricToggleButtonGroup,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import { spacing } from "@fabric-kit/design-tokens";
import {
  FabricForm,
  FabricFormActions,
  FabricFormRow,
  FabricFormSelect,
  FabricFormTextField,
  zodResolver,
} from "@fabric-kit/forms";
import BusinessOutlined from "@fabric-kit/icons/BusinessOutlined";
import NotificationsOutlined from "@fabric-kit/icons/NotificationsOutlined";
import PaletteOutlined from "@fabric-kit/icons/PaletteOutlined";
import PersonOutlined from "@fabric-kit/icons/PersonOutlined";
import { FabricSettingsGroup, FabricSettingsPage, FabricSettingsRow } from "@fabric-kit/patterns";
import { useSafeThemeMode } from "@fabric-kit/theme";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BRANDS, type BrandName, useBrand } from "../brand";
import { useData } from "../data/store";
import { useRouter } from "../router";
import { routePath } from "../routes";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter an email address like name@example.com."),
  title: z.string(),
});
type Profile = z.infer<typeof profileSchema>;

function ProfileSection() {
  const toast = useToast();
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Jane Doe",
      email: "jane@acme.example.com",
      title: "Head of Customer Success",
    },
    mode: "onTouched",
  });
  return (
    <FabricSettingsGroup
      title="Personal details"
      description="Shown to your team on activity and assignments."
    >
      <FabricForm
        form={form}
        aria-label="Personal details"
        errorSummary={false}
        gap="xlsm"
        onSubmit={async (values) => {
          await new Promise((r) => setTimeout(r, 400));
          form.reset(values);
          toast({ title: "Profile saved", severity: "success" });
        }}
        sx={{ py: `${spacing.xlsm}px` }}
      >
        <FabricFormRow>
          <FabricFormTextField<Profile> name="name" label="Name" autoComplete="name" />
          <FabricFormTextField<Profile>
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
        </FabricFormRow>
        <FabricFormTextField<Profile> name="title" label="Job title" helperText="Optional" />
        <FabricFormActions disableUntilDirty onCancel={() => form.reset()} />
      </FabricForm>
    </FabricSettingsGroup>
  );
}

const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Enter a workspace name."),
  currency: z.string(),
  weekStart: z.string(),
});
type Workspace = z.infer<typeof workspaceSchema>;

function WorkspaceSection() {
  const toast = useToast();
  const confirm = useConfirm();
  const { reset } = useData();
  const form = useForm<Workspace>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "Acme", currency: "USD", weekStart: "monday" },
    mode: "onTouched",
  });
  return (
    <>
      <FabricSettingsGroup title="General">
        <FabricForm
          form={form}
          aria-label="Workspace"
          errorSummary={false}
          gap="xlsm"
          onSubmit={async (values) => {
            await new Promise((r) => setTimeout(r, 400));
            form.reset(values);
            toast({ title: "Workspace saved", severity: "success" });
          }}
          sx={{ py: `${spacing.xlsm}px` }}
        >
          <FabricFormTextField<Workspace> name="name" label="Workspace name" />
          <FabricFormRow>
            <FabricFormSelect<Workspace>
              name="currency"
              label="Reporting currency"
              options={[
                { value: "USD", label: "US dollar (USD)" },
                { value: "EUR", label: "Euro (EUR)" },
                { value: "GBP", label: "Pound sterling (GBP)" },
              ]}
            />
            <FabricFormSelect<Workspace>
              name="weekStart"
              label="Weeks start on"
              options={[
                { value: "monday", label: "Monday" },
                { value: "sunday", label: "Sunday" },
              ]}
            />
          </FabricFormRow>
          <FabricFormActions disableUntilDirty onCancel={() => form.reset()} />
        </FabricForm>
      </FabricSettingsGroup>
      <FabricSettingsGroup title="Danger zone" description="These can't be undone." danger>
        <FabricSettingsRow
          label="Reset the sample data"
          description="Puts back the original customers and removes your changes."
        >
          <FabricButton
            variant="outlined"
            color="error"
            onClick={async () => {
              const ok = await confirm({
                title: "Reset the sample data?",
                description: "Customers you added, edited or deleted go back to how they started.",
                confirmLabel: "Reset data",
                danger: true,
              });
              if (!ok) return;
              reset();
              toast({ title: "Sample data reset" });
            }}
          >
            Reset data
          </FabricButton>
        </FabricSettingsRow>
      </FabricSettingsGroup>
    </>
  );
}

function AppearanceSection() {
  const brand = useBrand();
  const mode = useSafeThemeMode();
  if (!brand || !mode)
    return (
      <FabricSettingsGroup
        title="Theme"
        description="Here the host sets the theme. In Storybook, use the toolbar's Theme menu and light or dark switch."
      >
        {null}
      </FabricSettingsGroup>
    );
  return (
    <FabricSettingsGroup title="Theme" description="Only for you, on this browser.">
      <FabricSettingsRow
        label="Brand"
        description="Each brand is a theme from createFabricTheme. Every page follows it."
      >
        <FabricSelect
          aria-label="Brand"
          value={brand.brand}
          onChange={(e) => brand.setBrand(e.target.value as BrandName)}
          options={BRANDS}
          sx={{ minWidth: 180 }}
        />
      </FabricSettingsRow>
      <FabricSettingsRow label="Mode" description="System follows your device's setting.">
        <FabricToggleButtonGroup
          aria-label="Mode"
          exclusive
          size="small"
          value={mode.mode}
          onChange={(_, value) => value && mode.setMode(value)}
          items={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </FabricSettingsRow>
    </FabricSettingsGroup>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({ overdue: true, trials: true, weekly: false });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <FabricSettingsGroup title="Email" description="Changes save as you make them.">
      <FabricSettingsRow
        label="Overdue invoices"
        description="A customer's invoice is a week late."
        htmlFor="n-overdue"
      >
        <FabricSwitch id="n-overdue" checked={prefs.overdue} onChange={() => toggle("overdue")} />
      </FabricSettingsRow>
      <FabricSettingsRow
        label="New trials"
        description="Someone starts a trial in your region."
        htmlFor="n-trials"
      >
        <FabricSwitch id="n-trials" checked={prefs.trials} onChange={() => toggle("trials")} />
      </FabricSettingsRow>
      <FabricSettingsRow
        label="Weekly summary"
        description="Revenue and sign-ups, every Monday."
        htmlFor="n-weekly"
      >
        <FabricSwitch id="n-weekly" checked={prefs.weekly} onChange={() => toggle("weekly")} />
      </FabricSettingsRow>
    </FabricSettingsGroup>
  );
}

const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    icon: <PersonOutlined />,
    description: "Your name and contact details.",
    content: <ProfileSection />,
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: <BusinessOutlined />,
    description: "Settings for everyone in Acme.",
    content: <WorkspaceSection />,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <PaletteOutlined />,
    description: "Brand and light or dark mode.",
    content: <AppearanceSection />,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationsOutlined />,
    description: "What we email you about.",
    content: <NotificationsSection />,
  },
];

export function SettingsPage({ section }: { section?: string }) {
  const { navigate } = useRouter();
  const current = SECTIONS.find((s) => s.id === section)?.id ?? SECTIONS[0].id;
  return (
    <FabricSettingsPage
      title="Settings"
      description="Your account and the Acme workspace."
      sections={SECTIONS}
      section={current}
      onSectionChange={(id) =>
        navigate(routePath({ name: "settings", section: id }), { replace: true })
      }
    />
  );
}
