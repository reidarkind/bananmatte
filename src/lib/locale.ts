import { LOCALES, type Locale } from "../types";

const PHONE_TO_LOCALE: Record<string, Locale> = {
  nb: "nb",
  no: "nb",
  nn: "nb",
  en: "en",
  es: "es",
  de: "de",
  pt: "pt",
  sv: "sv",
  da: "da",
};

export function localeFromNavigator(languages: readonly string[]): Locale {
  for (const raw of languages) {
    const primary = raw.toLowerCase().replace("_", "-").split("-")[0] ?? "";
    const mapped = PHONE_TO_LOCALE[primary];
    if (mapped && LOCALES.includes(mapped)) return mapped;
  }
  return "en";
}
