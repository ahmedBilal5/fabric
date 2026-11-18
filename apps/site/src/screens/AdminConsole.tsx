import {
  FabricActivityFeed,
  FabricAvatar,
  FabricButton,
  FabricConfirmProvider,
  FabricStatus,
  FabricSwitch,
  FabricToastProvider,
  useConfirm,
  useToast,
} from "@fabric-kit/components";
import type { GridColDef } from "@fabric-kit/datagrid";
import PersonAddOutlined from "@fabric-kit/icons/PersonAddOutlined";
import {
  FabricDetailPage,
  type FabricFilterDef,
  FabricListPage,
  useFilterParams,
} from "@fabric-kit/patterns";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import Link from "@mui/material/Link";
import { useMemo, useState } from "react";

type Role = "Owner" | "Admin" | "Editor" | "Viewer";
type Status = "Active" | "Invited" | "Suspended";

type Member = {
  id: number;
  name: string;
  email: string;
  role: Role;
  twoFactor: boolean;
  status: Status;
  lastActive: Date;
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

// Sample data for the screen.
const MEMBERS: Member[] = [
  ["Jane Doe", "Owner", true, "Active", 0],
  ["Marcus Lee", "Admin", true, "Active", 0],
  ["Priya Shah", "Editor", false, "Active", 1],
  ["Ana Torres", "Viewer", false, "Invited", 3],
  ["Sam Okafor", "Editor", true, "Suspended", 21],
  ["Mia Lund", "Editor", true, "Active", 2],
  ["Tom Becker", "Viewer", false, "Active", 6],
  ["Lena Fischer", "Admin", true, "Active", 1],
  ["Ravi Patel", "Editor", false, "Invited", 4],
  ["Chloe Martin", "Viewer", true, "Active", 9],
].map(([name, role, twoFactor, status, days], i) => ({
  id: i + 1,
  name: name as string,
  email: `${(name as string).split(" ")[0].toLowerCase()}@acme.example`,
  role: role as Role,
  twoFactor: twoFactor as boolean,
  status: status as Status,
  lastActive: daysAgo(days as number),
}));

const STATUS = { Active: "success", Invited: "queued", Suspended: "cancelled" } as const;
const ROLES: Role[] = ["Owner", "Admin", "Editor", "Viewer"];

const FILTERS: FabricFilterDef[] = [
  {
    id: "role",
    label: "Role",
    multiple: true,
    options: ROLES.map((r) => ({ value: r, label: r })),
  },
  {
    id: "status",
    label: "Status",
    options: (Object.keys(STATUS) as Status[]).map((s) => ({ value: s, label: s })),
  },
];

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** A team admin screen: FabricListPage for the members, FabricDetailPage for one member. */
export function AdminConsole() {
  return (
    <FabricConfirmProvider>
      <FabricToastProvider>
        <Team />
      </FabricToastProvider>
    </FabricConfirmProvider>
  );
}

function Team() {
  const [members, setMembers] = useState(MEMBERS);
  const [openId, setOpenId] = useState<number | null>(null);
  // Filters live in state here, so the landing page's own URL stays put.
  const [params, setParams] = useState(() => new URLSearchParams());
  const filters = useFilterParams(FILTERS, {
    adapter: useMemo(() => ({ params, setParams }), [params]),
  });
  const confirm = useConfirm();
  const toast = useToast();

  const update = (id: number, change: Partial<Member>) =>
    setMembers((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));

  const open = members.find((m) => m.id === openId);
  if (open) return <MemberPage member={open} onBack={() => setOpenId(null)} onChange={update} />;

  const roles = filters.values.role as string[] | undefined;
  const status = filters.values.status as string | undefined;
  const q = filters.search.trim().toLowerCase();
  const rows = members.filter(
    (m) =>
      (!q || `${m.name} ${m.email}`.toLowerCase().includes(q)) &&
      (!roles?.length || roles.includes(m.role)) &&
      (!status || m.status === status),
  );

  const columns: GridColDef<Member>[] = [
    {
      field: "name",
      display: "flex",
      headerName: "Member",
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) => (
        <FabricInline gap="sm" align="center" sx={{ minWidth: 0 }}>
          <FabricAvatar name={row.name} size="md" />
          <FabricStack sx={{ minWidth: 0, lineHeight: 1.4 }}>
            <Link
              component="button"
              type="button"
              onClick={() => setOpenId(row.id)}
              sx={{ fontWeight: 500, textAlign: "left", color: "text.primary" }}
            >
              {row.name}
            </Link>
            <FabricText textVariant="bodySm" color="text.secondary" truncate>
              {row.email}
            </FabricText>
          </FabricStack>
        </FabricInline>
      ),
    },
    { field: "role", headerName: "Role", width: 100 },
    {
      field: "twoFactor",
      display: "flex",
      headerName: "Two-factor",
      width: 110,
      renderCell: ({ row }) => (
        <FabricSwitch
          size="small"
          checked={row.twoFactor}
          slotProps={{ input: { "aria-label": `Two-factor for ${row.name}` } }}
          onChange={(_, checked) => update(row.id, { twoFactor: checked })}
        />
      ),
    },
    {
      field: "status",
      display: "flex",
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => <FabricStatus status={STATUS[row.status]} label={row.status} />,
    },
  ];

  return (
    <FabricListPage<Member>
      title="Team"
      headerProps={{ titleComponent: "h3" }}
      description="Who can sign in to Acme, and what they can do."
      primaryAction={
        <FabricButton variant="contained" startIcon={<PersonAddOutlined />}>
          Invite member
        </FabricButton>
      }
      filterBar={{
        filters: FILTERS,
        values: filters.values,
        onValuesChange: filters.setValues,
        search: filters.search,
        onSearchChange: filters.setSearch,
        onClearAll: filters.clear,
        searchPlaceholder: "Search members",
      }}
      rows={rows}
      columns={columns}
      noun={["member", "members"]}
      bulkActions={(ids, clear) => (
        <FabricButton
          variant="outlined"
          size="small"
          color="error"
          onClick={async () => {
            const n = ids.length;
            const ok = await confirm({
              title: `Suspend ${n} ${n === 1 ? "member" : "members"}?`,
              description: "They can't sign in until you reactivate them.",
              confirmLabel: "Suspend",
              danger: true,
            });
            if (!ok) return;
            setMembers((list) =>
              list.map((m) => (ids.includes(m.id) ? { ...m, status: "Suspended" } : m)),
            );
            clear();
            toast({ title: `Suspended ${n} ${n === 1 ? "member" : "members"}` });
          }}
        >
          Suspend
        </FabricButton>
      )}
      gridProps={{ rowHeight: 60, hideFooter: true }}
      sx={{ p: 3 }}
    />
  );
}

