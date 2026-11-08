import {
  FabricAvatar,
  FabricBox,
  FabricButton,
  FabricChip,
  FabricIconButton,
  FabricTextField,
  FabricTimeline,
  FabricTimelineConnector,
  FabricTimelineContent,
  FabricTimelineDot,
  FabricTimelineItem,
  FabricTimelineSeparator,
} from "@fabric-kit/components";
import CheckIcon from "@fabric-kit/icons/Check";
import ExpandMoreIcon from "@fabric-kit/icons/ExpandMore";
import MoreVertIcon from "@fabric-kit/icons/MoreVert";
import { FabricInline, FabricStack, FabricText } from "@fabric-kit/primitives";
import { type MouseEvent, memo, useEffect, useRef, useState } from "react";
import {
  TIMELINE_DOT_ICON_SIZE,
  TIMELINE_DOT_INNER_DOT_SIZE,
  TIMELINE_DOT_SIZE,
} from "../constants";
import { formatVersionTimestamp } from "../helpers";
import type { FabricVersion, FabricVersionGroup, FabricVersionHistoryLabels } from "../types";

export interface VersionTimelineProps {
  groups: FabricVersionGroup[];
  labels: Required<FabricVersionHistoryLabels>;
  hasActions: (version: FabricVersion) => boolean;
  canRename: (version: FabricVersion) => boolean;
  renamingId: string | null;
  onRenameStart: (version: FabricVersion) => void;
  onRenameCommit: (version: FabricVersion, label: string) => void;
  onRenameCancel: () => void;
  onOpenActions: (event: MouseEvent<HTMLElement>, version: FabricVersion) => void;
}

const ITEM_SX = { "&::before": { display: "none" }, minHeight: "auto", pl: 1 } as const;
const DOT_BASE_SX = {
  width: TIMELINE_DOT_SIZE,
  height: TIMELINE_DOT_SIZE,
  m: 0,
  mt: "4px",
  p: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "none",
} as const;

function LabelEditor({
  initial,
  label,
  onCommit,
  onCancel,
}: {
  initial: string;
  label: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  return (
    <FabricTextField
      size="small"
      label={label}
      value={value}
      inputRef={inputRef}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && value.trim()) onCommit(value.trim());
        if (event.key === "Escape") onCancel();
      }}
      onBlur={onCancel}
      sx={{ flex: 1, minWidth: 0 }}
    />
  );
}

function ActionsButton({
  version,
  label,
  onOpen,
}: {
  version: FabricVersion;
  label: string;
  onOpen: VersionTimelineProps["onOpenActions"];
}) {
  return (
    <FabricIconButton
      aria-label={label}
      aria-haspopup="menu"
      onClick={(event) => onOpen(event, version)}
    >
      <MoreVertIcon />
    </FabricIconButton>
  );
}

function Author({
  version,
  labels,
}: {
  version: FabricVersion;
  labels: Required<FabricVersionHistoryLabels>;
}) {
  const name = version.author || labels.unknownAuthor;
  return (
    <FabricInline gap="sm" align="center" sx={{ minWidth: 0 }}>
      <FabricAvatar name={name} size="md" />
      <FabricStack sx={{ minWidth: 0 }}>
        <FabricText textVariant="bodyMd" truncate>
          {name}
        </FabricText>
        <FabricText textVariant="bodySm" color="text.secondary">
          <time dateTime={new Date(version.updatedAt).toISOString()}>
            {formatVersionTimestamp(version.updatedAt)}
          </time>
        </FabricText>
      </FabricStack>
    </FabricInline>
  );
}

