import { FabricStack, FabricText } from "@fabric-kit/primitives";
import { type FabricVersion, FabricVersionHistoryDrawer } from "@fabric-kit/versioning";
import { useState } from "react";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

// Sample history for the concept screen.
const VERSIONS: FabricVersion[] = [
  { id: "d2", status: "draft", author: "Priya Shah", updatedAt: hoursAgo(0.3) },
  { id: "d1", status: "draft", author: "Marcus Lee", updatedAt: hoursAgo(2) },
  {
    id: "p2",
    status: "published",
    label: "Spring launch",
    isCurrent: true,
    author: "Jane Doe",
    updatedAt: hoursAgo(28),
  },
  {
    id: "p1",
    status: "published",
    label: "First draft",
    author: "Priya Shah",
    updatedAt: hoursAgo(190),
  },
];

/** Concept screen: a document with the version history drawer docked beside it. */
export function VersionScreen() {
  const [versions, setVersions] = useState(VERSIONS);
  return (
    <FabricStack
      sx={{ height: "100%", bgcolor: "background.paper", p: 4, pr: { sm: "380px" } }}
      gap="md"
    >
      <FabricText textVariant="headingLg" component="h3" sx={{ m: 0 }}>
        Spring launch email
      </FabricText>
      <FabricText textVariant="bodyMd" color="text.secondary">
        Our new collection arrives March 3. Members get early access a week before, with free
        shipping on every order over $50.
      </FabricText>
      <FabricVersionHistoryDrawer
        open
        variant="permanent"
        onClose={() => {}}
        versions={versions}
        onRestore={(v) =>
          setVersions((list) => list.map((x) => ({ ...x, isCurrent: x.id === v.id })))
        }
        onRename={(v, label) =>
          setVersions((list) => list.map((x) => (x.id === v.id ? { ...x, label } : x)))
        }
        onDuplicate={() => {}}
      />
    </FabricStack>
  );
}
