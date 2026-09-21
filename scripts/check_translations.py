#!/usr/bin/env python3
"""Check that every translated page still matches its English source.

Translations drift in ways a build will not catch: a page is added in English
and never translated, a code fence is "helpfully" translated and stops matching
the SDK, an internal link keeps the English path and drops the reader out of
their language. This script fails on each of those.

What it enforces, per locale in `src/content/docs/<locale>/`:

1. **Coverage** -- the locale has exactly the same set of pages as English.
   A missing page silently falls back to English at runtime, which looks like a
   half-translated site; an extra page is a file no English source explains.
2. **Code fences are byte-identical to English.** This is what lets
   `check_snippets.py` type-check the English pages only: the translated fences
   are, by this assertion, the same bytes.
3. **Internal links carry the locale prefix**, except `/api/...`, which is
   generated in English only and has no per-locale route.
4. **Frontmatter has a translated `title` and `description`** -- a page that
   kept the English ones was probably copied and never finished.

Usage:  python3 scripts/check_translations.py
Runs in CI on every pull request that touches the docs; see
.github/workflows/check-translations.yml.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "src" / "content" / "docs"

# Keep in sync with `LOCALES` in src/i18n/locales.ts.
LOCALES = ["zh", "ja", "pt", "es", "ar"]

FENCE = re.compile(r"^([ \t]*)```(.*?)^\1?```", re.S | re.M)
FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.S)
# Markdown links to a site-absolute path: `](/foo)`. Ignores `](http...)` and,
# via the negative lookbehind, image embeds `![alt](/foo.png)` -- those resolve
# against `public/`, which is served at the root in every locale.
INTERNAL_LINK = re.compile(r"(?<!!)\]\((/[^)\s]*)\)")

# Static assets under `public/` keep their root path in every locale.
ASSET_SUFFIXES = (".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".pdf", ".ico")

# `/api` is the Stainless-generated reference. It is built once, in English,
# from spec/openapi.json -- there is no `/zh/api`, so those links stay bare.
UNPREFIXED_OK = ("/api/", "/api")


def english_pages() -> dict[str, Path]:
    pages = {}
    for mdx in sorted(DOCS.rglob("*.mdx")):
        rel = mdx.relative_to(DOCS)
        if rel.parts[0] in LOCALES:
            continue
        pages[rel.as_posix()] = mdx
    return pages


def fences(text: str) -> list[str]:
    """Fence bodies, with the MDX indentation stripped so an indented copy of
    an indented fence still compares equal."""
    out = []
    for match in FENCE.finditer(text):
        indent = match.group(1)
        body = match.group(0)
        if indent:
            body = "\n".join(
                line[len(indent):] if line.startswith(indent) else line
                for line in body.splitlines()
            )
        out.append(body.strip())
    return out


def frontmatter(text: str) -> str | None:
    match = FRONTMATTER.match(text)
    return match.group(1) if match else None


def field(block: str, name: str) -> str | None:
    match = re.search(rf"^{name}:\s*(.+)$", block, re.M)
    return match.group(1).strip() if match else None


# Punctuation github-slugger drops. Astro derives a heading's id with that
# package, so an anchor into a translated heading has to survive the same
# transformation. CJK and Arabic letters are kept, which is why a Chinese
# heading is reached by a Chinese anchor.
SLUG_STRIP = re.compile(
    r"[ -⁯⸀-⹿\'!\"#$%&()*+,./:;<=>?@\[\]^`{|}~¡¿،؛؟‘’“”—–]"
)
HEADING = re.compile(r"^#{1,6}\s+(.+?)\s*$", re.M)
# `[text](/zh/page#anchor)` or `[text](#anchor)`
ANCHOR_LINK = re.compile(r"(?<!!)\]\((/[^)\s#]*)?#([^)\s]+)\)")


def slugify(text: str) -> str:
    """Approximate github-slugger, which is what Astro uses for heading ids."""
    # Strip inline markdown that never reaches the rendered heading text.
    text = re.sub(r"`([^`]*)`", r"", text)
    text = re.sub(r"\*\*([^*]*)\*\*", r"", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"", text)
    text = text.strip().lower()
    text = SLUG_STRIP.sub("", text)
    return text.replace(" ", "-")


def heading_slugs(text: str) -> set[str]:
    # Headings inside code fences are not headings.
    without_code = FENCE.sub("", text)
    return {slugify(h) for h in HEADING.findall(without_code)}


def check() -> list[str]:
    problems: list[str] = []
    english = english_pages()

    for locale in LOCALES:
        root = DOCS / locale
        if not root.is_dir():
            problems.append(f"{locale}: no src/content/docs/{locale}/ directory")
            continue

        translated = {
            p.relative_to(root).as_posix(): p for p in sorted(root.rglob("*.mdx"))
        }

        for missing in sorted(set(english) - set(translated)):
            problems.append(f"{locale}: missing translation of {missing}")
        for extra in sorted(set(translated) - set(english)):
            problems.append(f"{locale}/{extra}: no English source at that path")

        shared = sorted(set(english) & set(translated))
        # Every heading this locale actually defines, keyed by page, so a link
        # into another translated page can be checked against the real target.
        slugs = {
            rel: heading_slugs(translated[rel].read_text(encoding="utf-8"))
            for rel in shared
        }

        for rel in shared:
            src = english[rel].read_text(encoding="utf-8")
            dst = translated[rel].read_text(encoding="utf-8")
            where = f"{locale}/{rel}"

            src_fences, dst_fences = fences(src), fences(dst)
            if len(src_fences) != len(dst_fences):
                problems.append(
                    f"{where}: has {len(dst_fences)} code fences, "
                    f"English has {len(src_fences)}"
                )
            else:
                for i, (a, b) in enumerate(zip(src_fences, dst_fences)):
                    if a != b:
                        problems.append(
                            f"{where}: code fence #{i + 1} differs from English; "
                            "translated snippets must be copied verbatim"
                        )

            for link in INTERNAL_LINK.findall(dst):
                if link.startswith(UNPREFIXED_OK):
                    continue
                if link.lower().endswith(ASSET_SUFFIXES):
                    continue
                if not link.startswith(f"/{locale}/"):
                    problems.append(f"{where}: link {link} is missing the /{locale} prefix")

            for page, anchor in ANCHOR_LINK.findall(dst):
                if page and page.startswith(UNPREFIXED_OK):
                    continue
                # No page part means the anchor is on this page.
                target = rel if not page else page[len(f"/{locale}/"):] + ".mdx"
                if target not in slugs:
                    # Coverage/prefix problems are reported above; don't
                    # double-report the same file as a broken anchor.
                    continue
                if anchor not in slugs[target]:
                    problems.append(
                        f"{where}: anchor #{anchor} has no matching heading "
                        f"in {locale}/{target}"
                    )

            src_fm, dst_fm = frontmatter(src), frontmatter(dst)
            if dst_fm is None:
                problems.append(f"{where}: no frontmatter block")
                continue
            values = {name: field(dst_fm, name) for name in ("title", "description")}
            for name, value in values.items():
                if value is None:
                    problems.append(f"{where}: frontmatter is missing `{name}`")
            # A single field can legitimately survive translation -- "FAQ" is
            # "FAQ" in most of these languages. Both matching means the file
            # was copied and never translated.
            if src_fm and all(
                value is not None and value == field(src_fm, name)
                for name, value in values.items()
            ):
                problems.append(
                    f"{where}: frontmatter `title` and `description` are both "
                    "still the English text"
                )

    return problems


def main() -> int:
    problems = check()
    if not problems:
        pages = len(english_pages())
        print(f"OK: {len(LOCALES)} locales x {pages} pages, all consistent with English.")
        return 0
    for problem in problems:
        print(problem)
    print(f"\n{len(problems)} problem(s).", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
