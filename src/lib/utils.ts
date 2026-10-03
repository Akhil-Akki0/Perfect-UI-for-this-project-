export function cn(...inputs: (string | undefined | null | false)[]) {
  const joined = inputs.filter(Boolean).join(" ");
  if (/\b(fixed|absolute|sticky)\b/.test(joined)) {
    return joined
      .split(/\s+/)
      .filter((cls) => cls !== "relative")
      .join(" ");
  }
  return joined;
}
