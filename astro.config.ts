import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import { generateAPIReferenceItems, stainlessDocs } from "@stainless-api/docs";
import tailwindcss from "@tailwindcss/vite";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

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
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
  redirects: {
    // The /guides/* set was superseded by the Adaptive Data and AutoScientist
    // sections. Keep inbound and indexed links pointed at their replacements.
    "/guides/supported-models": "/autoscientist/supported-models",
    "/guides/adaptive-data": "/adaptive-data/overview",
    "/guides/column-selection": "/adaptive-data/select-columns",
    "/guides/universal-prompts": "/adaptive-data/select-columns",
    "/guides/multimodal-context": "/adaptive-data/select-columns",
    "/guides/applying-preferences": "/adaptive-data/configure-adaptive-data",
    "/guides/safety-and-length-constraints":
      "/adaptive-data/configure-adaptive-data",
    "/guides/mitigating-hallucinations":
      "/adaptive-data/configure-adaptive-data",
    "/guides/reasoning-traces": "/adaptive-data/configure-adaptive-data",
    "/guides/processing-large-datasets":
      "/adaptive-data/configure-adaptive-data",
    "/guides/evaluating-dataset-quality":
      "/adaptive-data/evaluate-dataset-quality",
    "/guides/autoscientist": "/autoscientist/overview",
    "/guides/autoscientist-api": "/autoscientist/running-autoscientist",
    "/guides/processing-unstructured-documents":
      "/tutorials/processing-unstructured-documents",
  },
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
          label: "Adaptive Data",
          items: [
            "adaptive-data/overview",
            "adaptive-data/create-a-dataset",
            "adaptive-data/invent-a-dataset",
            "adaptive-data/select-columns",
            "adaptive-data/configure-adaptive-data",
            "adaptive-data/evaluate-dataset-quality",
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
          label: "Tutorials",
          items: [
            "tutorials/adaptive-data-app-walkthrough",
            "tutorials/processing-unstructured-documents",
            "tutorials/autoscientist-app-walkthrough",
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
          components: {
            PageTitle: "./src/components/PageTitle/PageTitle.astro",
            Pagination: "./src/components/Pagination/Pagination.astro",
          },
        },
      },
    }),
  ],
});
