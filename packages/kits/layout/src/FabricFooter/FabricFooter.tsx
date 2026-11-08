import { FabricBox } from "@fabric-kit/components";
import { FabricFlex, FabricStack, FabricText } from "@fabric-kit/primitives";
import React from "react";
import type { FabricFooterProps } from "../types";

/**
 * App footer with policy links, a copyright line and an optional logo slot.
 *
 * Stacks on mobile and sits inline from the `sm` breakpoint up. Colors follow
 * the active light/dark scheme.
 *
 * @example
 * ```tsx
 * <FabricFooter
 *   companyName="Acme Inc."
 *   links={[
 *     { label: "Privacy", href: "/privacy" },
 *     { label: "Terms", href: "/terms" },
 *   ]}
 *   logoSlot={<AcmeLogo />}
 * />
 *
 * // Absolute positioned for login/auth views
 * <FabricFooter companyName="Acme Inc." isAbsolute />
 * ```
 */
export const FabricFooter = React.forwardRef<HTMLElement, FabricFooterProps>(function FabricFooter(
  {
    links = [],
    companyName,
    copyrightYear,
    copyrightText,
    logoSlot,
    isAbsolute = false,
    maxWidth = 1440,
    sx,
    testId = "fabric-footer",
  },
  ref,
) {
  const year = copyrightYear ?? new Date().getFullYear();
  const copyright = copyrightText ?? (companyName ? `\u00A9 ${year} ${companyName}` : undefined);

  return (
    <FabricStack
      ref={ref as React.Ref<HTMLDivElement>}
      component="footer"
      data-testid={testId}
      sx={{
        backgroundColor: "var(--mui-palette-background-paper)",
        borderTop: "1px solid var(--mui-palette-divider)",
        width: "100%",
        boxSizing: "border-box",
        py: 2,
        px: { xs: 2, sm: 3, md: 4 },
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        ...(isAbsolute
          ? {
              position: "absolute",
              bottom: 0,
              left: 0,
              zIndex: 2,
            }
          : {}),
        ...sx,
      }}
    >
      <FabricFlex
        justify="space-between"
        align="center"
        sx={{
          width: "100%",
          maxWidth,
          mx: "auto",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Navigation links & Copyright */}
        <FabricFlex
          align="center"
          wrap
          sx={{
            gap: { xs: 2, sm: 3 },
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          {links.map((link, idx) => {
            const isExternal = link.href?.startsWith("http");
            return (
              <FabricBox
                key={link.label || idx}
                component="a"
                href={link.href}
                onClick={link.onClick}
                target={link.target ?? (isExternal ? "_blank" : undefined)}
                rel={link.rel ?? (isExternal ? "noopener noreferrer" : undefined)}
                data-testid={link.testId}
                sx={{
                  color: "var(--mui-palette-text-secondary)",
                  textDecoration: "none",
                  cursor: "pointer",
                  lineHeight: "20px",
                  transition: "color 0.15s ease",
                  "&:hover": {
                    color: "var(--mui-palette-text-primary)",
                    textDecoration: "underline",
                  },
                }}
              >
                <FabricText
                  textVariant="bodySm"
                  sx={{
                    color: "inherit",
                    lineHeight: "inherit",
                  }}
                >
                  {link.label}
                </FabricText>
              </FabricBox>
            );
          })}

          {copyright && (
            <FabricText
              textVariant="bodySm"
              sx={{
                color: "var(--mui-palette-text-secondary)",
                lineHeight: "20px",
              }}
            >
              {copyright}
            </FabricText>
          )}
        </FabricFlex>

        {/* Optional brand logo slot */}
        {logoSlot && (
          <FabricFlex
            align="center"
            justify={{ xs: "center", sm: "flex-end" }}
            sx={{
              mt: { xs: 1, sm: 0 },
              flexShrink: 0,
            }}
          >
            {logoSlot}
          </FabricFlex>
        )}
      </FabricFlex>
    </FabricStack>
  );
});
