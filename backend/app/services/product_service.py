"""
backend/app/services/product_service.py

ShopMind AI - Product Service

This module provides product-related services for ShopMind AI, including
a mock in-memory product catalog and a reusable filter_products() function
that filters products by brand, category, budget, and rating.

NOTE: This uses mock/static product data. No external database or API
integration is wired in yet.
"""

from typing import Optional, List, Dict, Any


# ---------------------------------------------------------------------------
# Mock product catalog
# ---------------------------------------------------------------------------

MOCK_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Sony WH-CH520 Wireless Headphones",
        "brand": "Sony",
        "category": "Headphones",
        "price": 4499,
        "rating": 4.3,
        "review_count": 12480,
        "description": "Lightweight on-ear wireless headphones with up to 50 hours of battery life and quick charging support.",
        "stock": True,
        "image": None,
    },
    {
        "id": 2,
        "name": "Sony WH-1000XM4 Wireless Headphones",
        "brand": "Sony",
        "category": "Headphones",
        "price": 24999,
        "rating": 4.7,
        "review_count": 34210,
        "description": "Industry-leading noise cancellation with premium sound quality and 30-hour battery life.",
        "stock": True,
        "image": None,
    },
    {
        "id": 3,
        "name": "Boat Rockerz 450 Headphones",
        "brand": "Boat",
        "category": "Headphones",
        "price": 1499,
        "rating": 4.1,
        "review_count": 58900,
        "description": "On-ear wireless headphones with 40mm drivers and up to 15 hours of battery backup.",
        "stock": True,
        "image": None,
    },
    {
        "id": 4,
        "name": "JBL Tune 760NC Headphones",
        "brand": "JBL",
        "category": "Headphones",
        "price": 4999,
        "rating": 4.4,
        "review_count": 9870,
        "description": "Active noise cancelling headphones with pure bass sound and hands-free calling.",
        "stock": True,
        "image": None,
    },
    {
        "id": 5,
        "name": "Samsung Galaxy Buds2",
        "brand": "Samsung",
        "category": "Headphones",
        "price": 8999,
        "rating": 4.2,
        "review_count": 15600,
        "description": "Compact true wireless earbuds with active noise cancellation and rich sound.",
        "stock": True,
        "image": None,
    },
    {
        "id": 6,
        "name": "Sennheiser HD 350BT",
        "brand": "Sennheiser",
        "category": "Headphones",
        "price": 6990,
        "rating": 4.0,
        "review_count": 3210,
        "description": "Over-ear wireless headphones with customizable sound via Sennheiser Smart Control app.",
        "stock": False,
        "image": None,
    },
    {
        "id": 7,
        "name": "OnePlus Nord CE 3",
        "brand": "OnePlus",
        "category": "Smartphone",
        "price": 19999,
        "rating": 4.3,
        "review_count": 21340,
        "description": "5G smartphone with 108MP camera, 67W fast charging, and AMOLED display.",
        "stock": True,
        "image": None,
    },
    {
        "id": 8,
        "name": "Samsung Galaxy M14",
        "brand": "Samsung",
        "category": "Smartphone",
        "price": 12999,
        "rating": 4.0,
        "review_count": 18760,
        "description": "Budget-friendly smartphone with 6000mAh battery and 50MP triple camera setup.",
        "stock": True,
        "image": None,
    },
    {
        "id": 9,
        "name": "Apple iPhone 13",
        "brand": "Apple",
        "category": "Smartphone",
        "price": 46999,
        "rating": 4.6,
        "review_count": 42150,
        "description": "A15 Bionic chip, dual-camera system, and Super Retina XDR display in a durable design.",
        "stock": True,
        "image": None,
    },
    {
        "id": 10,
        "name": "Noise ColorFit Pro 4 Smartwatch",
        "brand": "Noise",
        "category": "Smartwatch",
        "price": 2499,
        "rating": 3.9,
        "review_count": 7650,
        "description": "AMOLED smartwatch with Bluetooth calling and 100+ sports modes.",
        "stock": True,
        "image": None,
    },
    {
        "id": 11,
        "name": "Boat Wave Call Smartwatch",
        "brand": "Boat",
        "category": "Smartwatch",
        "price": 1699,
        "rating": 4.0,
        "review_count": 11230,
        "description": "Smartwatch with Bluetooth calling, 1.69-inch display, and multiple watch faces.",
        "stock": True,
        "image": None,
    },
    {
        "id": 12,
        "name": "Dell Inspiron 15 Laptop",
        "brand": "Dell",
        "category": "Laptop",
        "price": 42990,
        "rating": 4.2,
        "review_count": 5430,
        "description": "15.6-inch laptop with Intel Core i5 processor, 8GB RAM, and 512GB SSD.",
        "stock": True,
        "image": None,
    },
    {
        "id": 13,
        "name": "HP Pavilion 14 Laptop",
        "brand": "HP",
        "category": "Laptop",
        "price": 55990,
        "rating": 4.3,
        "review_count": 4120,
        "description": "Slim and lightweight laptop with Intel Core i5, 16GB RAM, and backlit keyboard.",
        "stock": True,
        "image": None,
    },
    {
        "id": 14,
        "name": "Lenovo IdeaPad Slim 3",
        "brand": "Lenovo",
        "category": "Laptop",
        "price": 38990,
        "rating": 4.1,
        "review_count": 6890,
        "description": "Everyday laptop with AMD Ryzen 5 processor, 8GB RAM, and 512GB SSD storage.",
        "stock": False,
        "image": None,
    },
    {
        "id": 15,
        "name": "JBL Flip 6 Speaker",
        "brand": "JBL",
        "category": "Speaker",
        "price": 9999,
        "rating": 4.5,
        "review_count": 13580,
        "description": "Portable waterproof Bluetooth speaker with powerful JBL Pro Sound.",
        "stock": True,
        "image": None,
    },
    {
        "id": 16,
        "name": "Zebronics Zeb-County Speaker",
        "brand": "Zebronics",
        "category": "Speaker",
        "price": 999,
        "rating": 3.7,
        "review_count": 8210,
        "description": "Compact wireless speaker with FM radio, USB, and TF card support.",
        "stock": True,
        "image": None,
    },
]


