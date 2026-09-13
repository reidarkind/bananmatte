import { playBonusRide } from "../bonus/session";
import type { Locale, Rng, Settings } from "../types";

export function renderBonusRide(
  host: HTMLElement,
  opts: {
    milestone: number;
    locale: Locale;
    settings: Settings;
    rng: Rng;
    score?: number;
    onDone: () => void;
  },
): () => void {
  return playBonusRide(host, opts);
}