function PublishedRow({
  version,
  last,
  ...props
}: Omit<VersionTimelineProps, "groups"> & { version: FabricVersion; last: boolean }) {
  const {
    labels,
    hasActions,
    canRename,
    renamingId,
    onRenameStart,
    onRenameCommit,
    onRenameCancel,
    onOpenActions,
  } = props;
  const current = Boolean(version.isCurrent);
  const name = version.label || labels.untitled;

  return (
    <FabricTimelineItem sx={{ ...ITEM_SX, pb: 2 }}>
      <FabricTimelineSeparator>
        <FabricTimelineDot
          variant="outlined"
          sx={{
            ...DOT_BASE_SX,
            border: "2px solid",
            borderColor: current ? "primary.main" : "divider",
            backgroundColor: "background.paper",
            "&::before": current
              ? undefined
              : {
                  content: '""',
                  width: TIMELINE_DOT_INNER_DOT_SIZE,
                  height: TIMELINE_DOT_INNER_DOT_SIZE,
                  borderRadius: "50%",
                  backgroundColor: "text.secondary",
                },
          }}
        >
          {current ? (
            <CheckIcon sx={{ fontSize: TIMELINE_DOT_ICON_SIZE, color: "primary.main" }} />
          ) : null}
        </FabricTimelineDot>
        {!last && <FabricTimelineConnector sx={{ backgroundColor: "divider" }} />}
      </FabricTimelineSeparator>
      <FabricTimelineContent sx={{ py: 0, pr: 0, minWidth: 0 }}>
        <FabricStack gap="sm">
          <FabricInline
            gap="sm"
            align="center"
            sx={{ justifyContent: "space-between", minHeight: 32 }}
          >
            {renamingId === version.id ? (
              <LabelEditor
                initial={version.label ?? ""}
                label={labels.renameField}
                onCommit={(value) => onRenameCommit(version, value)}
                onCancel={onRenameCancel}
              />
            ) : (
              <FabricChip
                label={name}
                size="small"
                color={current ? "primary" : "default"}
                onClick={canRename(version) ? () => onRenameStart(version) : undefined}
                sx={{ fontWeight: 600, maxWidth: "100%" }}
              />
            )}
            {hasActions(version) && renamingId !== version.id && (
              <ActionsButton version={version} label={labels.actions} onOpen={onOpenActions} />
            )}
          </FabricInline>
          <Author version={version} labels={labels} />
        </FabricStack>
      </FabricTimelineContent>
    </FabricTimelineItem>
  );
}

function DraftGroup({
  group,
  last,
  ...props
}: Omit<VersionTimelineProps, "groups"> & { group: FabricVersionGroup; last: boolean }) {
  const { labels, hasActions, onOpenActions } = props;
  const containsCurrent = group.versions.some((version) => version.isCurrent);
  const [expanded, setExpanded] = useState(containsCurrent);

  return (
    <FabricTimelineItem sx={{ ...ITEM_SX, pb: 2 }}>
      <FabricTimelineSeparator>
        <FabricTimelineDot
          variant="outlined"
          sx={{
            ...DOT_BASE_SX,
            border: "2px solid",
            borderColor: "text.secondary",
            backgroundColor: "background.paper",
          }}
        >
          <ExpandMoreIcon
            sx={{
              fontSize: TIMELINE_DOT_ICON_SIZE,
              color: "text.secondary",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </FabricTimelineDot>
        {!last && <FabricTimelineConnector sx={{ backgroundColor: "divider" }} />}
      </FabricTimelineSeparator>
      <FabricTimelineContent sx={{ py: 0, pr: 0, minWidth: 0 }}>
        <FabricButton
          variant="text"
          size="small"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          sx={{
            px: 0,
            minHeight: 32,
            color: "text.primary",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {labels.autosaved(group.versions.length)}
        </FabricButton>
        {expanded && (
          <FabricStack component="ul" gap="md" sx={{ listStyle: "none", m: 0, p: 0, pt: 1 }}>
            {group.versions.map((version) => (
              <FabricBox component="li" key={version.id}>
                <FabricInline gap="sm" align="center" sx={{ justifyContent: "space-between" }}>
                  <Author version={version} labels={labels} />
                  {version.isCurrent ? (
                    <CheckIcon
                      aria-label="Current version"
                      sx={{ color: "primary.main", fontSize: 20 }}
                    />
                  ) : hasActions(version) ? (
                    <ActionsButton
                      version={version}
                      label={labels.actions}
                      onOpen={onOpenActions}
                    />
                  ) : null}
                </FabricInline>
              </FabricBox>
            ))}
          </FabricStack>
        )}
      </FabricTimelineContent>
    </FabricTimelineItem>
  );
}

function VersionTimelineImpl({ groups, ...props }: VersionTimelineProps) {
  return (
    <FabricTimeline sx={{ p: 0, m: 0 }}>
      {groups.map((group, index) => {
        const last = index === groups.length - 1;
        return group.status === "draft" ? (
          <DraftGroup key={group.versions[0].id} group={group} last={last} {...props} />
        ) : (
          <PublishedRow
            key={group.versions[0].id}
            version={group.versions[0]}
            last={last}
            {...props}
          />
        );
      })}
    </FabricTimeline>
  );
}

export const VersionTimeline = memo(VersionTimelineImpl);
