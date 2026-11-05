import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

const OG_WIDTH = "1200";
const OG_HEIGHT = "630";

export const onRequest = defineRouteMiddleware(({ url, site, locals }) => {
  const route = locals.starlightRoute;

  // Stainless excludes generated pages from Pagefind. Index method pages so
  // searches can link directly to an endpoint, without indexing the duplicate
  // resource summaries or changing authored pages' search settings.
  if (
    url.pathname.startsWith("/api/") &&
    /\/methods\/[^/]+\/?$/.test(url.pathname)
  ) {
    route.entry.data.pagefind = true;
  }

  // Social preview card, rendered at build time by src/pages/og/[...slug].png.ts.
  const card = url.pathname.startsWith("/api") ? "api" : route.id || "index";
  const image = new URL(`/og/${card}.png`, site ?? url).href;

  const meta = (key: "property" | "name", id: string, content: string) => {
    route.head = route.head.filter((tag) => tag.attrs?.[key] !== id);
    route.head.push({ tag: "meta", attrs: { [key]: id, content } });
  };
  meta("property", "og:image", image);
  meta("property", "og:image:width", OG_WIDTH);
  meta("property", "og:image:height", OG_HEIGHT);
  meta("name", "twitter:image", image);
  meta("name", "twitter:card", "summary_large_image");
});
