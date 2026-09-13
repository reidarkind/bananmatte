export type DisplayProbe = {
  matchMedia?: (query: string) => { matches: boolean };
  standalone?: boolean;
};

function browserProbe(): DisplayProbe {
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { standalone?: boolean });
  return {
    matchMedia: typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? (query) => window.matchMedia(query)
      : undefined,
    standalone: Boolean(nav?.standalone),
  };
}

export function isStandaloneDisplay(probe: DisplayProbe = browserProbe()): boolean {
  if (probe.standalone) return true;
  return probe.matchMedia?.("(display-mode: standalone)").matches === true;
}
