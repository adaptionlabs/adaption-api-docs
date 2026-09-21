/**
 * Single source of truth for the languages the docs ship in.
 *
 * English is the `root` locale: it stays at `/getting-started`, not
 * `/en/getting-started`, so every published URL, inbound link and entry in the
 * `redirects` map keeps working untouched. Every other language is served under
 * its own prefix.
 *
 * `lang` is the BCP-47 tag Starlight uses to pick its own UI strings — it must
 * match a file in `@astrojs/starlight/translations`, which is why Chinese is
 * `zh-CN` and Portuguese is `pt-BR` while their URL prefixes stay short.
 */

export type LocaleKey = "root" | "zh" | "ja" | "pt" | "es" | "ar";

/** The URL prefix a locale is served under. `root` has none. */
export type LocaleDir = (typeof LOCALES)[LocaleKey]["dir"];

export const LOCALES = {
  root: { label: "English", lang: "en" },
  zh: { label: "简体中文", lang: "zh-CN" },
  ja: { label: "日本語", lang: "ja" },
  pt: { label: "Português", lang: "pt-BR" },
  es: { label: "Español", lang: "es" },
  ar: { label: "العربية", lang: "ar", dir: "rtl" },
} as const satisfies Record<
  string,
  { label: string; lang: string; dir?: "rtl" }
>;

/** URL prefixes of the non-English locales, in picker order. */
export const LOCALE_PREFIXES = ["zh", "ja", "pt", "es", "ar"] as const;
export type LocalePrefix = (typeof LOCALE_PREFIXES)[number];

/** Keys used by every per-locale string table in this directory. */
export type TranslationKey = "en" | LocalePrefix;

/** Starlight `lang` tag -> the key our own string tables are indexed by. */
export const LANG_TO_KEY: Record<string, TranslationKey> = {
  en: "en",
  "zh-CN": "zh",
  ja: "ja",
  "pt-BR": "pt",
  es: "es",
  ar: "ar",
};

/**
 * Resolve whatever Starlight hands us (`Astro.currentLocale`, a route locale,
 * or `undefined` on the root locale) to a key in our string tables.
 */
export function toTranslationKey(lang: string | undefined): TranslationKey {
  if (!lang) return "en";
  return LANG_TO_KEY[lang] ?? LANG_TO_KEY[lang.split("-")[0]!] ?? "en";
}

/**
 * Prefix an internal, absolute doc path with the active locale.
 * `localizePath("/resources/faq", "ja")` -> `/ja/resources/faq`.
 *
 * Returned unchanged: the English root, anything that is not a site-absolute
 * path (external URLs, `mailto:`, fragments), and `/api/**` — the Stainless
 * reference is generated once, in English, so `/ja/api` is not a route. See
 * README "The API reference is English only".
 */
export function localizePath(path: string, key: TranslationKey): string {
  if (key === "en") return path;
  if (!path.startsWith("/")) return path;
  if (path === "/api" || path.startsWith("/api/")) return path;
  return `/${key}${path}`;
}
