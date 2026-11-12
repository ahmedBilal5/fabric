/** A country's ISO 3166-1 alpha-2 code and its international dialling code (without "+"). */
export interface FabricPhoneCountry {
  /** ISO 3166-1 alpha-2 code, e.g. "GB". */
  code: string;
  /** Dialling code without "+", e.g. "44". */
  dial: string;
}

// Dialling codes from the ITU E.164 assignments. Countries sharing +1 or +7 are
// listed separately so people can pick their own flag; the first listed wins when
// reading a number back.
const RAW =
  "US1 CA1 AG1268 AI1264 AS1684 BB1246 BM1441 BS1242 DM1767 DO1809 GD1473 GU1671 JM1876 KN1869 KY1345 LC1758 MP1670 MS1664 PR1787 SX1721 TC1649 TT1868 VC1784 VG1284 VI1340 " +
  "RU7 KZ7 EG20 ZA27 GR30 NL31 BE32 FR33 ES34 HU36 IT39 RO40 CH41 AT43 GB44 DK45 SE46 NO47 PL48 DE49 " +
  "PE51 MX52 CU53 AR54 BR55 CL56 CO57 VE58 MY60 AU61 ID62 PH63 NZ64 SG65 TH66 JP81 KR82 VN84 CN86 " +
  "TR90 IN91 PK92 AF93 LK94 MM95 IR98 SS211 MA212 DZ213 TN216 LY218 GM220 SN221 MR222 ML223 GN224 CI225 " +
  "BF226 NE227 TG228 BJ229 MU230 LR231 SL232 GH233 NG234 TD235 CF236 CM237 CV238 ST239 GQ240 GA241 CG242 " +
  "CD243 AO244 GW245 SC248 SD249 RW250 ET251 SO252 DJ253 KE254 TZ255 UG256 BI257 MZ258 ZM260 MG261 RE262 " +
  "ZW263 NA264 MW265 LS266 BW267 SZ268 KM269 SH290 ER291 AW297 FO298 GL299 GI350 PT351 LU352 IE353 IS354 " +
  "AL355 MT356 CY357 FI358 BG359 LT370 LV371 EE372 MD373 AM374 BY375 AD376 MC377 SM378 UA380 RS381 ME382 " +
  "XK383 HR385 SI386 BA387 MK389 CZ420 SK421 LI423 FK500 BZ501 GT502 SV503 HN504 NI505 CR506 PA507 PM508 " +
  "HT509 GP590 BO591 GY592 EC593 GF594 PY595 MQ596 SR597 UY598 CW599 TL670 BN673 NR674 PG675 TO676 SB677 " +
  "VU678 FJ679 PW680 WF681 CK682 NU683 WS685 KI686 NC687 TV688 PF689 TK690 FM691 MH692 KP850 HK852 MO853 " +
  "KH855 LA856 BD880 TW886 MV960 LB961 JO962 SY963 IQ964 KW965 SA966 YE967 OM968 PS970 AE971 IL972 BH973 " +
  "QA974 BT975 MN976 NP977 TJ992 TM993 AZ994 GE995 KG996 UZ998";

/** Every country Fabric's phone field offers, with its dialling code. */
export const PHONE_COUNTRIES: readonly FabricPhoneCountry[] = RAW.split(" ").map((s) => ({
  code: s.slice(0, 2),
  dial: s.slice(2),
}));

/** The flag emoji for a country code ("GB" → 🇬🇧). */
export function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** The country's name in a locale, falling back to the code. */
export function countryName(code: string, locale?: string): string {
  try {
    return (
      new Intl.DisplayNames(locale ? [locale] : undefined, { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

/** A phone number split into its country and the digits after the dialling code. */
export interface ParsedPhone {
  country: FabricPhoneCountry | null;
  national: string;
}

/**
 * Splits an E.164 number ("+442071234567") into its country and national digits.
 * Prefers `preferred` when several countries share a code (+1, +7).
 */
export function parsePhone(
  value: string,
  countries: readonly FabricPhoneCountry[] = PHONE_COUNTRIES,
  preferred?: string,
): ParsedPhone {
  const digits = value.replace(/\D/g, "");
  if (!value.trim().startsWith("+") || digits === "") return { country: null, national: digits };
  for (let len = 4; len >= 1; len--) {
    const dial = digits.slice(0, len);
    const matches = countries.filter((c) => c.dial === dial);
    if (matches.length) {
      const country = matches.find((c) => c.code === preferred) ?? matches[0];
      return { country, national: digits.slice(len) };
    }
  }
  return { country: null, national: digits };
}

/** Joins a country and national digits into E.164 ("+44" + "2071234567"). Empty digits give "". */
export function toE164(country: FabricPhoneCountry, national: string): string {
  // Most countries drop the leading trunk "0" internationally; Italy and San Marino keep it.
  const keepZero = country.code === "IT" || country.code === "SM";
  const all = national.replace(/\D/g, "");
  const digits = keepZero ? all : all.replace(/^0+/, "");
  return digits ? `+${country.dial}${digits}` : "";
}

/** True for a plausible E.164 number: "+", a country code, and 8 to 15 digits in all. */
export function isE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}
