import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


PROD_ORIGIN = "https://shop-mind-ai-two.vercel.app"
PREVIEW_ORIGIN = "https://shop-mind-ai-preview-abc.vercel.app"


@pytest.mark.parametrize(
    "method,path",
    [
        ("GET", "/api/products/search?q=phone"),
        ("GET", "/products/search?q=phone"),
        ("GET", "/api/products"),
        ("GET", "/products"),
        ("GET", "/api/products/1"),
        ("GET", "/products/1"),
        ("GET", "/api/products/compare?product_a=1&product_b=2"),
        ("GET", "/products/compare?product_a=1&product_b=2"),
        ("GET", "/api/health"),
        ("GET", "/health"),
        ("OPTIONS", "/api/products/search"),
        ("OPTIONS", "/products/search"),
        ("OPTIONS", "/api/products/decision"),
        ("OPTIONS", "/products/decision"),
        ("OPTIONS", "/api/agent/chat"),
        ("OPTIONS", "/agent/chat"),
    ],
)
def test_production_cors_and_route_accessibility(client, method, path):
    if method == "GET":
        response = client.get(path, headers={"Origin": PROD_ORIGIN})
    else:
        response = client.options(
            path,
            headers={
                "Origin": PROD_ORIGIN,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            },
        )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == PROD_ORIGIN
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_vercel_preview_domain_regex_cors(client):
    response = client.options(
        "/api/products/search",
        headers={
            "Origin": PREVIEW_ORIGIN,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == PREVIEW_ORIGIN
    assert response.headers.get("access-control-allow-credentials") == "true"
