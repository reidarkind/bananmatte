export function explainParity(n: number): string {
  if (n % 2 === 0) {
    return `${n} kan deles på 2 og er derfor et partall.`;
  }
  return `${n} kan ikke deles på 2 og er derfor et oddetall.`;
}

export function explainParitySum(x: number, y: number): string {
  const sum = x + y;
  return `${x} + ${y} = ${sum}. ${explainParity(sum)}`;
}

export function explainParityDiff(x: number, y: number): string {
  const diff = x - y;
  return `${x} − ${y} = ${diff}. ${explainParity(diff)}`;
}

export function explainAdd(x: number, y: number): string {
  return `Når du legger ${y} til ${x}, får du ${x + y}.`;
}

export function explainSub(x: number, y: number): string {
  return `Når du tar ${y} fra ${x}, får du ${x - y}.`;
}

export function explainMul(x: number, k: number): string {
  return `${x} · ${k} betyr ${k} ganger ${x}. Det blir ${x * k}.`;
}

export function explainDiv(numerator: number, divisor: number, quotient: number): string {
  return `${divisor} får plass ${quotient} ganger i ${numerator}, fordi ${divisor} · ${quotient} = ${numerator}.`;
}

export function explainTiervenn(x: number, answer: number): string {
  return `Tiervennen fyller opp til neste ti. ${x} + ${answer} = ${x + answer}, derfor er tiervennen ${answer}.`;
}

export function explainHundrevenn(x: number, answer: number): string {
  return `Hundrevennen fyller opp til neste hundre. ${x} + ${answer} = ${x + answer}, derfor er hundrevennen ${answer}.`;
}
