import { Button } from "@/shared/ui/kit";
import { HEADER_LINKS } from "@/i18n/nav";
import { localizePath, type TranslationKey } from "@/i18n/locales";

type Props = {
  /** Resolved by `Header.astro` from `Astro.currentLocale`. */
  lang?: TranslationKey;
};

/**
 * Localized replacement for the Stainless `HeaderLinks`.
 *
 * Stainless builds its header links from `header.links` in `astro.config.ts`
 * into one build-time global, and its `HeaderLink` type has no `translations`
 * field the way Starlight's sidebar entries do. So the labels are resolved
 * here, against the active locale, instead of in config.
 *
 * The `link` values are localized too: `/resources/support` becomes
 * `/ja/resources/support` on a Japanese page, while the absolute login URL is
 * left alone.
 *
 * This uses the repo's own button kit rather than the `Button` from
 * `@stainless-api/ui-primitives` that the stock header reaches for: that
 * package is only a transitive dependency, and adding it directly would mean
 * regenerating the lockfile, which on pnpm 11 silently drops the `vite` patch
 * this repo declares under `package.json#pnpm`. `secondary` and `black` are
 * this kit's equivalents of the stock `outline` and `accent`.
 */
export default function HeaderLinks({ lang = "en" }: Props) {
  const links = [
    {
      label: lang === "en" ? "Support" : HEADER_LINKS.support[lang],
      href: localizePath("/resources/support", lang),
      variant: "secondary" as const,
    },
    {
      label: lang === "en" ? "Login" : HEADER_LINKS.login[lang],
      href: "https://adaptionlabs.ai/app/auth",
      variant: "black" as const,
    },
  ];

  return (
    <>
      {links.map((link) => (
        <Button key={link.href} asChild variant={link.variant} size="40">
          <a href={link.href}>{link.label}</a>
        </Button>
      ))}
    </>
  );
}
