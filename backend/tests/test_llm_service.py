"""Intent parsing regressions for agent routing."""

from app.services.llm_service import parse_user_query


def test_tell_product_request_is_not_misclassified_as_a_greeting() -> None:
    parsed = parse_user_query("tell best high quality headphones for gaming under 2k")

    assert parsed == {
        "intent": "search",
        "brand": None,
        "category": "Headphones",
        "budget": 2_000,
    }


def test_actual_greeting_remains_a_greeting() -> None:
    assert parse_user_query("hello")['intent'] == "greeting"
