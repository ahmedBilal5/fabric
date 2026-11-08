import { describe, expect, it } from "vitest";
import { isAbortError, readServerSentEvents, readTextStream } from "../src/helpers";

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

describe("readTextStream", () => {
  it("reports each chunk and resolves with the full text", async () => {
    const tokens: string[] = [];
    const text = await readTextStream(streamFrom(["Hel", "lo ", "there"]), (t) => tokens.push(t));
    expect(tokens).toEqual(["Hel", "lo ", "there"]);
    expect(text).toBe("Hello there");
  });

  it("handles multi-byte characters split across chunks", async () => {
    const bytes = new TextEncoder().encode("héllo");
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 2));
        controller.enqueue(bytes.slice(2));
        controller.close();
      },
    });
    expect(await readTextStream(body, () => {})).toBe("héllo");
  });
});

describe("readServerSentEvents", () => {
  it("emits the data of each event", async () => {
    const events: string[] = [];
    await readServerSentEvents(
      streamFrom(['data: {"delta":"Hi"}\n\n', 'data: {"delta":" there"}\n', "\n"]),
      (data) => {
        events.push(data);
      },
    );
    expect(events).toEqual(['{"delta":"Hi"}', '{"delta":" there"}']);
  });

  it("joins multi-line data, ignores comments and handles CRLF", async () => {
    const events: string[] = [];
    await readServerSentEvents(
      streamFrom([": keep-alive\r\n", "data: line one\r\n", "data: line two\r\n\r\n"]),
      (data) => {
        events.push(data);
      },
    );
    expect(events).toEqual(["line one\nline two"]);
  });

  it("handles events split across chunks", async () => {
    const events: string[] = [];
    await readServerSentEvents(streamFrom(["da", "ta: spl", "it\n", "\n"]), (data) => {
      events.push(data);
    });
    expect(events).toEqual(["split"]);
  });

  it("dispatches a final event without a trailing blank line", async () => {
    const events: string[] = [];
    await readServerSentEvents(streamFrom(["data: last"]), (data) => {
      events.push(data);
    });
    expect(events).toEqual(["last"]);
  });

  it("stops when the callback returns false", async () => {
    const events: string[] = [];
    await readServerSentEvents(
      streamFrom(["data: a\n\n", "data: [DONE]\n\n", "data: ignored\n\n"]),
      (data) => {
        events.push(data);
        return data !== "[DONE]";
      },
    );
    expect(events).toEqual(["a", "[DONE]"]);
  });
});

describe("isAbortError", () => {
  it("recognizes abort errors only", () => {
    expect(isAbortError(new DOMException("Aborted", "AbortError"))).toBe(true);
    expect(isAbortError(new Error("Network"))).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});
