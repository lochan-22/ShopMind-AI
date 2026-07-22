from typing import List, Optional, Dict, Any


MOCK_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Sony WH-CH520",
        "brand": "Sony",
        "category": "Headphones",
        "price": 4490.00,
        "rating": 4.1,
        "review_count": 2310,
        "description": "Budget-friendly wireless headphones with up to 50 hours of battery life.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 2,
        "name": "Sony WH-1000XM5",
        "brand": "Sony",
        "category": "Headphones",
        "price": 29990.00,
        "rating": 4.7,
        "review_count": 3245,
        "description": "Industry-leading noise cancellation with premium sound quality and 30-hour battery life.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 3,
        "name": "Apple AirPods Pro",
        "brand": "Apple",
        "category": "Earbuds",
        "price": 24900.00,
        "rating": 4.6,
        "review_count": 4102,
        "description": "Active noise cancellation earbuds with adaptive transparency and spatial audio.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 4,
        "name": "Samsung Galaxy Buds2 Pro",
        "brand": "Samsung",
        "category": "Earbuds",
        "price": 17999.00,
        "rating": 4.4,
        "review_count": 1876,
        "description": "Compact earbuds with intelligent active noise cancellation and 360 audio.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 5,
        "name": "JBL Tune 770NC",
        "brand": "JBL",
        "category": "Headphones",
        "price": 6999.00,
        "rating": 4.3,
        "review_count": 987,
        "description": "Adaptive noise cancelling headphones with up to 70 hours of battery life.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 6,
        "name": "Logitech M331 Silent Plus Mouse",
        "brand": "Logitech",
        "category": "Accessories",
        "price": 1295.00,
        "rating": 4.5,
        "review_count": 6234,
        "description": "Wireless silent mouse with 2.4GHz connectivity and 24-month battery life.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 7,
        "name": "Dell 27-inch FHD Monitor",
        "brand": "Dell",
        "category": "Monitors",
        "price": 15999.00,
        "rating": 4.4,
        "review_count": 1543,
        "description": "27-inch Full HD IPS monitor with slim bezels and eye-comfort technology.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 8,
        "name": "ASUS ROG Strix G16 Gaming Laptop",
        "brand": "ASUS",
        "category": "Laptops",
        "price": 134990.00,
        "rating": 4.5,
        "review_count": 674,
        "description": "Intel Core i9 13th Gen, RTX 4070, 16GB RAM, 1TB SSD gaming laptop.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 9,
        "name": "iPhone 15 Pro",
        "brand": "Apple",
        "category": "Smartphone",
        "price": 134900.00,
        "rating": 4.8,
        "review_count": 5231,
        "description": "Titanium design with A17 Pro chip, 48MP main camera, and USB-C.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 10,
        "name": "Samsung Galaxy S24 Ultra",
        "brand": "Samsung",
        "category": "Smartphone",
        "price": 129999.00,
        "rating": 4.7,
        "review_count": 4102,
        "description": "200MP camera, built-in S Pen, Snapdragon 8 Gen 3, and Galaxy AI features.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 11,
        "name": "Apple Watch Series 9",
        "brand": "Apple",
        "category": "Smartwatch",
        "price": 41900.00,
        "rating": 4.6,
        "review_count": 1893,
        "description": "Advanced health sensors, Double Tap gesture, and brighter Retina display.",
        "stock": True,
        "image": "https://placehold.co/400x400",
    },
    {
        "id": 12,
        "name": "Noise ColorFit Pro 5",
        "brand": "Noise",
        "category": "Smartwatch",
        "price": 3999.00,
        "rating": 4.1,
        "review_count": 6789,
        "description": "1.85-inch AMOLED display, Bluetooth calling, and built-in GPS.",
        "stock": False,
        "image": "https://placehold.co/400x400",
    },
]


def get_all_products() -> List[Dict[str, Any]]:
    """Return all mock products."""
    return MOCK_PRODUCTS


def get_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    """Return a single product matching the given id, or None if not found."""
    for product in MOCK_PRODUCTS:
        if product["id"] == product_id:
            return product
    return None


def search_products(query: str) -> List[Dict[str, Any]]:
    """Return products whose name contains the given query (case-insensitive)."""
    if not query:
        return []

    query_lower = query.lower()
    return [product for product in MOCK_PRODUCTS if query_lower in product["name"].lower()]


def recommended_products(limit: int = 4) -> List[Dict[str, Any]]:
    """Return the top recommended products, ranked by rating and review count."""
    sorted_products = sorted(
        MOCK_PRODUCTS,
        key=lambda product: (product["rating"], product["review_count"]),
        reverse=True,
    )
    return sorted_products[:limit]