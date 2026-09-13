export function parseBonusCheat(typed: string, expected: number): number | null {
  if (!typed.startsWith("1337")) return null;
  const rest = typed.slice(4);
  for (let cut = 2; cut <= rest.length; cut += 1) {
    const suffix = rest.slice(-cut);
    const mid = rest.slice(0, -cut);
    const milestone = Number(suffix);
    if (milestone >= 10 && milestone % 10 === 0 && String(milestone) === suffix && mid === String(expected)) {
      return milestone;
    }
  }
  return null;
}
