"""Regression tests for the docs checker; no API requests are made."""
from __future__ import annotations

import contextlib
import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import check_snippets as checker


class DiagnosticTests(unittest.TestCase):
    def run_check(self, stdout="", stderr="", returncode=1):
        result = subprocess.CompletedProcess([], returncode, stdout, stderr)
        with patch.object(checker.subprocess, "run", return_value=result):
            return checker.check(Path("example.py"))

    def test_missing_mypy_is_not_a_clean_check(self):
        with self.assertRaisesRegex(checker.CheckerError, "No module named mypy"):
            self.run_check(stderr="No module named mypy")

    def test_mypy_fatal_exit_is_not_a_clean_check(self):
        with self.assertRaisesRegex(checker.CheckerError, "exit 2"):
            self.run_check(stderr="mypy: internal error", returncode=2)

    def test_unrecognized_failure_is_not_silenced(self):
        with self.assertRaisesRegex(checker.CheckerError, "Unexpected mypy output"):
            self.run_check(stdout="mypy: error: duplicate module\n")

    def test_windows_drive_does_not_break_line_number(self):
        problems = self.run_check(
            stdout=r'C:\docs\example.py:3: error: Invalid argument [arg-type]' + "\n"
        )
        self.assertEqual(problems, ["1: error: Invalid argument [arg-type]"])

    def test_expected_fragment_error_remains_ignored(self):
        self.assertEqual(self.run_check(
            stdout='example.py:3: error: Name "dataset_id" is not defined [name-defined]\n'
        ), [])

    def test_preamble_error_does_not_vanish(self):
        with self.assertRaisesRegex(checker.CheckerError, "preamble"):
            self.run_check(stdout='example.py:1: error: Missing Adaption [attr-defined]\n')

    def test_legacy_union_named_mapping_remains_allowed(self):
        self.assertEqual(self.run_check(stdout=(
            'example.py:4: error: Argument has incompatible type "dict[str, str]"; '
            'expected "Union[ColumnMapping, Omit]"  [arg-type]\n'
        )), [])

    def test_dictionary_is_not_allowed_for_an_optional_number(self):
        self.assertEqual(len(self.run_check(stdout=(
            'example.py:3: error: Argument has incompatible type "dict[str, str]"; '
            'expected "float | Omit"  [arg-type]\n'
        ))), 1)

    def test_dependency_error_stops_before_success_summary(self):
        stdout, stderr = io.StringIO(), io.StringIO()
        with patch.object(checker.importlib, "import_module", side_effect=ImportError("missing dependency")):
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                self.assertEqual(checker.main(), 2)
        self.assertNotIn("checked", stdout.getvalue())
        self.assertIn("uv run", stderr.getvalue())


class SDKExamplesTests(unittest.TestCase):
    def check_source(self, source):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "example.py"
            path.write_text(checker.PREAMBLE + source, encoding="utf-8")
            return checker.check(path)

    def test_invalid_optional_column_mapping_is_reported(self):
        errors = self.check_source('client.datasets.adapt("example", column_mapping=7)\n')
        self.assertEqual(len(errors), 1)
        self.assertIn('"column_mapping"', errors[0])

    def test_invalid_optional_number_is_reported(self):
        errors = self.check_source('client.autoscientist.create(dataset_id="example", max_iterations="many")\n')
        self.assertEqual(len(errors), 1)
        self.assertIn('"max_iterations"', errors[0])

    def test_invalid_required_number_is_reported(self):
        errors = self.check_source('client.datasets.translate("example", languages=["es"], sample_rate="banana")\n')
        self.assertEqual(len(errors), 1)
        self.assertTrue(errors[0].startswith("1:"))

    def test_named_mapping_is_still_accepted(self):
        errors = self.check_source('mapping = {"prompt": "instruction"}\nclient.datasets.adapt("example", column_mapping=mapping)\n')
        self.assertEqual(errors, [])

    def test_valid_sdk_example_is_accepted(self):
        errors = self.check_source('client.datasets.translate("example", languages=["es"], sample_rate=0.5, estimate=True)\n')
        self.assertEqual(errors, [])

    def test_missing_dependencies_cli_exits_without_false_pass(self):
        result = subprocess.run(
            [sys.executable, "-S", str(Path(checker.__file__))],
            capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("0 problem(s)", result.stdout)
        self.assertIn("Cannot check snippets", result.stderr)


if __name__ == "__main__":
    unittest.main()
