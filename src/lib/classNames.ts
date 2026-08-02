/**
 * Joins conditional class names, skipping falsy values.
 *
 * A minimal, dependency-free stand-in for `clsx`/`classnames` so every
 * component composes class names the same way instead of repeating the
 * `[...].filter(Boolean).join(' ')` pattern.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
