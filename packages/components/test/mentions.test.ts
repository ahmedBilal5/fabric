import { describe, expect, it } from "vitest";
import {
  activeMentionQuery,
  displayToMentions,
  filterMentionUsers,
  getMentionedIds,
  mentionsToDisplay,
  parseMentions,
} from "../src/FabricComments/mentions";

const jane = { id: "u1", name: "Jane Doe", description: "jane@example.com" };
const janet = { id: "u2", name: "Janet", description: "Finance" };
const sam = { id: "u3", name: "Sam Lee" };

describe("parseMentions", () => {
  it("splits text and mentions", () => {
    expect(parseMentions("Hi @[Jane Doe](u1), see this")).toEqual([
      { type: "text", text: "Hi " },
      { type: "mention", name: "Jane Doe", id: "u1" },
      { type: "text", text: ", see this" },
    ]);
  });
  it("leaves plain text alone", () => {
    expect(parseMentions("email me @ 5pm")).toEqual([{ type: "text", text: "email me @ 5pm" }]);
  });
  it("lists mentioned ids once", () => {
    expect(getMentionedIds("@[Jane Doe](u1) and @[Sam Lee](u3) and @[Jane Doe](u1)")).toEqual([
      "u1",
      "u3",
    ]);
  });
});

describe("display and stored text", () => {
  it("round-trips", () => {
    const stored = "Thanks @[Jane Doe](u1) and @[Janet](u2)!";
    const { text, mentions } = mentionsToDisplay(stored);
    expect(text).toBe("Thanks @Jane Doe and @Janet!");
    expect(displayToMentions(text, mentions)).toBe(stored);
  });
  it("prefers the longer name and keeps unpicked @text plain", () => {
    expect(displayToMentions("@Janet and @Jane Doe and @Bob", [jane, janet])).toBe(
      "@[Janet](u2) and @[Jane Doe](u1) and @Bob",
    );
  });
  it("doesn't match inside longer words", () => {
    expect(displayToMentions("@Janet's file, @Janetta", [janet])).toBe(
      "@[Janet](u2)'s file, @Janetta",
    );
  });
});

describe("activeMentionQuery", () => {
  it("finds the query at the caret", () => {
    expect(activeMentionQuery("Hi @ja", 6)).toEqual({ query: "ja", start: 3 });
    expect(activeMentionQuery("@", 1)).toEqual({ query: "", start: 0 });
  });
  it("ignores emails and finished words", () => {
    expect(activeMentionQuery("mail jane@example", 17)).toBeNull();
    expect(activeMentionQuery("Hi @jane ", 9)).toBeNull();
  });
});

describe("filterMentionUsers", () => {
  it("matches the start of any word, ignoring case", () => {
    expect(filterMentionUsers([jane, janet, sam], "do")).toEqual([jane]);
    expect(filterMentionUsers([jane, janet, sam], "JAN")).toEqual([jane, janet]);
    expect(filterMentionUsers([jane, janet, sam], "fin")).toEqual([janet]);
    expect(filterMentionUsers([jane, janet, sam], "")).toHaveLength(3);
  });
});
