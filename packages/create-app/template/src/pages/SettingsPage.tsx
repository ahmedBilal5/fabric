import { FabricSwitch, FabricToggleButtonGroup, useToast } from "@fabric-kit/components";
import {
  FabricForm,
  FabricFormActions,
  FabricFormRow,
  FabricFormTextField,
  zodResolver,
} from "@fabric-kit/forms";
import NotificationsOutlined from "@fabric-kit/icons/NotificationsOutlined";
import PaletteOutlined from "@fabric-kit/icons/PaletteOutlined";
import PersonOutlined from "@fabric-kit/icons/PersonOutlined";
import { FabricSettingsGroup, FabricSettingsPage, FabricSettingsRow } from "@fabric-kit/patterns";
import { useSafeThemeMode } from "@fabric-kit/theme";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "../router";
import { routePath } from "../routes";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.email("Enter an email address like name@example.com."),
});
type Profile = z.infer<typeof profileSchema>;

function Profile() {
  const toast = useToast();
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Jane Doe", email: "jane@example.com" },
    mode: "onTouched",
  });
  return (
    <FabricSettingsGroup title="Personal details">
      <FabricForm
        form={form}
        aria-label="Personal details"
        errorSummary={false}
        gap="xlsm"
        onSubmit={async (values) => {
          form.reset(values);
          toast({ title: "Profile saved", severity: "success" });
        }}
        sx={{ py: 2.5 }}
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
        <FabricFormActions disableUntilDirty onCancel={() => form.reset()} />
      </FabricForm>
    </FabricSettingsGroup>
  );
}

function Appearance() {
  const mode = useSafeThemeMode();
  return (
    <FabricSettingsGroup title="Theme">
      <FabricSettingsRow label="Mode" description="System follows your device's setting.">
        <FabricToggleButtonGroup
          aria-label="Mode"
          size="small"
          value={mode?.mode ?? "system"}
          onChange={(_, value) => value && mode?.setMode(value)}
          disabled={!mode}
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

function Notifications() {
  const [digest, setDigest] = useState(true);
  return (
    <FabricSettingsGroup title="Email">
      <FabricSettingsRow
        label="Weekly digest"
        description="A summary of your projects every Monday."
        htmlFor="digest"
      >
        <FabricSwitch id="digest" checked={digest} onChange={() => setDigest((v) => !v)} />
      </FabricSettingsRow>
    </FabricSettingsGroup>
  );
}

const SECTIONS = [
  { id: "profile", label: "Profile", icon: <PersonOutlined />, content: <Profile /> },
  { id: "appearance", label: "Appearance", icon: <PaletteOutlined />, content: <Appearance /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationsOutlined />,
    content: <Notifications />,
  },
];

/** A settings page: sections on the left, groups of rows on the right. */
export function SettingsPage({ section }: { section?: string }) {
  const { navigate } = useRouter();
  return (
    <FabricSettingsPage
      title="Settings"
      sections={SECTIONS}
      section={SECTIONS.find((s) => s.id === section)?.id ?? "profile"}
      onSectionChange={(id) =>
        navigate(routePath({ name: "settings", section: id }), { replace: true })
      }
    />
  );
}
