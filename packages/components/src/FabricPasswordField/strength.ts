/** How strong a password is, from 0 (very weak) to 4 (strong). */
export interface FabricPasswordStrength {
  /** 0 very weak · 1 weak · 2 fair · 3 good · 4 strong. */
  score: 0 | 1 | 2 | 3 | 4;
  /** Word for the score, e.g. "Fair". */
  label: string;
  /** One short tip for a stronger password, when there is one. */
  hint?: string;
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;

// A short list catches the passwords people reach for first. Apps that need real
// breach checks should pass their own `getStrength` (e.g. zxcvbn or an API).
const COMMON = new Set([
  "password",
  "passw0rd",
  "123456",
  "12345678",
  "123456789",
  "qwerty",
  "qwertyuiop",
  "letmein",
  "welcome",
  "admin",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "111111",
  "000000",
]);

/**
 * A quick, dependency-free strength estimate. It rewards length and mixing
 * letters, digits and symbols, and marks down common passwords, repeats and
 * runs such as "abcd" or "1234".
 */
export function scorePassword(password: string): FabricPasswordStrength {
  if (password === "") return { score: 0, label: LABELS[0], hint: "Enter a password." };
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || COMMON.has(lower.replace(/[^a-z0-9]/g, ""))) {
    return { score: 0, label: LABELS[0], hint: "This is a common password. Choose another." };
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(password),
  ).length;
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (password.length >= 16) points++;
  if (classes >= 2) points++;
  if (classes >= 3) points++;

  const patterned = /(.)\1{2,}/.test(password) || hasRun(lower, 4);
  if (patterned) points--;

  // Short passwords top out at "Fair", and ones with runs or repeats at "Good".
  const cap = password.length < 8 ? 1 : password.length < 12 ? 2 : patterned ? 3 : 4;
  const score = Math.max(0, Math.min(cap, points)) as 0 | 1 | 2 | 3 | 4;
  let hint: string | undefined;
  if (password.length < 12) hint = "Use at least 12 characters.";
  else if (classes < 3) hint = "Mix letters, numbers and symbols.";
  else if (score < 4) hint = "Avoid repeated characters and sequences.";
  return { score, label: LABELS[score], hint };
}

/** True when the text has an ascending or descending run like "abcd" or "4321". */
function hasRun(s: string, length: number): boolean {
  let up = 1;
  let down = 1;
  for (let i = 1; i < s.length; i++) {
    const d = s.charCodeAt(i) - s.charCodeAt(i - 1);
    up = d === 1 ? up + 1 : 1;
    down = d === -1 ? down + 1 : 1;
    if (up >= length || down >= length) return true;
  }
  return false;
}
