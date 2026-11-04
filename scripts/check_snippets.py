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

import importlib
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

# Named dictionaries infer as dict[...] rather than an SDK TypedDict. Keep
# that fragment tolerance, but do not suppress every optional parameter merely
# because its expected type contains Omit (for example, max_iterations="many").
# Support mypy's union spellings in both 1.x and 2.x.
TYPED_DICT_PARAM = re.compile(
    r'has incompatible type "(?:dict|Dict)\[[^"]+\]"; '
    r'expected "(?:Union\[)?[A-Z]\w*(?: \| None)?'
    r'(?: \| Omit|, (?:None, )?Omit\])"'
)
DIAGNOSTIC = re.compile(r"^.+?:(\d+): ((?:error|note): .*)$")


class CheckerError(RuntimeError):
    """The checker could not validate the snippets."""


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
    if proc.returncode not in (0, 1) or (proc.returncode == 1 and not proc.stdout.strip()):
        detail = proc.stderr.strip() or proc.stdout.strip() or "no diagnostic output"
        raise CheckerError(f"mypy could not complete (exit {proc.returncode}): {detail}")

    found = []
    for raw in proc.stdout.splitlines():
        if not raw.strip():
            continue
        diagnostic = DIAGNOSTIC.match(raw)
        if diagnostic is None:
            raise CheckerError(f"Unexpected mypy output: {raw}")
        number, message = diagnostic.groups()
        code = message.rsplit("[", 1)[-1].rstrip("]") if message.endswith("]") else ""
        if code in IGNORED_CODES or code not in GATED_CODES:
            continue
        if code == "arg-type" and TYPED_DICT_PARAM.search(message):
            continue
        # Parse the line separately from the path, which may include a Windows
        # drive colon. The preamble is checker code, not a documentation fence.
        shifted = int(number) - PREAMBLE_LINES
        if shifted < 1:
            raise CheckerError(f"mypy rejected the checker preamble: {message}")
        found.append(f"{shifted}: {message}")

    return found


def main() -> int:
    for dependency in ("adaption", "mypy"):
        try:
            importlib.import_module(dependency)
        except ImportError as exc:
            print(
                f"Cannot check snippets: {dependency} is unavailable ({exc}).\n"
                "Run: uv run --no-project --with adaption --with mypy "
                "python3 scripts/check_snippets.py",
                file=sys.stderr,
            )
            return 2

    with tempfile.TemporaryDirectory() as raw_tmp:
        tmp = Path(raw_tmp)
        origin = extract(tmp)
        failures = 0
        for path in sorted(origin):
            try:
                problems = check(path)
            except CheckerError as exc:
                print(f"Cannot check {origin[path]}: {exc}", file=sys.stderr)
                return 2
            for problem in problems:
                print(f"{origin[path]}\n    {problem}")
                failures += 1
        print(f"\nchecked {len(origin)} snippets, {failures} problem(s)")
        return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
