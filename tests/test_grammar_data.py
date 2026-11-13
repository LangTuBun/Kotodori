"""Data-integrity checks for the grammar JSON the app ships with."""
import json
from pathlib import Path

import pytest

DATA = Path(__file__).resolve().parent.parent / "src" / "data"
LEVELS = ["n5", "n4"]


def load(level):
    return json.loads((DATA / level / "grammar.json").read_text(encoding="utf8"))


ALL_IDS = {p["id"] for level in LEVELS for p in load(level)}


@pytest.mark.parametrize("level", LEVELS)
def test_ids_are_unique(level):
    ids = [p["id"] for p in load(level)]
    assert len(ids) == len(set(ids))


@pytest.mark.parametrize("level", LEVELS)
def test_required_fields_present(level):
    for p in load(level):
        assert p["pattern"], p["id"]
        assert p["meaning"].get("en") and p["meaning"].get("vi"), p["id"]
        assert p["examples"], p["id"]
        # Later N4 records omit jlptLevel on purpose; the app falls back to chapter (N5 = 1-14, N4 = 16+).
        derived = p.get("jlptLevel") or ("N4" if p["chapter"] >= 16 else "N5")
        assert derived == level.upper(), p["id"]


@pytest.mark.parametrize("level", LEVELS)
def test_related_grammar_points_exist(level):
    # A dangling id would render a dead cross-link chip in the app.
    for p in load(level):
        for ref in p["relatedGrammar"]:
            assert ref in ALL_IDS, f"{p['id']} -> {ref}"
