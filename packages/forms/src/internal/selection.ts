/** Set membership without mutating the form's current checkbox-array value. */
export function setMembership<T>(values: readonly T[], value: T, checked: boolean): T[] {
  return checked
    ? values.includes(value)
      ? [...values]
      : [...values, value]
    : values.filter((item) => item !== value);
}
