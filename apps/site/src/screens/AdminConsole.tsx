import {
  FabricActionBar,
  FabricAvatar,
  FabricSwitch,
  FabricTabs,
  FabricTag,
} from "@fabric-kit/components";
import { FabricDatagrid, type GridColDef } from "@fabric-kit/datagrid";
import PersonAddOutlined from "@fabric-kit/icons/PersonAddOutlined";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import { useState } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  twoFactor: boolean;
  status: "Active" | "Invited" | "Suspended";
};

// Sample data for the concept screen.
const MEMBERS: Member[] = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane@acme.example",
    role: "Owner",
    twoFactor: true,
    status: "Active",
  },
  {
    id: 2,
    name: "Marcus Lee",
    email: "marcus@acme.example",
    role: "Admin",
    twoFactor: true,
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Shah",
    email: "priya@acme.example",
    role: "Editor",
    twoFactor: false,
    status: "Active",
  },
  {
    id: 4,
    name: "Ana Torres",
    email: "ana@acme.example",
    role: "Viewer",
    twoFactor: false,
    status: "Invited",
  },
  {
    id: 5,
    name: "Sam Okafor",
    email: "sam@acme.example",
    role: "Editor",
    twoFactor: true,
    status: "Suspended",
  },
];

const STATUS = { Active: "success", Invited: "queued", Suspended: "cancelled" } as const;

/** Concept screen: a team settings page with tabs, an action bar and a member table. */
export function AdminConsole() {
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState(MEMBERS);

  const columns: GridColDef<Member>[] = [
    {
      field: "name",
      headerName: "Member",
      flex: 1,
      minWidth: 220,
      renderCell: ({ row }) => (
        <FabricInline gap="sm" align="center" sx={{ height: "100%" }}>
          <FabricAvatar name={row.name} size="md" />
          <FabricStack sx={{ minWidth: 0 }}>
            <FabricText textVariant="bodyMd" truncate>
              {row.name}
            </FabricText>
            <FabricText textVariant="bodySm" color="text.secondary" truncate>
              {row.email}
            </FabricText>
          </FabricStack>
        </FabricInline>
      ),
    },
    { field: "role", headerName: "Role", width: 110 },
    {
      field: "twoFactor",
      headerName: "Two-factor",
      width: 120,
      renderCell: ({ row }) => (
        <FabricSwitch
          size="small"
          checked={row.twoFactor}
          slotProps={{ input: { "aria-label": `Two-factor for ${row.name}` } }}
          onChange={(_, checked) =>
            setMembers((list) =>
              list.map((m) => (m.id === row.id ? { ...m, twoFactor: checked } : m)),
            )
          }
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ value }) => (
        <FabricTag variant="indicator" color={STATUS[value as Member["status"]]} label={value} />
      ),
    },
  ];

  return (
    <FabricStack sx={{ height: "100%", bgcolor: "background.default" }}>
      <FabricActionBar
        heading={{ text: "Team" }}
        bordered
        rightControls={[
          {
            children: "Invite member",
            variant: "contained",
            startIcon: <PersonAddOutlined />,
            onClick: () => {},
          },
        ]}
      />
      <FabricStack gap="md" sx={{ p: 3, minHeight: 0, flex: 1 }}>
        <FabricTabs
          aria-label="Team settings"
          value={tab}
          onChange={(_, value) => setTab(value)}
          tabs={[
            { value: "members", label: "Members" },
            { value: "roles", label: "Roles" },
            { value: "sso", label: "Single sign-on" },
            { value: "audit", label: "Audit log" },
          ]}
        />
        <FabricDatagrid
          sx={{ "& .MuiDataGrid-topContainer": { position: "relative" } }}
          rows={members}
          columns={columns}
          rowHeight={60}
          hideFooter
          disableRowSelectionOnClick
        />
      </FabricStack>
    </FabricStack>
  );
}