function MemberPage({
  member,
  onBack,
  onChange,
}: {
  member: Member;
  onBack: () => void;
  onChange: (id: number, change: Partial<Member>) => void;
}) {
  const toast = useToast();
  const suspended = member.status === "Suspended";
  return (
    <FabricDetailPage
      title={member.name}
      titleComponent="h3"
      onBack={onBack}
      backLabel="Back to team"
      status={<FabricStatus status={STATUS[member.status]} label={member.status} />}
      meta={`${member.role} · ${member.email}`}
      actions={
        <FabricButton
          variant="outlined"
          onClick={() => {
            onChange(member.id, { status: suspended ? "Active" : "Suspended" });
            toast({ title: suspended ? `Reactivated ${member.name}` : `Suspended ${member.name}` });
          }}
        >
          {suspended ? "Reactivate" : "Suspend"}
        </FabricButton>
      }
      summary={[
        { label: "Email", value: member.email, copyable: true },
        { label: "Role", value: member.role },
        { label: "Two-factor", value: member.twoFactor ? "On" : "Off" },
        { label: "Last active", value: day.format(member.lastActive) },
      ]}
      sections={[
        {
          value: "activity",
          label: "Activity",
          content: (
            <FabricActivityFeed
              dense
              dayHeadingComponent="h4"
              items={[
                {
                  id: 1,
                  actor: { name: member.name },
                  action: "signed in from",
                  target: "Berlin, DE",
                  date: member.lastActive,
                },
                {
                  id: 2,
                  actor: { name: "Jane Doe" },
                  action: "changed the role to",
                  target: member.role,
                  date: daysAgo(30),
                },
                {
                  id: 3,
                  actor: { name: "Jane Doe" },
                  action: "invited",
                  target: member.name,
                  date: daysAgo(64),
                },
              ]}
            />
          ),
        },
        {
          value: "security",
          label: "Security",
          content: (
            <FabricSwitch
              label="Require two-factor sign-in"
              checked={member.twoFactor}
              onChange={(_, checked) => onChange(member.id, { twoFactor: checked })}
            />
          ),
        },
      ]}
      sx={{ p: 3 }}
    />
  );
}
