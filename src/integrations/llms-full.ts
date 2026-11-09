import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

// Builds /llms-full.txt: the text of every docs page in one file, so an agent
// can read all the docs in one request (https://llmstxt.org).
//
// @stainless-api/docs already writes /llms.txt (a list of links) and an
// index.md copy of every page. This reads both after the build: llms.txt sets
// the pages and their order, and each page's index.md supplies its text. The
// file therefore lists exactly what llms.txt lists, with nothing copied by hand.
//
// It must come after stainlessDocs() in `integrations`, so the index.md files
// exist when it runs. It runs on `astro build` only; `astro dev` does not
// serve the file.

const LLMS_TXT = "llms.txt";
const LLMS_FULL_TXT = "llms-full.txt";
const API_PREFIX = "/api/";

// The `[title](/path/index.md)` links in llms.txt, in order, without repeats.
function pageLinks(llmsTxt: string): string[] {
  const links = [...llmsTxt.matchAll(/\]\((\/[^)\s]*index\.md)\)/g)].map(
    (match) => match[1],
  );
  return [...new Set(links)];
}

// An API resource page already holds its methods and subresources, so a page
// inside another listed page's folder would repeat it. Prose pages never nest
// this way, and "/index.md" would contain every page, so only API pages are
// checked.
function dropNestedApiPages(links: string[]): string[] {
  const apiDirs = links
    .filter((link) => link.startsWith(API_PREFIX))
    .map((link) => link.replace(/index\.md$/, ""));
  return links.filter((link) => {
    if (!link.startsWith(API_PREFIX)) return true;
    const dir = link.replace(/index\.md$/, "");
    return !apiDirs.some((other) => other !== dir && dir.startsWith(other));
  });
}

// Prose pages start with front matter (title, description) and no heading.
// Turn that into a heading and summary line so each page reads on its own.
function pageBody(markdown: string): string {
  const frontMatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontMatter) return markdown.trim();

  const field = (name: string) =>
    frontMatter[1].match(new RegExp(`^${name}: (.*)$`, "m"))?.[1]?.trim();
  const title = field("title")?.replace(/ \| [^|]+$/, "");
  const description = field("description");
  const body = markdown.slice(frontMatter[0].length).trim();

  const head: string[] = [];
  if (title && !body.startsWith("# ")) head.push(`# ${title}`);
  if (description) head.push(`> ${description}`);
  return [...head, body].join("\n\n");
}

export default function llmsFullTxt(): AstroIntegration {
  let site: string | undefined;

  return {
    name: "llms-full-txt",
    hooks: {
      "astro:config:done": ({ config }) => {
        site = config.site?.replace(/\/$/, "");
      },
      "astro:build:done": async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const llmsTxtPath = path.join(dist, LLMS_TXT);
        const llmsTxt = await readFile(llmsTxtPath, "utf8");

        const siteTitle = llmsTxt.match(/^# (.+)$/m)?.[1] ?? "Documentation";
        const sections: string[] = [];
        const skipped: string[] = [];

        for (const link of dropNestedApiPages(pageLinks(llmsTxt))) {
          let markdown: string;
          try {
            markdown = await readFile(path.join(dist, link), "utf8");
          } catch {
            // llms.txt also lists draft pages, which are not built.
            skipped.push(link);
            continue;
          }
          const url = `${site ?? ""}${link.replace(/index\.md$/, "")}`;
          sections.push(`Source: ${url}\n\n${pageBody(markdown)}`);
        }

        if (sections.length === 0) {
          throw new Error(`${LLMS_FULL_TXT}: no pages found in ${LLMS_TXT}`);
        }

        const intro = [
          `# ${siteTitle}`,
          `> The full text of the ${siteTitle} documentation in one file. ` +
            `The list of pages, with a link to each, is at /${LLMS_TXT}.`,
        ].join("\n\n");
        const content = [intro, ...sections].join("\n\n---\n\n") + "\n";
        await writeFile(path.join(dist, LLMS_FULL_TXT), content, "utf8");

        // Point llms.txt readers at the full file, right under the title.
        const pointer = `The full text of every page below is in one file: [${LLMS_FULL_TXT}](/${LLMS_FULL_TXT})`;
        if (!llmsTxt.includes(`(/${LLMS_FULL_TXT})`)) {
          await writeFile(
            llmsTxtPath,
            llmsTxt.replace(/^(# .+\n)/, `$1\n${pointer}\n`),
            "utf8",
          );
        }

        for (const link of skipped) {
          logger.warn(`${LLMS_FULL_TXT}: skipped ${link} (not built)`);
        }
        logger.info(
          `Wrote /${LLMS_FULL_TXT}: ${sections.length} pages, ` +
            `${Buffer.byteLength(content)} bytes`,
        );
      },
    },
  };
}
