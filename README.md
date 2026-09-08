# Adaption API documentation

This repository contains the source for the
[Adaption documentation](https://docs.adaptionlabs.ai), including guides,
tutorials, and the API reference.

The site is built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build).

## Repository structure

- `src/content/docs/` — authored guides and tutorials
- `src/components/` — custom site components
- `src/styles/` and `theme.css` — site styling and design tokens
- `astro.config.ts` — navigation and site configuration
- `spec/` — the committed OpenAPI document and API reference configuration
- `scripts/check_snippets.py` — Python example validation

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

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the
authoring conventions, validation commands, and pull request checklist.

For help using Adaption rather than changing these docs, see the
[support page](https://docs.adaptionlabs.ai/resources/support).

## License

Except where otherwise noted, this work is licensed under the
[Creative Commons Attribution 4.0 International License](./LICENSE).
