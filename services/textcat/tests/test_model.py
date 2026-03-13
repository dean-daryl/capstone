from app.model import normalize_label


def test_normalize_label_single():
    assert normalize_label("|calculus|") == "calculus"


def test_normalize_label_nested():
    assert normalize_label("|calculus|integration|") == "calculus > integration"


def test_normalize_label_with_hyphens():
    assert normalize_label("|data-structures|linked-list|") == "data structures > linked list"


def test_normalize_label_empty_pipes():
    assert normalize_label("||") == ""
