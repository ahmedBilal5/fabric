/**
 * FabricFileUpload — a drop zone and file list with progress, retry and remove.
 *
 * Drag files onto the zone, or click it (or press Enter or Space) to browse.
 * Files that break `accept`, `maxSize` or `maxFiles` are refused with a message
 * and never reach your upload. Each accepted file shows its progress, then a
 * check, or an error with Retry.
 *
 * The component only shows the list and reports what people do. Pair it with
 * `useFileUpload`, which runs your `upload(file, { onProgress, signal })`
 * function, so any storage works: presigned S3 URLs, your own API, a CMS.
 *
 * @example
 * ```tsx
 * const uploads = useFileUpload({ upload: (file, ctx) => api.upload(file, ctx) });
 * <FabricFileUpload
 *   label="Attachments"
 *   accept=".pdf,image/*"
 *   maxSize={10_000_000}
 *   files={uploads.files}
 *   onAdd={uploads.add}
 *   onRemove={uploads.remove}
 *   onRetry={uploads.retry}
 * />
 * ```
 */

import { fontWeight, radii, spacing } from "@fabric-kit/design-tokens";
import { formatFileSize } from "@fabric-kit/hooks";
import CheckCircleIcon from "@fabric-kit/icons/CheckCircle";
import CloseIcon from "@fabric-kit/icons/Close";
import CloudUploadIcon from "@fabric-kit/icons/CloudUpload";
import ErrorIcon from "@fabric-kit/icons/Error";
import ImageIcon from "@fabric-kit/icons/Image";
import InsertDriveFileIcon from "@fabric-kit/icons/InsertDriveFile";
import PictureAsPdfIcon from "@fabric-kit/icons/PictureAsPdf";
import { Box, FormHelperText, IconButton, LinearProgress } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  type DragEvent,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { FabricButton } from "../FabricButton";
import type { FabricUploadFile } from "./useFileUpload";
import { describeAccept, type FabricRejectedFile, validateFiles } from "./validate";

export type {
  FabricUploadContext,
  FabricUploadFile,
  FabricUploadStatus,
  UseFileUploadOptions,
  UseFileUploadResult,
} from "./useFileUpload";
export { useFileUpload } from "./useFileUpload";
export type { FabricFileRules, FabricRejectedFile } from "./validate";
export { describeAccept, matchesAccept, validateFiles } from "./validate";

export interface FabricFileUploadProps {
  /** The files to list, usually `useFileUpload().files`. */
  files: FabricUploadFile[];
  /** Called with files that passed `accept`, `maxSize` and `maxFiles`. */
  onAdd: (files: File[]) => void;
  /** Remove a file. Offered on every file. */
  onRemove?: (id: string) => void;
  /** Try a failed upload again. Offered on failed files. */
  onRetry?: (id: string) => void;
  /** Called with refused files, as well as the message the component shows. */
  onReject?: (rejected: FabricRejectedFile[]) => void;
  /** File types allowed, as in `<input accept>`: ".pdf,image/*". */
  accept?: string;
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files in total. The zone hides once the list is full. */
  maxFiles?: number;
  /** Allow several files at once. @default true */
  multiple?: boolean;
  /** Label above the zone. */
  label?: ReactNode;
  /** Hint under the zone. Defaults to the allowed types and size. */
  helperText?: ReactNode;
  /** Error state, e.g. "Add at least one file" from form validation. */
  error?: boolean;
  /** Disable adding and removing files. */
  disabled?: boolean;
  /** `"dropzone"`: a large drop area. `"button"`: a compact Choose files button. @default "dropzone" */
  variant?: "dropzone" | "button";
  /** BCP 47 locale for file sizes. */
  locale?: string;
  /** Called when focus leaves the zone, for form "touched" state. */
  onBlur?: () => void;
  /** Class on the root. */
  className?: string;
  /** System styles on the root. */
  sx?: SxProps<Theme>;
}

const iconFor = (type: string) =>
  type === "application/pdf" ? (
    <PictureAsPdfIcon />
  ) : type.startsWith("image/") ? (
    <ImageIcon />
  ) : (
    <InsertDriveFileIcon />
  );

function rejectionMessage(
  r: FabricRejectedFile,
  maxSize?: number,
  maxFiles?: number,
  locale?: string,
) {
  if (r.reason === "type") return `${r.file.name} isn't an allowed file type.`;
  if (r.reason === "size")
    return `${r.file.name} is larger than ${formatFileSize(maxSize ?? 0, { locale })}.`;
  return `${r.file.name} wasn't added: the limit is ${maxFiles} ${maxFiles === 1 ? "file" : "files"}.`;
}

