import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import satori from "satori";
import sharp from "sharp";

// Read from the project root: this module is bundled before it runs, so paths
// relative to import.meta.url do not survive the build.
const root = (path: string) => readFileSync(resolve(process.cwd(), path));

// Satori cannot read woff2, so these are TTF copies of the site font
// (public/fonts/STKBureauSans-*.woff2), decompressed with fontTools.
const font = (name: string) => root(`src/og/fonts/STKBureauSans-${name}.ttf`);
const FONTS = [
  { name: "Bureau", data: font("Regular"), weight: 400 as const },
  { name: "Bureau", data: font("SemiBold"), weight: 600 as const },
];

const LOGO = `data:image/svg+xml;base64,${root(
  "src/assets/logo-dark.svg",
).toString("base64")}`;

// Colors come from the Adaption Figma file. The background is the
// "Gradient (Black-Pink)" paint style: gray at the top fading to pink at the
// bottom. The white logo sits in the dark top band; all text is dark so it
// stays readable over the light lower half.
const BG =
  "linear-gradient(to top, #DAA7D2 14.9%, #A9BAD1 40%, #4986B4 82.7%, #545454 100%)";
const HEADLINE = "#1f1828"; // Data Viz/Indigo/50
const BODY = "#453f6b"; // Data Viz/Indigo/40: description and URL
const EYEBROW = "#054761"; // AD/Blue/60

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
  const titleSize = title.length > 40 ? 64 : 80;

  // Satori sizes `width: 100%` as content-box, so padding on the root would
  // push it past the canvas. The padded card flex-fills a bare wrapper instead.
  const card = h(
    "div",
    {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "64px 80px 56px",
    },
    [
      h("img", { width: 260, height: 48 }, undefined, { src: LOGO }),
      h("div", { display: "flex", flexDirection: "column", gap: 20 }, [
        h(
          "div",
          {
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: EYEBROW,
          },
          section,
        ),
        h(
          "div",
          {
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: -1,
          },
          clamp(title, 80),
        ),
        description
          ? h(
              "div",
              { fontSize: 32, lineHeight: 1.35, color: BODY, maxWidth: 1000 },
              clamp(description, 150),
            )
          : null,
      ]),
      h("div", { fontSize: 24, color: BODY }, "docs.adaptionlabs.ai"),
    ],
  );
  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      backgroundImage: BG,
      color: HEADLINE,
      fontFamily: "Bureau",
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
