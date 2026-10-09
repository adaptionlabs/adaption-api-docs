import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware(({ url, locals }) => {
  // Stainless excludes generated pages from Pagefind. Index method pages so
  // searches can link directly to an endpoint, without indexing the duplicate
  // resource summaries or changing authored pages' search settings.
  if (
    url.pathname.startsWith("/api/") &&
    /\/methods\/[^/]+\/?$/.test(url.pathname)
  ) {
    locals.starlightRoute.entry.data.pagefind = true;
  }
});
