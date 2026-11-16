import { FabricButton } from "@fabric-kit/components";
import { FabricSystemPage } from "@fabric-kit/patterns";
import type { ReactNode } from "react";
import { href, routePath } from "../routes";

export interface NotFoundPageProps {
  title?: ReactNode;
  description?: ReactNode;
  /** A more useful way back than the dashboard, e.g. the list the record came from. */
  backTo?: { label: string; path: string };
}

/** For unknown paths, and for records that don't exist. */
export function NotFoundPage({ title, description, backTo }: NotFoundPageProps) {
  return (
    <FabricSystemPage
      kind="not-found"
      title={title}
      description={description}
      actions={
        <>
          {backTo && (
            <FabricButton variant="contained" href={href(backTo.path)}>
              {backTo.label}
            </FabricButton>
          )}
          <FabricButton
            variant={backTo ? "outlined" : "contained"}
            href={href(routePath({ name: "dashboard" }))}
          >
            Go to the dashboard
          </FabricButton>
        </>
      }
    />
  );
}
