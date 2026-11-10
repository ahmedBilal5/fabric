import { describe, expect, it } from "vitest";
import { formatHotkey, matchesHotkey, parseHotkey } from "../src/useHotkeys";

const key = (
  k: string,
  mods: Partial<Record<"ctrl" | "meta" | "alt" | "shift", boolean>> = {},
) => ({
  key: k,
  ctrlKey: !!mods.ctrl,
  metaKey: !!mods.meta,
  altKey: !!mods.alt,
  shiftKey: !!mods.shift,
});

describe("parseHotkey", () => {
  it("maps mod to ⌘ on Apple and Ctrl elsewhere", () => {
    expect(parseHotkey("mod+k", true)).toMatchObject({ key: "k", meta: true, ctrl: false });
    expect(parseHotkey("mod+k", false)).toMatchObject({ key: "k", meta: false, ctrl: true });
  });
  it("resolves aliases and a literal plus key", () => {
    expect(parseHotkey("esc").key).toBe("escape");
    expect(parseHotkey("ctrl++", false)).toMatchObject({ key: "+", ctrl: true });
  });
});

describe("matchesHotkey", () => {
  it("matches the exact modifiers", () => {
    expect(matchesHotkey(key("k", { ctrl: true }), "mod+k", false)).toBe(true);
    expect(matchesHotkey(key("k", { meta: true }), "mod+k", true)).toBe(true);
    expect(matchesHotkey(key("k"), "mod+k", false)).toBe(false);
    expect(matchesHotkey(key("k", { ctrl: true, alt: true }), "mod+k", false)).toBe(false);
  });
  it("is case-insensitive", () => {
    expect(matchesHotkey(key("K", { ctrl: true, shift: true }), "ctrl+shift+k", false)).toBe(true);
  });
  it("lets shifted characters match without naming shift", () => {
    expect(matchesHotkey(key("?", { shift: true }), "?", false)).toBe(true);
    expect(matchesHotkey(key("?", { shift: true }), "shift+?", false)).toBe(true);
  });
  it("rejects shift on named keys unless asked for", () => {
    expect(matchesHotkey(key("Escape"), "escape", false)).toBe(true);
    expect(matchesHotkey(key("Escape", { shift: true }), "escape", false)).toBe(false);
  });
});

describe("formatHotkey", () => {
  it("formats for macOS and other platforms", () => {
    expect(formatHotkey("mod+k", true)).toBe("⌘K");
    expect(formatHotkey("mod+shift+p", true)).toBe("⇧⌘P");
    expect(formatHotkey("mod+k", false)).toBe("Ctrl+K");
    expect(formatHotkey("escape", false)).toBe("Esc");
  });
});
