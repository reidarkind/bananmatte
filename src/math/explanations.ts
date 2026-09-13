import type { CompareAnswer, Locale } from "../types";

function nordic(locale: Locale): boolean {
  return locale === "nb" || locale === "sv" || locale === "da";
}

function parityWord(n: number, locale: Locale): string {
  if (!nordic(locale)) return n % 2 === 0 ? "even" : "odd";
  if (locale === "sv") return n % 2 === 0 ? "jämnt" : "udda";
  if (locale === "da") return n % 2 === 0 ? "lige" : "ulige";
  return n % 2 === 0 ? "partall" : "oddetall";
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function article(locale: Locale, word: string): string {
  if (!nordic(locale)) return word;
  return `et ${word}`;
}

function explainParityCombo(x: number, y: number, op: "+" | "−", result: number, locale: Locale): string {
  const left = parityWord(x, locale);
  const right = parityWord(y, locale);
  const out = parityWord(result, locale);
  if (!nordic(locale)) {
    return `${x} is ${left} and ${y} is ${right}. ${capitalize(left)} ${op} ${right} = ${out}.`;
  }
  return `${x} er ${article(locale, left)} og ${y} er ${article(locale, right)}. ${capitalize(left)} ${op} ${right} = ${out}.`;
}

export function explainParity(n: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) {
    return n % 2 === 0
      ? `${n} can be divided by 2, so it is even.`
      : `${n} cannot be divided by 2, so it is odd.`;
  }
  if (n % 2 === 0) {
    return `${n} kan deles på 2 og er derfor et partall.`;
  }
  return `${n} kan ikke deles på 2 og er derfor et oddetall.`;
}

export function explainParitySum(x: number, y: number, locale: Locale = "nb"): string {
  const sum = x + y;
  return `${x} + ${y} = ${sum}. ${explainParityCombo(x, y, "+", sum, locale)} ${explainParity(sum, locale)}`;
}

export function explainParityDiff(x: number, y: number, locale: Locale = "nb"): string {
  const diff = x - y;
  return `${x} − ${y} = ${diff}. ${explainParityCombo(x, y, "−", diff, locale)} ${explainParity(diff, locale)}`;
}

export function explainAdd(x: number, y: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) return `When you add ${y} to ${x}, you get ${x + y}.`;
  return `Når du legger ${y} til ${x}, får du ${x + y}.`;
}

export function explainPlaceValue(parts: number[], locale: Locale = "nb"): string {
  const sum = parts.reduce((total, part) => total + part, 0);
  const expr = parts.join(" + ");
  if (!nordic(locale)) {
    return parts.length === 3
      ? `${expr} = ${sum}. Add the ones, the tens and the hundreds.`
      : `${expr} = ${sum}. Add the ones and the tens.`;
  }
  return parts.length === 3
    ? `${expr} = ${sum}. Du legger sammen ener, tiere og hundre.`
    : `${expr} = ${sum}. Du legger sammen ener og tiere.`;
}

export function explainSub(x: number, y: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) return `When you take ${y} from ${x}, you get ${x - y}.`;
  return `Når du tar ${y} fra ${x}, får du ${x - y}.`;
}

export function explainMul(x: number, k: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) return `${x} · ${k} means ${k} times ${x}. That is ${x * k}.`;
  return `${x} · ${k} betyr ${k} ganger ${x}. Det blir ${x * k}.`;
}

export function explainDiv(numerator: number, divisor: number, quotient: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) {
    return `${divisor} fits ${quotient} times in ${numerator}, because ${divisor} · ${quotient} = ${numerator}.`;
  }
  return `${divisor} får plass ${quotient} ganger i ${numerator}, fordi ${divisor} · ${quotient} = ${numerator}.`;
}

export function explainFriend(name: string, x: number, answer: number, base: number, locale: Locale = "nb"): string {
  if (!nordic(locale)) {
    return `The ${name} fills up to the next ${base}. ${x} + ${answer} = ${x + answer}, so the friend is ${answer}.`;
  }
  return `${name} fyller opp til neste ${base}. ${x} + ${answer} = ${x + answer}, derfor er ${name.toLowerCase()} ${answer}.`;
}

export function explainTiervenn(x: number, answer: number, locale: Locale = "nb"): string {
  return explainFriend(!nordic(locale) ? "tens friend" : "Tiervennen", x, answer, 10, locale);
}

export function explainHundrevenn(x: number, answer: number, locale: Locale = "nb"): string {
  return explainFriend(!nordic(locale) ? "hundreds friend" : "Hundrevennen", x, answer, 100, locale);
}

export function explainRound(x: number, result: number, base: number, dir: "up" | "down" | "nearest", locale: Locale = "nb"): string {
  const unit = base === 100
    ? !nordic(locale) ? "hundred" : "hundre"
    : !nordic(locale) ? "ten" : "tier";
  if (dir === "up") {
    return !nordic(locale)
      ? `${x} rounded up to the nearest ${unit} is ${result}.`
      : `${x} rundet opp til nærmeste ${unit} blir ${result}.`;
  }
  if (dir === "down") {
    if (x < base) {
      return !nordic(locale)
        ? `Numbers smaller than ${base} become 0 when you round down to the nearest ${unit}. ${x} becomes 0.`
        : `Tall mindre enn ${base} blir 0 når du runder ned til nærmeste ${unit}. ${x} blir 0.`;
    }
    return !nordic(locale)
      ? `${x} rounded down to the nearest ${unit} is ${result}.`
      : `${x} rundet ned til nærmeste ${unit} blir ${result}.`;
  }
  return !nordic(locale)
    ? `${x} is closest to ${result}. We round 5 and up to the next ${unit}.`
    : `${x} er nærmest ${result}. Vi runder 5 og mer opp til neste ${unit}.`;
}

export function explainCompare(x: number, y: number, answer: CompareAnswer, locale: Locale = "nb"): string {
  if (!nordic(locale)) {
    if (answer === "gt") return `${x} is greater than ${y}, so > is right.`;
    if (answer === "lt") return `${x} is less than ${y}, so < is right.`;
    return `${x} is equal to ${y}, so = is right.`;
  }
  if (answer === "gt") return `${x} er større enn ${y}, derfor passer >.`;
  if (answer === "lt") return `${x} er mindre enn ${y}, derfor passer <.`;
  return `${x} er lik ${y}, derfor passer =.`;
}

export function nFriend(n: number, base: number): number {
  return (base - (n % base)) % base;
}

export function roundTo(n: number, base: number, dir: "up" | "down" | "nearest"): number {
  if (dir === "up") return Math.ceil(n / base) * base;
  if (dir === "down") return Math.floor(n / base) * base;
  return Math.round(n / base) * base;
}

export function compareOf(x: number, y: number): CompareAnswer {
  if (x > y) return "gt";
  if (x < y) return "lt";
  return "eq";
}
