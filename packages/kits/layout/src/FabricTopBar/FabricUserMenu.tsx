import {
  FabricAvatar,
  FabricIconButton,
  FabricMenu,
  type FabricMenuItem,
} from "@fabric-kit/components";
import { iconSize, radii, spacing } from "@fabric-kit/design-tokens";
import LogoutIcon from "@fabric-kit/icons/Logout";
import PersonIcon from "@fabric-kit/icons/Person";
import { FabricFlex, FabricText, Hide } from "@fabric-kit/primitives";
import { useState } from "react";
import type { UserInfo } from "../types";

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
      <FabricIconButton
        aria-label={fullName ? `Account menu for ${fullName}` : "Account menu"}
        aria-haspopup="menu"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        // The icon button is a fixed square by default; this one also holds the name.
        sx={{
          gap: `${spacing.sm}px`,
          p: 0,
          px: `${spacing.xs}px`,
          width: "auto",
          minWidth: 0,
          borderRadius: `${radii.md}px`,
        }}
      >
        <FabricAvatar name={fullName} src={user?.profilePic} size="sm" appearance="default">
          {!user ? <PersonIcon sx={{ fontSize: iconSize.sm }} /> : undefined}
        </FabricAvatar>
        {fullName && (
          <Hide below="md">
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
          </Hide>
        )}
      </FabricIconButton>

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
