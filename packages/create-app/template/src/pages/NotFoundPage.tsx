import { FabricButton } from "@fabric-kit/components";
import { FabricSystemPage } from "@fabric-kit/patterns";
import { href, routePath } from "../routes";

/** Shown for unknown paths and missing records. */
export function NotFoundPage({ title }: { title?: string }) {
  return (
    <FabricSystemPage
      kind="not-found"
      title={title}
      actions={
        <FabricButton variant="contained" href={href(routePath({ name: "home" }))}>
          Go home
        </FabricButton>
      }
    />
  );
}
