# Adaption API documentation

This repository contains the source for the
[Adaption documentation](https://docs.adaptionlabs.ai), including guides,
tutorials, and the API reference.

The site is built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build).

## Repository structure

- `src/content/docs/` — authored guides and tutorials (English at the top
  level, translations under `zh/`, `ja/`, `pt/`, `es/`, `ar/`)
- `src/components/` — custom site components
- `src/i18n/` — the locale list and the strings used by those components
- `src/styles/` and `theme.css` — site styling and design tokens
- `astro.config.ts` — navigation and site configuration
- `spec/` — the committed OpenAPI document and API reference configuration
- `scripts/check_snippets.py` — Python example validation
- `scripts/check_translations.py` — translation coverage and drift validation

API reference pages are generated locally at build time from
`spec/openapi.json` and `spec/openapi.stainless.yml`. Both files are generated
at the API source and arrive here through an automated sync, which opens a pull
request on the `chore/sync-api-spec` branch whenever the public API changes.
Do not edit them here: the next sync overwrites the edit, and until then the
site would describe an API that is not served. If the reference is wrong, open
an issue naming the endpoint and what it should say. Edit prose and examples in
`src/content/docs/`.

## Local development

Requirements:

- Node.js 22.12 or newer
- [pnpm](https://pnpm.io/)

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

Open [localhost:4321](http://localhost:4321/).

To create and preview a production build:

```sh
pnpm build
pnpm preview
```

No account or API key is needed for these commands.

## Translations

The site ships in six languages. English is the root locale and keeps its
existing URLs (`/adaptive-data/overview`); the rest are served under a prefix:

| Locale             | Prefix | Directory              |
| ------------------ | ------ | ---------------------- |
| English            | —      | `src/content/docs/`    |
| Simplified Chinese | `/zh`  | `src/content/docs/zh/` |
| Japanese           | `/ja`  | `src/content/docs/ja/` |
| Portuguese (BR)    | `/pt`  | `src/content/docs/pt/` |
| Spanish            | `/es`  | `src/content/docs/es/` |
| Arabic             | `/ar`  | `src/content/docs/ar/` |

Arabic is configured `dir: "rtl"`, which flips the whole page frame.

Readers switch languages with the picker in the header. It is Starlight's
built-in `<LanguageSelect />`, rendered by the Stainless header as soon as more
than one locale is configured — there is no custom component behind it.

### Adding a page

Add the English page first, then a file at the **same relative path** under each
locale directory. A locale that is missing a page falls back to the English one
at runtime, so a gap looks like a half-translated site rather than an error —
`scripts/check_translations.py` is what turns it back into an error.

### Translation conventions

- **Code fences are copied verbatim.** `check_translations.py` asserts they are
  byte-identical to English, which is what lets `check_snippets.py` type-check
  the English pages alone instead of all six copies.
- **Internal links take the locale prefix** (`](/ja/adaptive-data/overview)`).
  The one exception is `/api/...`: see below.
- **Anchors follow the translated heading.** Astro derives a heading's id from
  its text, so a translated heading has a translated anchor. Links into a
  heading must use the id that page's own translation produces.
- **Product names stay in English** — Adaption, Adaptive Data, AutoScientist,
  Blueprint, Forge — as do identifiers, environment variables, and labels that
  name a control in the (English) Adaption web app.

### Adding a language

1. Add it to `LOCALES` and `LOCALE_PREFIXES` in `src/i18n/locales.ts`, using a
   `lang` tag that [Starlight ships UI strings for][starlight-i18n]; otherwise
   supply them yourself.
2. Add its key to `LANG_TO_KEY` in the same file, and a value for every entry in
   `src/i18n/ui.ts` and `src/i18n/nav.ts` — both are typed, so a missing one is
   a type error rather than an English string in production.
3. Add its prefix to `LOCALES` in `scripts/check_translations.py`.
4. Translate `src/content/docs/**` into the new directory.

[starlight-i18n]: https://starlight.astro.build/guides/i18n/

### The API reference is English only

`/api/**` is generated at build time by `@stainless-api/docs` from
`spec/openapi.json`, and that package builds it exactly once: its Astro
integration, its Starlight plugin, and its Vite virtual module all use fixed
names, so a second instance pointed at a translated spec collides with the
first. There is therefore no `/zh/api`, and links into the reference stay
unprefixed in every language. Translating it needs a change in
`@stainless-api/docs` — parameterized plugin and virtual-module names, or a
locale option of its own.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the
authoring conventions, validation commands, and pull request checklist.

For help using Adaption rather than changing these docs, see the
[support page](https://docs.adaptionlabs.ai/resources/support).

## License

Except where otherwise noted, this work is licensed under the
[Creative Commons Attribution 4.0 International License](./LICENSE).
