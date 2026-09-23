# Contributing

Thank you for helping improve the Adaption documentation.

## What to change

Most contributions belong in:

- `src/content/docs/` for guides, tutorials, and examples
- `astro.config.ts` for sidebar navigation
- `src/components/`, `src/styles/`, or `theme.css` for site presentation

API reference pages are generated from `spec/openapi.json` and
`spec/openapi.stainless.yml`. Both files arrive through an automated sync from
the API source; do not edit them or the generated pages here. If the reference
is wrong, open an issue naming the endpoint and what it should say.

## Set up the site

You need Node.js 22.12 or newer and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm dev
```

The development site runs at [localhost:4321](http://localhost:4321/).

## Authoring documentation

- Write documentation as MDX in `src/content/docs/`. English lives at the top
  level; `zh/`, `ja/`, `pt/`, `es/` and `ar/` mirror it page for page.
- Include clear `title` and `description` frontmatter.
- Prefer short sections, direct language, and examples readers can run.
- Use relative links for repository files and root-relative links for docs
  pages.
- Update the sidebar in `astro.config.ts` when a new page should appear in the
  main navigation.
- Never include real API keys, credentials, customer data, or other secrets.

Python examples are checked against the published `adaption` package. If you
have [uv](https://docs.astral.sh/uv/) installed, run:

```sh
uv run --no-project --with adaption --with mypy \
  python3 scripts/check_snippets.py
```

You can enable the same check as a pre-push hook once per clone:

```sh
git config core.hooksPath .githooks
```

## Translating

A new English page needs a counterpart at the same relative path under every
locale directory, or that language quietly serves the English page instead.
Copy code fences verbatim, prefix internal links with the locale (`/ja/...`,
but never `/ja/api/...`), and point anchors at the translated heading. The
README's [Translations](./README.md#translations) section has the full
conventions and how to add a language.

Check coverage and drift with:

```sh
python3 scripts/check_translations.py
```

## Submit a pull request

1. Fork the repository and create a focused branch.
2. Make and preview your changes locally.
3. Format the repository with `pnpm format`.
4. Validate Python snippets when your change includes them, and run
   `python3 scripts/check_translations.py` when it touches `src/content/docs/`.
5. Build the complete site with `pnpm build`.
6. Open a pull request that explains what changed and why.

Before submitting, confirm that:

- links and code examples are accurate;
- new pages are reachable and included in navigation when appropriate;
- every new page has a counterpart in all five translated locales;
- formatting and the production build pass; and
- the change contains no credentials or generated build output.
