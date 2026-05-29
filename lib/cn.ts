// Tiny class-name joiner so components can compose variants without pulling
// in clsx/tailwind-merge. Filters out falsy values and joins with spaces.
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