/** A drop zone and file list with progress, retry and remove. */
export const FabricFileUpload = forwardRef<HTMLDivElement, FabricFileUploadProps>(
  function FabricFileUpload(
    {
      files,
      onAdd,
      onRemove,
      onRetry,
      onReject,
      accept,
      maxSize,
      maxFiles,
      multiple = true,
      label,
      helperText,
      error = false,
      disabled = false,
      variant = "dropzone",
      locale,
      onBlur,
      className,
      sx,
    },
    ref,
  ) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const [refusals, setRefusals] = useState<string[]>([]);
    const [announcement, setAnnouncement] = useState("");
    const full = maxFiles !== undefined && files.length >= maxFiles;
    const inert = disabled || full;

    // Announce finished and failed uploads, not every progress tick.
    const lastStatus = useRef(new Map<string, string>());
    useEffect(() => {
      const messages: string[] = [];
      for (const f of files) {
        const before = lastStatus.current.get(f.id);
        if (before && before !== f.status) {
          if (f.status === "done") messages.push(`${f.name} uploaded.`);
          if (f.status === "error") messages.push(`${f.name} failed. ${f.error ?? ""}`.trim());
        }
      }
      lastStatus.current = new Map(files.map((f) => [f.id, f.status]));
      if (messages.length) setAnnouncement(messages.join(" "));
    }, [files]);

    const take = (list: FileList | null) => {
      if (!list || inert) return;
      const incoming = multiple ? Array.from(list) : Array.from(list).slice(0, 1);
      const { accepted, rejected } = validateFiles(
        incoming,
        { accept, maxSize, maxFiles },
        files.length,
      );
      setRefusals(rejected.map((r) => rejectionMessage(r, maxSize, maxFiles, locale)));
      if (rejected.length) onReject?.(rejected);
      if (accepted.length) onAdd(accepted);
    };

    const browse = () => {
      if (!inert) inputRef.current?.click();
    };

    const limits = [
      describeAccept(accept),
      maxSize !== undefined ? `up to ${formatFileSize(maxSize, { locale })}` : null,
      maxFiles !== undefined && maxFiles > 1 ? `${maxFiles} files max` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const hint = helperText ?? (limits || null);
    const hintId = `${id}-hint`;
    const labelId = `${id}-label`;

    const dropHandlers = {
      onDragEnter: (e: DragEvent) => {
        e.preventDefault();
        if (!inert) setDragging(true);
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = inert ? "none" : "copy";
      },
      onDragLeave: (e: DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files);
      },
    };

    const onZoneKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        browse();
      }
    };

    const hintColor = error ? "var(--mui-palette-error-main)" : "var(--mui-palette-text-secondary)";
    const borderColor = error
      ? "var(--mui-palette-error-main)"
      : dragging
        ? "var(--mui-palette-primary-main)"
        : "var(--mui-palette-divider)";

    return (
      <Box
        ref={ref}
        className={className}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlur?.();
        }}
        sx={[
          { display: "flex", flexDirection: "column", gap: `${spacing.sm}px`, minWidth: 0 },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {label && (
          <Box
            id={labelId}
            sx={{
              fontSize: "0.875rem",
              fontWeight: fontWeight.semiBold,
              color: error ? "var(--mui-palette-error-main)" : "var(--mui-palette-text-primary)",
            }}
          >
            {label}
          </Box>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={inert}
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            take(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />

        {variant === "dropzone" && !full && (
          <Box
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled || undefined}
            aria-labelledby={label ? `${labelId} ${id}-cta` : `${id}-cta`}
            aria-describedby={hint ? hintId : undefined}
            onClick={browse}
            onKeyDown={onZoneKey}
            {...dropHandlers}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: `${spacing.sm}px`,
              px: `${spacing.xl}px`,
              py: `${spacing.xl}px`,
              textAlign: "center",
              borderRadius: `${radii.xl}px`,
              border: "1.5px dashed",
              borderColor,
              backgroundColor: dragging
                ? "rgba(var(--mui-palette-primary-mainChannel) / 0.06)"
                : "var(--mui-palette-background-paper)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              outline: "none",
              transition: "border-color 120ms, background-color 120ms",
              "&:hover": disabled ? undefined : { borderColor: "var(--mui-palette-primary-main)" },
              "&:focus-visible": {
                borderColor: "var(--mui-palette-primary-main)",
                boxShadow: "0 0 0 3px rgba(var(--mui-palette-primary-mainChannel) / 0.2)",
              },
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: `${radii.full}px`,
                display: "grid",
                placeItems: "center",
                color: "var(--mui-palette-primary-main)",
                backgroundColor: "rgba(var(--mui-palette-primary-mainChannel) / 0.1)",
                "& svg": { fontSize: 22 },
              }}
            >
              <CloudUploadIcon />
            </Box>
            <Box
              id={`${id}-cta`}
              sx={{ fontSize: "0.875rem", color: "var(--mui-palette-text-primary)" }}
            >
              {dragging ? (
                "Drop to upload"
              ) : (
                <>
                  Drag {multiple ? "files" : "a file"} here or{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "var(--mui-palette-primary-main)",
                      fontWeight: fontWeight.semiBold,
                    }}
                  >
                    browse
                  </Box>
                </>
              )}
            </Box>
            {hint && (
              <Box id={hintId} sx={{ fontSize: "0.75rem", color: hintColor }}>
                {hint}
              </Box>
            )}
          </Box>
        )}

        {variant === "button" && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: `${spacing.md}px`, flexWrap: "wrap" }}
            {...dropHandlers}
          >
            <FabricButton
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={inert}
              onClick={browse}
              aria-describedby={hint ? hintId : undefined}
            >
              {multiple ? "Choose files" : "Choose file"}
            </FabricButton>
            {hint && (
              <Box id={hintId} sx={{ fontSize: "0.75rem", color: hintColor }}>
                {hint}
              </Box>
            )}
          </Box>
        )}

        {refusals.length > 0 && (
          <Box role="alert" sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {refusals.map((m) => (
              <FormHelperText key={m} error sx={{ m: 0 }}>
                {m}
              </FormHelperText>
            ))}
          </Box>
        )}

        {files.length > 0 && (
          <Box
            component="ul"
            aria-label={typeof label === "string" ? `${label} files` : "Files"}
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
              display: "flex",
              flexDirection: "column",
              gap: `${spacing.sm}px`,
            }}
          >
            {files.map((f) => {
              const pct = Math.round((f.progress ?? 0) * 100);
              return (
                <Box
                  component="li"
                  key={f.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "32px minmax(0, 1fr) auto",
                    alignItems: "center",
                    columnGap: `${spacing.md}px`,
                    px: `${spacing.md}px`,
                    py: `${spacing.sm + 2}px`,
                    borderRadius: `${radii.lg}px`,
                    border: "1px solid",
                    borderColor:
                      f.status === "error"
                        ? "var(--mui-palette-error-main)"
                        : "var(--mui-palette-divider)",
                    backgroundColor: "var(--mui-palette-background-paper)",
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: `${radii.md}px`,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--mui-palette-text-secondary)",
                      backgroundColor: "var(--mui-palette-action-hover)",
                      "& svg": { fontSize: 18 },
                    }}
                  >
                    {iconFor(f.type)}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: fontWeight.medium,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={f.name}
                    >
                      {f.name}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: `${spacing.xs}px`,
                        fontSize: "0.75rem",
                        color:
                          f.status === "error"
                            ? "var(--mui-palette-error-main)"
                            : "var(--mui-palette-text-secondary)",
                        "& svg": { fontSize: 14 },
                      }}
                    >
                      <span>{formatFileSize(f.size, { locale })}</span>
                      <span aria-hidden>·</span>
                      {f.status === "uploading" && <span>Uploading {pct}%</span>}
                      {f.status === "done" && (
                        <>
                          <CheckCircleIcon sx={{ color: "var(--mui-palette-success-main)" }} />
                          <span>Uploaded</span>
                        </>
                      )}
                      {f.status === "error" && (
                        <>
                          <ErrorIcon />
                          <span>{f.error ?? "Upload failed"}</span>
                        </>
                      )}
                    </Box>
                    {f.status === "uploading" && (
                      <LinearProgress
                        variant={f.progress === undefined ? "indeterminate" : "determinate"}
                        value={pct}
                        aria-label={`Uploading ${f.name}`}
                        sx={{
                          mt: `${spacing.xs + 2}px`,
                          height: 4,
                          borderRadius: `${radii.full}px`,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: `${spacing.xs}px` }}>
                    {f.status === "error" && onRetry && f.file && (
                      <FabricButton
                        size="small"
                        variant="text"
                        disabled={disabled}
                        onClick={() => onRetry(f.id)}
                        aria-label={`Retry ${f.name}`}
                      >
                        Retry
                      </FabricButton>
                    )}
                    {onRemove && (
                      <IconButton
                        size="small"
                        disabled={disabled}
                        onClick={() => onRemove(f.id)}
                        aria-label={
                          f.status === "uploading"
                            ? `Cancel upload of ${f.name}`
                            : `Remove ${f.name}`
                        }
                        sx={{
                          color: "var(--mui-palette-text-secondary)",
                          "& svg": { fontSize: 18 },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        <Box
          aria-live="polite"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          {announcement}
        </Box>
      </Box>
    );
  },
);
