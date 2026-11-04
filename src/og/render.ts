import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import satori from "satori";
import sharp from "sharp";

// Implements the "Adaption_Developer-Docs_Social-Banner" frame in the
// 2026 Brand Design Figma file (trXJD2NX3TkyV7vUbhqwRp, node 6924:4800).

// Read from the project root: this module is bundled before it runs, so paths
// relative to import.meta.url do not survive the build.
const root = (path: string) => readFileSync(resolve(process.cwd(), path));

// Satori cannot read woff2, so these are TTF copies of the site font
// (public/fonts/STKBureauSans-*.woff2), decompressed with fontTools. Each cut
// is its own family because Book and Regular would otherwise share weight 400.
const font = (cut: string) => ({
  name: `Bureau ${cut}`,
  data: root(`src/og/fonts/STKBureauSans-${cut}.ttf`),
  weight: 400 as const,
});
const FONTS = [font("Light"), font("Book"), font("Regular")];

// White logo exported from the Figma frame.
const LOGO = `data:image/svg+xml;base64,${root("src/og/logo.svg").toString("base64")}`;

// A 20% black overlay on a navy-to-pink vertical gradient.
const BACKGROUND = [
  "linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%)",
  "linear-gradient(180deg, #192B37 0%, #5385A8 41.866%, #94B0C4 64.425%, #DAA2CF 90.506%, #D9D9D9 99.846%)",
].join(", ");

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export interface OgCard {
  section: string;
  title: string;
  description?: string;
}

type Node = { type: string; props: Record<string, unknown> };
const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {},
): Node => ({ type, props: { style, children, ...extra } });

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).replace(/[,.;:]$/, "") + "…";
}

export async function renderOgImage({
  section,
  title,
  description,
}: OgCard): Promise<Buffer> {
  // The design sets titles at 84px on one line. Longer titles step down so a
  // two-line title still leaves room for a three-line description.
  const titleSize = title.length > 22 ? 68 : 84;

  // Satori sizes `width: 100%` as content-box, so padding on the root would
  // push it past the canvas. The padded card flex-fills a bare wrapper instead.
  const card = h(
    "div",
    {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "72px 288px 72px 72px",
    },
    [
      h("img", { width: 220.426, height: 40.286 }, undefined, { src: LOGO }),
      h(
        "div",
        { display: "flex", flexDirection: "column", gap: 24, width: "100%" },
        [
          h(
            "div",
            {
              fontFamily: "Bureau Regular",
              fontSize: 24,
              lineHeight: 1.2,
              textTransform: "uppercase",
            },
            section,
          ),
          h(
            "div",
            {
              fontFamily: "Bureau Light",
              fontSize: titleSize,
              lineHeight: 1.2,
              letterSpacing: titleSize * -0.02,
            },
            clamp(title, 60),
          ),
          description
            ? h(
                "div",
                {
                  fontFamily: "Bureau Book",
                  fontSize: 36,
                  lineHeight: 1.2,
                  letterSpacing: -0.72,
                },
                clamp(description, 130),
              )
            : null,
        ],
      ),
      h(
        "div",
        { fontFamily: "Bureau Regular", fontSize: 24, lineHeight: 1.2 },
        "docs.adaptionlabs.ai",
      ),
    ],
  );
  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      backgroundImage: BACKGROUND,
      color: "#ffffff",
    },
    card,
  );

  // Satori's types expect a ReactNode; a plain element-shaped object is what
  // it actually consumes, so no React runtime is involved.
  const svg = await satori(tree as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: FONTS,
  });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