# ---------------------------------------------------------------------------
# Filtering service
# ---------------------------------------------------------------------------

def filter_products(
    brand: Optional[str] = None,
    category: Optional[str] = None,
    budget: Optional[int] = None,
    rating: Optional[float] = None,
    products: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Filter products by brand, category, budget, and minimum rating.

    Args:
        brand: Brand name to filter by (case-insensitive exact match).
               If None, brand filtering is skipped.
        category: Category name to filter by (case-insensitive exact match).
                  If None, category filtering is skipped.
        budget: Maximum price allowed (inclusive). Products priced above
                this value are excluded. If None, budget filtering is
                skipped.
        rating: Minimum rating required (inclusive). Products rated below
                this value are excluded. If None, rating filtering is
                skipped.
        products: Optional list of product dicts to filter. Defaults to
                  the built-in MOCK_PRODUCTS catalog if not provided.

    Returns:
        A list of product dictionaries matching all provided filters.
    """
    source_products = products if products is not None else MOCK_PRODUCTS
    results: List[Dict[str, Any]] = []

    for product in source_products:
        if brand and str(product.get("brand", "")).strip().lower() != brand.strip().lower():
            continue

        if category and str(product.get("category", "")).strip().lower() != category.strip().lower():
            continue

        if budget is not None:
            try:
                if product.get("price") is None or float(product["price"]) > float(budget):
                    continue
            except (TypeError, ValueError):
                continue

        if rating is not None:
            try:
                if product.get("rating") is None or float(product["rating"]) < float(rating):
                    continue
            except (TypeError, ValueError):
                continue

        results.append(product)

    return results


def get_all_products() -> List[Dict[str, Any]]:
    """
    Return the full mock product catalog (no filtering applied).

    Returns:
        A list of all product dictionaries in the mock catalog.
    """
    return MOCK_PRODUCTS


def get_product_by_id(product_id: int):
    for product in MOCK_PRODUCTS:
        if product["id"] == product_id:
            return product
    return None


def search_products(query: str):
    query = query.lower()

    return [
        product
        for product in MOCK_PRODUCTS
        if query in product["name"].lower()
        or query in product["brand"].lower()
        or query in product["category"].lower()
    ]