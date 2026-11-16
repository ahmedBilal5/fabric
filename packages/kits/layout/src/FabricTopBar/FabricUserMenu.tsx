import { FabricAvatar, FabricMenu, type FabricMenuItem } from "@fabric-kit/components";
import { iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import LogoutIcon from "@fabric-kit/icons/Logout";
import PersonIcon from "@fabric-kit/icons/Person";
import { FabricFlex, FabricText } from "@fabric-kit/primitives";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import type { UserInfo } from "../types";

/** Hidden on screen, still read by screen readers. */
const srOnly = {
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
} as const;

export interface FabricUserMenuProps {
  user?: UserInfo;
  onAction?: (action: string) => void;
}

/**
 * Avatar and name button that opens a dropdown with profile and sign-out actions.
 *
 * Dispatches `'profile'` or `'signout'` via `onAction`.
 */
export function FabricUserMenu({ user, onAction }: FabricUserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const fullName = user ? `${user.firstName} ${user.lastName}` : undefined;

  const menuItems: FabricMenuItem[] = [
    ...(user
      ? [
          {
            label: (
              <FabricFlex direction="column" sx={{ py: 0.5 }}>
                <FabricText textVariant="uiMd" color="var(--mui-palette-text-primary)">
                  {fullName}
                </FabricText>
                <FabricText textVariant="bodySm" color="var(--mui-palette-text-secondary)">
                  {user.email}
                </FabricText>
              </FabricFlex>
            ),
            disabled: true,
            divideAfter: true,
            sx: { opacity: 1, "&.Mui-disabled": { opacity: 1 } },
          } satisfies FabricMenuItem,
        ]
      : []),
    {
      label: "View Profile",
      icon: <PersonIcon fontSize="small" />,
      onClick: () => {
        onAction?.("profile");
        setAnchorEl(null);
      },
    },
    {
      label: "Sign Out",
      icon: <LogoutIcon fontSize="small" />,
      onClick: () => {
        onAction?.("signout");
        setAnchorEl(null);
      },
    },
  ];

  return (
    <>
      {/* Header: 24px yellow initials avatar followed by the user's name. */}
      {/* Not an icon button: with a user it shows their name, which also names the button
          (the avatar is hidden), so voice-control users can say what they see. */}
      <ButtonBase
        aria-label={fullName ? undefined : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={anchorEl ? true : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          gap: `${spacing.sm}px`,
          minHeight: 40,
          minWidth: 40,
          px: `${spacing.xs}px`,
          borderRadius: `${radii.md}px`,
          justifyContent: "center",
          "&:hover": { backgroundColor: "var(--mui-palette-action-hover)" },
          "&.Mui-focusVisible": {
            outline: "2px solid var(--mui-palette-primary-main)",
            outlineOffset: 2,
          },
        }}
      >
        {/* Decorative: the initials repeat the name beside them. */}
        <FabricAvatar
          name={fullName}
          src={user?.profilePic}
          size="sm"
          appearance="default"
          aria-hidden="true"
        >
          {!user ? <PersonIcon sx={{ fontSize: iconSize.sm }} /> : undefined}
        </FabricAvatar>
        {fullName && (
          // On phones the name is only visually hidden, so it still names the button.
          <Box
            component="span"
            sx={(theme) => ({
              display: "inline-flex",
              [theme.breakpoints.down("md")]: srOnly,
            })}
          >
            <FabricText
              textVariant="pageTitleLg"
              sx={{
                color: "var(--mui-palette-text-primary)",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}
            >
              {fullName}
            </FabricText>
          </Box>
        )}
      </ButtonBase>

      <FabricMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        items={menuItems}
      />
    </>
  );
}
