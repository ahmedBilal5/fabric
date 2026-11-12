import { useCallback, useEffect, useRef, useState } from "react";

/** Where a file is in its upload. */
export type FabricUploadStatus = "uploading" | "done" | "error";

/** One file in an upload list. */
export interface FabricUploadFile<R = unknown> {
  /** Stable id for the list. */
  id: string;
  /** File name. */
  name: string;
  /** Size in bytes. */
  size: number;
  /** MIME type. */
  type: string;
  /** Upload state. */
  status: FabricUploadStatus;
  /** Progress from 0 to 1 while uploading, when known. */
  progress?: number;
  /** Why the upload failed. */
  error?: string;
  /** What your `upload` function returned, e.g. a stored file id or URL. */
  result?: R;
  /** The file itself, kept for retries. Absent on files loaded from saved data. */
  file?: File;
}

/** Helpers your `upload` function receives. */
export interface FabricUploadContext {
  /** Report progress from 0 to 1. */
  onProgress: (progress: number) => void;
  /** Aborted when the person removes the file mid-upload. */
  signal: AbortSignal;
}

export interface UseFileUploadOptions<R> {
  /** Sends one file to your storage. Resolve with anything you want to keep, e.g. its id. Throw to fail it. */
  upload: (file: File, context: FabricUploadContext) => Promise<R>;
  /** Files to start with, e.g. ones already saved. */
  initialFiles?: FabricUploadFile<R>[];
  /** Called whenever the list changes. */
  onFilesChange?: (files: FabricUploadFile<R>[]) => void;
}

export interface UseFileUploadResult<R> {
  /** The current list. */
  files: FabricUploadFile<R>[];
  /** Start uploading new files. */
  add: (files: File[]) => void;
  /** Remove a file, cancelling its upload if it's still running. */
  remove: (id: string) => void;
  /** Try a failed upload again. */
  retry: (id: string) => void;
  /** Replace the whole list, e.g. after a form reset. */
  setFiles: (files: FabricUploadFile<R>[]) => void;
  /** True while any file is uploading. */
  uploading: boolean;
}

let counter = 0;
const nextId = () => `upload-${Date.now().toString(36)}-${(counter++).toString(36)}`;

const messageOf = (e: unknown) =>
  e instanceof Error && e.message ? e.message : "Upload failed. Try again.";

/**
 * Runs uploads for `FabricFileUpload`: tracks progress, errors, retries and
 * cancellation. Your `upload` function does the network work, so any storage
 * (S3 presigned URLs, your API, a CMS) fits.
 */
export function useFileUpload<R = unknown>({
  upload,
  initialFiles = [],
  onFilesChange,
}: UseFileUploadOptions<R>): UseFileUploadResult<R> {
  const [files, setFilesState] = useState<FabricUploadFile<R>[]>(initialFiles);
  const controllers = useRef(new Map<string, AbortController>());
  const latest = useRef({ upload, onFilesChange });
  latest.current = { upload, onFilesChange };

  const change = useCallback(
    (fn: (prev: FabricUploadFile<R>[]) => FabricUploadFile<R>[]) => setFilesState(fn),
    [],
  );

  // Report changes after they render, once each (StrictMode replays updaters).
  const reported = useRef(files);
  useEffect(() => {
    if (reported.current === files) return;
    reported.current = files;
    latest.current.onFilesChange?.(files);
  }, [files]);

  const patch = useCallback(
    (id: string, update: Partial<FabricUploadFile<R>>) =>
      change((prev) => prev.map((f) => (f.id === id ? { ...f, ...update } : f))),
    [change],
  );

  const start = useCallback(
    (id: string, file: File) => {
      const controller = new AbortController();
      controllers.current.set(id, controller);
      latest.current
        .upload(file, {
          signal: controller.signal,
          onProgress: (p) => {
            if (!controller.signal.aborted) patch(id, { progress: Math.max(0, Math.min(1, p)) });
          },
        })
        .then((result) => {
          if (!controller.signal.aborted)
            patch(id, { status: "done", progress: 1, result, error: undefined });
        })
        .catch((e) => {
          if (!controller.signal.aborted) patch(id, { status: "error", error: messageOf(e) });
        })
        .finally(() => controllers.current.delete(id));
    },
    [patch],
  );

  const add = useCallback(
    (incoming: File[]) => {
      const entries = incoming.map((file) => ({
        id: nextId(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading" as const,
        progress: 0,
        file,
      }));
      change((prev) => [...prev, ...entries]);
      for (const e of entries) start(e.id, e.file);
    },
    [change, start],
  );

  const remove = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      controllers.current.delete(id);
      change((prev) => prev.filter((f) => f.id !== id));
    },
    [change],
  );

  const retry = useCallback(
    (id: string) => {
      const entry = files.find((f) => f.id === id);
      if (!entry?.file) return;
      patch(id, { status: "uploading", progress: 0, error: undefined });
      start(id, entry.file);
    },
    [files, patch, start],
  );

  const setFiles = useCallback(
    (next: FabricUploadFile<R>[]) => {
      for (const [id, c] of controllers.current) if (!next.some((f) => f.id === id)) c.abort();
      change(() => next);
    },
    [change],
  );

  // Cancel running uploads when the component goes away.
  useEffect(() => {
    const running = controllers.current;
    return () => {
      for (const c of running.values()) c.abort();
    };
  }, []);

  return {
    files,
    add,
    remove,
    retry,
    setFiles,
    uploading: files.some((f) => f.status === "uploading"),
  };
}
