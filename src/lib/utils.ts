/**
 * Merges an arbitrary number of class name values into a single string.
 * Falsy values (false, null, undefined, empty string) are silently dropped.
 *
 * Example:
 *   cn("base", isActive && "active", undefined, "extra")
 *   // → "base active extra"
 */
export function cn(
  ...classes: (string | boolean | null | undefined)[]
): string {
  return classes
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .join(" ");
}

/**
 * Linearly interpolates between two values.
 *
 * @param a - Start value (returned when t === 0).
 * @param b - End value (returned when t === 1).
 * @param t - Interpolation factor. Values outside [0, 1] extrapolate.
 * @returns The interpolated value.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamps a numeric value to the inclusive range [min, max].
 *
 * @param value - The value to clamp.
 * @param min   - Lower bound (inclusive).
 * @param max   - Upper bound (inclusive).
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
