from app.glossary import GlossaryProtector


SAMPLE_GLOSSARY = {
    "categories": {
        "mathematics": ["integral", "derivative", "calculus", "polynomial"],
        "physics": ["velocity", "acceleration", "force", "momentum"],
    },
    "context_terms": {
        "mathematics": ["equation", "theorem"],
        "physics": ["energy", "mass"],
    },
}


def make_protector():
    return GlossaryProtector(SAMPLE_GLOSSARY)


def test_glossary_loads_terms():
    gp = make_protector()
    info = gp.get_glossary_info()
    assert info["total_terms"] == 8
    assert len(info["categories"]) == 2


def test_detect_subject_math():
    gp = make_protector()
    text = "Find the derivative of the integral"
    assert gp.detect_subject(text) == "mathematics"


def test_detect_subject_physics():
    gp = make_protector()
    text = "Calculate the velocity and acceleration of the object"
    assert gp.detect_subject(text) == "physics"


def test_detect_subject_not_enough_hits():
    gp = make_protector()
    text = "The derivative is important"  # only 1 math term
    assert gp.detect_subject(text) is None


def test_detect_subject_no_matches():
    gp = make_protector()
    assert gp.detect_subject("hello world") is None


def test_protect_and_restore():
    gp = make_protector()
    text = "Find the integral of the polynomial"
    protected, placeholder_map, subject = gp.protect(text, None)

    assert "XGLOSS" in protected
    assert "integral" not in protected
    assert "polynomial" not in protected
    assert len(placeholder_map) == 2

    restored = gp.restore(protected, placeholder_map)
    assert restored == text


def test_protect_with_extra_terms():
    gp = make_protector()
    text = "Calculate the API response"
    protected, placeholder_map, subject = gp.protect(text, ["API"])

    assert "API" not in protected
    assert any(v == "API" for v in placeholder_map.values())


def test_restore_idempotent():
    gp = make_protector()
    text = "No glossary terms here"
    protected, placeholder_map, subject = gp.protect(text, None)

    assert protected == text
    assert placeholder_map == {}


def test_glossary_info_structure():
    gp = make_protector()
    info = gp.get_glossary_info()
    assert "mathematics" in info["categories"]
    assert "term_count" in info["categories"]["mathematics"]
    assert "terms" in info["categories"]["mathematics"]
    assert info["categories"]["mathematics"]["term_count"] == 4
