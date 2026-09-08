#!/usr/bin/env python3
"""Type-check every Python snippet in the docs against the published SDK.

Snippets are prose, not modules: they reference names defined in an earlier
fence, import things the reader already has, and stop mid-flow. Errors that only
say "this fragment is not a whole program" are therefore ignored. What is NOT
ignored is a snippet that contradicts the SDK -- an argument the method does not
take, an attribute the model does not have, a type the call will not accept.
Those are the errors that reach a reader as a traceback.

Usage:  uv run --no-project --with adaption --with mypy python3 scripts/check_snippets.py
Runs in CI on every pull request that touches the guide; see
.github/workflows/check-snippets.yml.
"""
from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import textwrap
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "src" / "content" / "docs"
FENCE = re.compile(r"```py(?:thon)?[^\n]*\n(.*?)```", re.S)

# Fragment noise: absent only because a snippet is an excerpt.
IGNORED_CODES = {
    "name-defined",
    "import-not-found",
    "import-untyped",
    "no-redef",
    "has-type",
    "top-level-await",
    "union-attr",  # NOTE: snippets elide None-checks for readability. Drop this
                   # entry once the examples guard their optional fields.
}

# Real contradictions of the SDK surface.
GATED_CODES = {
    "call-arg",
    "attr-defined",
    "arg-type",
    "call-overload",
    "operator",
    "syntax",
}


# Most fences build on a client created in an earlier fence. Extracted alone,
# `client` is undefined, mypy falls back to Any, and every call on it becomes
# unverifiable -- a fence could return the wrong type and this job would pass.
# Declaring the client up front is what makes return types checkable at all.
# Redefinition is harmless: a fence that constructs its own client emits
# `no-redef`, which is ignored above.
PREAMBLE = 'from adaption import Adaption\nclient = Adaption(api_key="")\n'
PREAMBLE_LINES = PREAMBLE.count("\n")

# A dict built on its own line infers as `dict[str, str]` and no longer matches
# the TypedDict a parameter declares, even though the call runs fine -- mypy
# only narrows dict literals passed inline. Docs legitimately name their
# mappings before using them, so this pattern is not a defect to report.
# `Omit` marks an SDK parameter type, which keeps ordinary argument mismatches
# (expected "str", expected "int") reportable. Both spellings must match: mypy
# 1.x prints `ColumnMapping | Omit`, mypy 2.x prints `Union[ColumnMapping, Omit]`.
TYPED_DICT_PARAM = re.compile(r'expected "[^"]*\bOmit\b[^"]*"')


def extract(tmp: Path) -> dict[Path, str]:
    origin: dict[Path, str] = {}
    for mdx in sorted(DOCS.rglob("*.mdx")):
        text = mdx.read_text(encoding="utf-8")
        for i, match in enumerate(FENCE.finditer(text)):
            line = text[: match.start()].count("\n") + 1
            name = f"{mdx.relative_to(DOCS).as_posix().replace('/', '__')[:-4]}__{i}.py"
            path = tmp / name
            # Fences nested inside MDX components (Steps, Accordion) are
            # indented in the source; dedent so the snippet parses standalone.
            path.write_text(
                PREAMBLE + textwrap.dedent(match.group(1)), encoding="utf-8"
            )
            origin[path] = f"{mdx.relative_to(DOCS.parent.parent.parent)}:{line}"
    return origin


def check(path: Path) -> list[str]:
    proc = subprocess.run(
        [
            sys.executable, "-m", "mypy",
            "--ignore-missing-imports", "--no-error-summary",
            "--hide-error-context", "--show-error-codes",
            "--follow-imports=silent", str(path),
        ],
        capture_output=True,
        text=True,
    )
    found = []
    for raw in proc.stdout.splitlines():
        code = raw.rsplit("[", 1)[-1].rstrip("]") if raw.endswith("]") else ""
        if code in IGNORED_CODES or code not in GATED_CODES:
            continue
        rest = raw.split(":", 1)[-1].strip()
        if code == "arg-type" and TYPED_DICT_PARAM.search(rest):
            continue
        # Report the line the author wrote, not the one the preamble shifted it
        # to. A non-positive number means the error is in the preamble itself,
        # which is our code, not the docs'.
        number, _, message = rest.partition(":")
        if number.isdigit():
            shifted = int(number) - PREAMBLE_LINES
            if shifted < 1:
                continue
            rest = f"{shifted}:{message}"
        found.append(rest)
    return found


def main() -> int:
    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        origin = extract(tmp)
        failures = 0
        for path in sorted(origin):
            for problem in check(path):
                print(f"{origin[path]}\n    {problem}")
                failures += 1
        print(f"\nchecked {len(origin)} snippets, {failures} problem(s)")
        return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
