import { describe, expect, it } from "vitest";
import { describeAccept, matchesAccept, validateFiles } from "../src/FabricFileUpload/validate";
import {
  clampNumber,
  numberFormatter,
  parseNumberInput,
  stepNumber,
} from "../src/FabricNumberField/numberFormat";
import { scorePassword } from "../src/FabricPasswordField/strength";
import { isE164, PHONE_COUNTRIES, parsePhone, toE164 } from "../src/FabricPhoneField/countries";
import { addTags, splitTags } from "../src/FabricTagInput";

describe("number field", () => {
  it("reads numbers typed in a locale", () => {
    expect(parseNumberInput("12,480.50", "en-US")).toBe(12480.5);
    expect(parseNumberInput("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseNumberInput("$1,200", "en-US")).toBe(1200);
    expect(parseNumberInput("15%", "en-US")).toBe(15);
    expect(parseNumberInput("-3", "en-US")).toBe(-3);
    expect(parseNumberInput("(12.50)", "en-US")).toBe(-12.5);
    expect(parseNumberInput("1.5", "fr-FR")).toBe(1.5);
  });

  it("returns null when empty and NaN for nonsense", () => {
    expect(parseNumberInput("  ", "en-US")).toBeNull();
    expect(parseNumberInput("abc", "en-US")).toBeNaN();
    expect(parseNumberInput("1.2.3", "en-US")).toBeNaN();
  });

  it("formats currency, percent and units", () => {
    expect(
      numberFormatter({ locale: "en-US", format: { style: "currency", currency: "USD" } }).format(
        12480,
      ),
    ).toBe("$12,480.00");
    expect(numberFormatter({ locale: "en-US", format: { style: "percent" } }).format(15)).toBe(
      "15%",
    );
    expect(
      numberFormatter({ locale: "en-US", format: { style: "unit", unit: "kilogram" } }).format(2.5),
    ).toBe("2.5 kg");
  });

  it("steps without floating-point noise and within limits", () => {
    expect(stepNumber(0.1, 1, { step: 0.2 })).toBe(0.3);
    expect(stepNumber(9, 1, { step: 5, max: 10 })).toBe(10);
    expect(stepNumber(null, 1, { min: 5 })).toBe(5);
    expect(stepNumber(null, -1)).toBe(0);
    expect(clampNumber(-4, 0, 10)).toBe(0);
  });
});

describe("password strength", () => {
  it("rates common and short passwords as weak", () => {
    expect(scorePassword("password").score).toBe(0);
    expect(scorePassword("Password").score).toBe(0);
    expect(scorePassword("tulip7").score).toBeLessThanOrEqual(1);
  });

  it("caps passwords under 12 characters at Fair", () => {
    expect(scorePassword("Summer2026!").score).toBeLessThanOrEqual(2);
  });

  it("rates long, varied passwords as strong", () => {
    expect(scorePassword("Harbour-Lights-2026!").score).toBe(4);
    expect(scorePassword("Harbour-Lights-2026!").hint).toBeUndefined();
  });

  it("marks down runs and repeats", () => {
    expect(scorePassword("abcdefgh1234XYZ!").score).toBeLessThan(
      scorePassword("kqzmwpvh1739XYZ!").score,
    );
  });
});

describe("phone field", () => {
  const country = (code: string) => {
    const c = PHONE_COUNTRIES.find((x) => x.code === code);
    if (!c) throw new Error(`No country ${code}`);
    return c;
  };
  const gb = country("GB");
  const it_ = country("IT");

  it("joins country and number into E.164, dropping the trunk 0", () => {
    expect(toE164(gb, "020 7123 4567")).toBe("+442071234567");
    expect(toE164(gb, "")).toBe("");
  });

  it("keeps Italy's leading 0", () => {
    expect(toE164(it_, "06 1234 5678")).toBe("+390612345678");
  });

  it("reads E.164 back into country and digits, preferring the current country for shared codes", () => {
    expect(parsePhone("+442071234567")).toMatchObject({
      country: { code: "GB" },
      national: "2071234567",
    });
    expect(parsePhone("+14165550123", PHONE_COUNTRIES, "CA").country?.code).toBe("CA");
    expect(parsePhone("+14165550123").country?.code).toBe("US");
    expect(parsePhone("+12684601234").country?.code).toBe("AG");
  });

  it("checks the E.164 shape", () => {
    expect(isE164("+442071234567")).toBe(true);
    expect(isE164("+44207")).toBe(false);
    expect(isE164("02071234567")).toBe(false);
  });
});

describe("file upload rules", () => {
  const file = (name: string, type: string, size = 100) =>
    new File(["x".repeat(size)], name, { type });

  it("matches accept by extension, exact type and wildcard", () => {
    expect(matchesAccept(file("a.PDF", "application/pdf"), ".pdf")).toBe(true);
    expect(matchesAccept(file("a.png", "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(file("a.csv", "text/csv"), ".pdf,image/*")).toBe(false);
    expect(matchesAccept(file("a.csv", "text/csv"), undefined)).toBe(true);
  });

  it("refuses by type, then size, then count", () => {
    const { accepted, rejected } = validateFiles(
      [
        file("a.pdf", "application/pdf"),
        file("b.txt", "text/plain"),
        file("c.pdf", "application/pdf", 5000),
        file("d.pdf", "application/pdf"),
      ],
      { accept: ".pdf", maxSize: 1000, maxFiles: 2 },
      1,
    );
    expect(accepted.map((f) => f.name)).toEqual(["a.pdf"]);
    expect(rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ["b.txt", "type"],
      ["c.pdf", "size"],
      ["d.pdf", "count"],
    ]);
  });

  it("describes accept in words", () => {
    expect(describeAccept(".pdf,image/*")).toBe("PDF or images");
    expect(describeAccept(".csv")).toBe("CSV");
  });
});

describe("tag input", () => {
  it("splits on separators and new lines", () => {
    expect(splitTags("a, b ,c\nd")).toEqual(["a", "b", "c", "d"]);
    expect(splitTags("x;y z", [";", " "])).toEqual(["x", "y", "z"]);
  });

  it("skips case-insensitive duplicates", () => {
    expect(addTags(["Priority"], ["priority", "EMEA", "emea"])).toEqual(["Priority", "EMEA"]);
  });
});
