/** True for the error `fetch` and `AbortController` throw when a request is aborted. */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

/**
 * Reads a plain-text streaming response and calls `onToken` for each decoded chunk.
 * Resolves with the full text.
 *
 * @example
 * ```ts
 * const res = await fetch("/api/chat", { method: "POST", body, signal });
 * await readTextStream(res.body!, onToken);
 * ```
 */
export async function readTextStream(
  body: ReadableStream<Uint8Array>,
  onToken: (token: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const token = decoder.decode(value, { stream: true });
    if (token) {
      text += token;
      onToken(token);
    }
  }

  const rest = decoder.decode();
  if (rest) {
    text += rest;
    onToken(rest);
  }
  return text;
}

/**
 * Reads a server-sent events (SSE) response and calls `onData` with the `data:`
 * payload of each event. Multi-line data fields are joined with `\n`.
 * Stops early if `onData` returns `false`, e.g. on an OpenAI-style `[DONE]`.
 *
 * @example
 * ```ts
 * await readServerSentEvents(res.body!, (data) => {
 *   if (data === "[DONE]") return false;
 *   onToken(JSON.parse(data).delta);
 * });
 * ```
 */
export async function readServerSentEvents(
  body: ReadableStream<Uint8Array>,
  // biome-ignore lint/suspicious/noConfusingVoidType: callbacks may return nothing.
  onData: (data: string) => boolean | undefined | void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];

  // Returns false when the caller asked to stop.
  const dispatch = (): boolean => {
    if (dataLines.length === 0) return true;
    const data = dataLines.join("\n");
    dataLines = [];
    return onData(data) !== false;
  };

  const handleLine = (rawLine: string): boolean => {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    if (line === "") return dispatch();
    if (line.startsWith(":")) return true;
    if (line.startsWith("data:")) {
      const value = line.slice(5);
      dataLines.push(value.startsWith(" ") ? value.slice(1) : value);
    }
    return true;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!handleLine(line)) {
          await reader.cancel();
          return;
        }
      }
    }

    buffer += decoder.decode();
    if (buffer && !handleLine(buffer)) return;
    dispatch();
  } finally {
    reader.releaseLock();
  }
}
