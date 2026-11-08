import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import ExtensionIcon from "@mui/icons-material/Extension";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { radii } from "@fabric-kit/design-tokens";
import { FabricAvatar } from "../FabricAvatar";
import { FabricButton } from "../FabricButton";
import { FabricChip } from "../FabricChip";
import { FabricCard, type FabricCardProps } from ".";

/**
 * Card recipes: common layouts composed from FabricCard and MUI card parts.
 * Copy them as a starting point.
 */
const meta: Meta<FabricCardProps> = {
  title: "Components/FabricCard/Recipes",
  component: FabricCard,
  tags: ["test"],
  parameters: {
    docs: {
      description: {
        component:
          "Common card layouts built by composing `FabricCard` with MUI `CardHeader`, `CardContent` and `CardActions`. Copy the source of any story as a starting point.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<FabricCardProps>;

export const AddCard: Story = {
  name: "Create card",
  parameters: {
    docs: {
      description: {
        story:
          'A dashed placeholder card that creates a new item. `variant="outlined"` with a dashed border, a centered icon and label, and an `onClick` on the whole card.',
      },
    },
  },
  render: () => (
    <FabricCard
      variant="outlined"
      sx={{
        width: 309,
        height: 168,
        borderStyle: "dashed",
        borderWidth: 4,
        borderRadius: `${radii.xl}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        cursor: "pointer",
        "&:hover": { borderColor: "primary.main" },
      }}
      onClick={() => alert("Create Card")}
    >
      <AddIcon sx={{ width: 44, height: 44, color: "action.active" }} />
      <Typography variant="subtitle1" component="h1" color="text.primary">
        Create Card
      </Typography>
    </FabricCard>
  ),
};

export const AppCard: Story = {
  name: "App launcher card",
  parameters: {
    docs: {
      description: {
        story:
          'An app tile for a launcher or marketplace. The icon badge floats over the top edge with `position: absolute` and `translateY(-50%)`.',
      },
    },
  },
  render: () => (
    <Box sx={{ bgcolor: "action.selected", p: 4, borderRadius: 2 }}>
      <FabricCard
        sx={{
          width: 250,
          p: "60px 10px 40px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "10px",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Circular icon badge that overlaps the card's top edge */}
        <Box
          sx={{
            width: 120,
            height: 120,
            bgcolor: "background.paper",
            position: "absolute",
            top: 0,
            transform: "translateY(-50%)",
            border: (theme) => `10px solid ${theme.palette.background.default}`,
            borderRadius: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 64, color: "primary.main" }} />
        </Box>
        <Typography variant="body1" color="text.primary" sx={{ fontSize: 22, fontWeight: 500 }}>
          Team Directory
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.primary"
          sx={{ mt: "15px", mb: "25px", fontSize: 14 }}
        >
          Find people, teams and contact details across your organization.
        </Typography>
        <FabricButton variant="contained" color="primary" sx={{ width: "75%" }}>
          Open
        </FabricButton>
      </FabricCard>
    </Box>
  ),
};

export const SchemaCard: Story = {
  name: "Collection card",
  parameters: {
    docs: {
      description: {
        story:
          'A clickable card for a collection or dataset: an icon, a title that truncates with an ellipsis, an item count, and a two-line description.',
      },
    },
  },
  render: () => (
    <FabricCard
      sx={{
        width: 309,
        cursor: "pointer",
        "&:hover": { boxShadow: 2 },
      }}
      onClick={() => alert("Card clicked")}
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <ExtensionIcon sx={{ width: 18, height: 18, flexShrink: 0 }} />
              <Typography
                variant="subtitle1"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 600,
                }}
              >
                Quarterly revenue by region and product line
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <FabricChip label="40" size="small" />
              <IconButton size="small" aria-label="card actions">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
        sx={{
          pb: 0,
          "& .MuiCardHeader-action": { m: 0 },
          "& .MuiCardHeader-content": { minWidth: 0 },
        }}
      />
      <CardContent sx={{ p: "16px", pt: "8px", pb: "16px" }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            textOverflow: "ellipsis",
          }}
        >
          Bookings, refunds and net revenue for the last four quarters, broken down by sales
          region and product family.
        </Typography>
      </CardContent>
    </FabricCard>
  ),
};

export const StandardCard: Story = {
  name: "Record card",
  parameters: {
    docs: {
      description: {
        story:
          'A record summary: `CardHeader` for the avatar and menu, `CardContent` for the heading and subheading, and `CardActions` for label/value rows. For styled rows, see `FabricCardRows`.',
      },
    },
  },
  render: () => (
    <FabricCard sx={{ width: 309 }}>
      <CardHeader
        avatar={<FabricAvatar name="Alice Smith" />}
        action={
          <IconButton aria-label="card actions">
            <MoreVertIcon />
          </IconButton>
        }
        sx={{ pb: 0, "& .MuiCardHeader-action": { m: 0 } }}
      />
      <CardContent sx={{ p: 2, pt: 1, pb: 0, display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
          Onboarding checklist
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Shared with the design team
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        {[
          { label: "Owner", value: "Alice Smith" },
          { label: "Updated", value: "Mar 12, 2026" },
        ].map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              ml: "0 !important",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="caption" color="text.primary">
              {row.value}
            </Typography>
          </Box>
        ))}
      </CardActions>
    </FabricCard>
  ),
};

export const Selected: Story = {
  name: "Selected state",
  render: () => (
    <Stack direction="row" spacing={2}>
      <FabricCard sx={{ width: 220 }}>
        <CardContent>
          <Typography variant="subtitle2">Unselected</Typography>
        </CardContent>
      </FabricCard>
      <FabricCard
        sx={{
          width: 220,
          border: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <CardContent>
          <Typography variant="subtitle2">Selected</Typography>
        </CardContent>
      </FabricCard>
    </Stack>
  ),
};
