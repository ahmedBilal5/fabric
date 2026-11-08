import type { FabricDrawerProps } from "@fabric-kit/components";
import type { ReactNode } from "react";

/** `published` versions are named milestones; `draft` versions are autosaves. */
export type FabricVersionStatus = "published" | "draft";

/** One saved version of a document, newest first in the list you pass. */
export interface FabricVersion {
  /** Stable id. */
  id: string;
  /** Name of a published version, e.g. "v2.1" or "Launch copy". Drafts usually have none. */
  label?: string;
  /** Published milestone or autosaved draft. */
  status: FabricVersionStatus;
  /** The version the document is showing now. At most one version should set this. */
  isCurrent?: boolean;
  /** Who saved the version. */
  author?: string;
  /** When it was saved. */
  updatedAt: Date | string;
}

/** A run of versions shown together on the timeline. */
export interface FabricVersionGroup {
  /** `draft` groups collapse consecutive autosaves; `published` groups hold one version. */
  status: FabricVersionStatus;
  versions: FabricVersion[];
}

/** User-facing text. Override any of it to translate the drawer. */
export interface FabricVersionHistoryLabels {
  title?: string;
  done?: string;
  actions?: string;
  rename?: string;
  renameField?: string;
  preview?: string;
  restore?: string;
  duplicate?: string;
  delete?: string;
  cancel?: string;
  restoreTitle?: string;
  restoreBody?: string;
  deleteTitle?: string;
  deleteBody?: string;
  previewTitle?: string;
  untitled?: string;
  unknownAuthor?: string;
  empty?: string;
  /** Heading of a collapsed group of drafts. */
  autosaved?: (count: number) => string;
}

/** Props for `FabricVersionHistoryDrawer`. */
export interface FabricVersionHistoryDrawerProps
  extends Omit<
    FabricDrawerProps,
    "children" | "open" | "onClose" | "anchor" | "title" | "onError"
  > {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called by the Done button, the backdrop and Escape. */
  onClose: () => void;
  /** Every version, newest first. */
  versions: FabricVersion[];
  /** Make `version` the current one. Shows a confirmation first. */
  onRestore?: (version: FabricVersion) => Promise<void> | void;
  /** Copy `version` into a new draft. */
  onDuplicate?: (version: FabricVersion) => Promise<void> | void;
  /** Delete `version`. Shows a confirmation first. Never offered for the current version. */
  onDelete?: (version: FabricVersion) => Promise<void> | void;
  /** Rename a published version. Users click its name to edit it inline. */
  onRename?: (version: FabricVersion, label: string) => Promise<void> | void;
  /**
   * Render a read-only preview of `version` in a dialog. Return any node; a component
   * that fetches its own data and shows a spinner works well.
   */
  renderPreview?: (version: FabricVersion) => ReactNode;
  /** Hide rename, restore, duplicate and delete, e.g. for viewers without edit rights. */
  readOnly?: boolean;
  /** User-facing text overrides. */
  labels?: FabricVersionHistoryLabels;
  /** Called when an action handler throws. The dialog stays open so the user can retry. */
  onError?: (error: unknown) => void;
}
