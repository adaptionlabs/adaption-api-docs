import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderOgImage, type OgCard } from "@/og/render";
import { sectionFor } from "@/og/sections";

// One social card per docs page, rendered at build time to /og/<id>.png.
// src/route-data.ts points each page's og:image at its card.
export const getStaticPaths = (async () => {
  const docs = await getCollection("docs");
  const pages = docs.map((entry) => ({
    params: { slug: entry.id || "index" },
    props: {
      section: sectionFor(entry.id),
      title: entry.data.title,
      description: entry.data.description,
    } satisfies OgCard,
  }));
  // Generated API reference pages are not in the docs collection; they share
  // one card.
  pages.push({
    params: { slug: "api" },
    props: {
      section: "API Reference",
      title: "Adaption API",
      description:
        "Endpoints, parameters, and SDK examples for the Adaption API.",
    },
  });
  return pages;
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = async ({ props }) =>
  new Response(new Uint8Array(await renderOgImage(props)), {
    headers: { "Content-Type": "image/png" },
  });
