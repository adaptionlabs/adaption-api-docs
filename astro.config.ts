import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { generateAPIReferenceItems, stainlessDocs } from "@stainless-api/docs";
import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

const vercelRedirects: { source: string; destination: string }[] = JSON.parse(
  readFileSync(new URL("./vercel.json", import.meta.url), "utf8"),
).redirects;

// The API reference used to be fetched from the Stainless API on every build.
// That API is retired, so the spec and the config live in `spec/` and ship with
// the repo. Both stay overridable: set either variable to point the build at an
// unpublished spec instead. See README "API reference spec".
process.env.OPENAPI_PATH ??= fileURLToPath(
  new URL("./spec/openapi.json", import.meta.url),
);
process.env.STAINLESS_CONFIG_PATH ??= fileURLToPath(
  new URL("./spec/openapi.stainless.yml", import.meta.url),
);

// https://astro.build/config
export default defineConfig({
  // Canonical origin. The sitemap integration skips itself without this.
  site: "https://docs.adaptionlabs.ai",
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
          test: (element) =>
            !Object.hasOwn(element.properties ?? {}, "dataSameTab"),
        },
      ],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
  // The /guides/* set was superseded by the Adaptive Data and AutoScientist
  // sections; the redirects keep inbound and indexed links pointed at their
  // replacements. They live in vercel.json because that is what production
  // serves: @stainless-api/docs turns off Astro's redirect pages at build time
  // and writes them to _stainless/redirects.json, which only Stainless hosting
  // reads. Reading the same file here keeps `pnpm dev` in step.
  redirects: Object.fromEntries(
    vercelRedirects.map(({ source, destination }) => [
      source.replace("{/}?", ""),
      destination,
    ]),
  ),
  integrations: [
    stainlessDocs({
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
        alt: "Adaption",
      },
      apiReference: {
        stainlessProject: "adaption",
        defaultLanguage: "python",
        excludeLanguages: ["typescript", "node"],
        propertySettings: {
          collapseDescription: false,
          expandDepth: 2,
        },
      },
      title: "Adaption",
      favicon: "/favicon.ico",
      customCss: ["./theme.css"],
      editLink: {
        baseUrl: "https://github.com/adaptionlabs/adaption-api-docs/edit/main/",
      },
      // NOTE: @stainless-api/docs accepts `defaultLanguage` but never applies it —
      // its applyLanguageToLinks() helper is exported and never called, so every
      // link into /api lands on the HTTP variant. Do what that helper would do.
      head: [
        {
          tag: "script",
          content: `
            document.addEventListener("DOMContentLoaded", function () {
              var lang = localStorage.getItem("stldocs-selected-language") || "python";
              if (lang === "http") return;
              var prefix = "/api/" + lang;
              document.querySelectorAll('a[href^="/api"]').forEach(function (a) {
                var href = a.getAttribute("href");
                if (href === prefix || href.startsWith(prefix + "/")) return;
                if (href === "/api" || href === "/api/") {
                  a.setAttribute("href", prefix);
                } else if (href.startsWith("/api/")) {
                  a.setAttribute("href", prefix + href.slice("/api".length));
                }
              });
            });
          `,
        },
        {
          // Heading anchor icons: clicking one also copies the heading's URL
          // to the clipboard, and briefly shows a "Copied" tooltip.
          tag: "script",
          content: `
            document.addEventListener("click", function (event) {
              var link = event.target.closest("a.sl-anchor-link");
              if (!link || !navigator.clipboard) return;
              var url = new URL(link.getAttribute("href"), window.location.href).href;
              navigator.clipboard.writeText(url).then(function () {
                link.setAttribute("data-copied", "");
                clearTimeout(link._copiedTimer);
                link._copiedTimer = setTimeout(function () {
                  link.removeAttribute("data-copied");
                }, 1500);
              });
            });
          `,
        },
      ],
      header: {
        layout: "stacked",
        links: [
          {
            label: "Support",
            link: "/resources/support",
          },
          {
            label: "Login",
            link: "https://adaptionlabs.ai/app/auth",
            attrs: {
              target: "_blank",
              rel: "noopener noreferrer",
            },
          },
        ],
      },
      // Global sidebar (no top tabs). See https://www.stainless.com/docs/docs-platform/navigation/
      sidebar: [
        {
          label: "Introduction",
          items: [
            "introduction/getting-started",
            "adaptive-data-quickstart",
            "autoscientist-quickstart",
          ],
        },
        {
          label: "Inference Stacks",
          items: [
            "inference-stacks/quickstart",
            "inference-stacks/key-concepts",
            "inference-stacks/generate-a-model-response",
            "inference-stacks/models",
          ],
        },
        {
          label: "Adaptive Data",
          items: [
            "adaptive-data/overview",
            "adaptive-data/create-a-dataset",
            "adaptive-data/invent-a-dataset",
            "adaptive-data/select-columns",
            "adaptive-data/expand-data",
            "adaptive-data/extend-trajectories",
            "adaptive-data/configure-adaptive-data",
            "adaptive-data/evaluate-dataset-quality",
            "adaptive-data/combine-datasets",
          ],
        },
        {
          label: "AutoScientist",
          items: [
            "autoscientist/overview",
            "autoscientist/data-augmentation",
            "autoscientist/running-autoscientist",
            "autoscientist/interpreting-results",
            "autoscientist/download-the-model",
            "autoscientist/run-on-non-adapted-data",
            "autoscientist/supported-models",
            "autoscientist/recommended-hyperparameters",
          ],
        },
        {
          label: "Runbooks",
          items: [
            "runbooks/adaptive-data-app-walkthrough",
            "runbooks/processing-unstructured-documents",
            "runbooks/autoscientist-app-walkthrough",
            "runbooks/invent-a-dataset",
            "runbooks/expand-a-dataset",
            "runbooks/extend-trajectories",
            "runbooks/train-with-autoscientist",
          ],
        },
        {
          label: "Tools",
          items: [
            "tools/mcp",
            "tools/cursor-plugin",
            "tools/claude-plugin",
            "tools/codex-plugin",
            "tools/hermes-plugin",
            "oauth",
          ],
        },
        {
          label: "Resources",
          items: ["resources/faq", "resources/support"],
        },
        {
          label: "Reference",
          items: [
            ...generateAPIReferenceItems(
              { excludeResourceOverviewPages: true },
              (items) =>
                items.map((item) =>
                  item.kind === "group" ? { ...item, collapsed: true } : item,
                ),
            ),
          ],
        },
        {
          label: "Join Discord",
          link: "https://discord.gg/sHhG8kwVav",
          attrs: {
            class: "sl-social-link",
            "data-social": "discord",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
        {
          label: "Follow on X",
          link: "https://x.com/adaption_ai",
          attrs: {
            class: "sl-social-link",
            "data-social": "x",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
        {
          label: "LinkedIn",
          link: "https://www.linkedin.com/company/adaption-labs/",
          attrs: {
            class: "sl-social-link",
            "data-social": "linkedin",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
        {
          label: "Blog",
          link: "https://adaptionlabs.ai/blog",
          attrs: {
            class: "sl-social-link",
            "data-social": "blog",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      ],
      experimental: {
        starlightCompat: {
          routeMiddleware: "./src/route-data.ts",
          components: {
            PageTitle: "./src/components/PageTitle/PageTitle.astro",
            Pagination: "./src/components/Pagination/Pagination.astro",
          },
        },
      },
    }),
  ],
});
