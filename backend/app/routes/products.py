from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.product_service import (
    get_all_products,
    get_product_by_id,
    search_products,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
def list_products():
    return get_all_products()


@router.get("/search")
def search_products_route(q: Optional[str] = Query(None, min_length=1)):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")

    return search_products(q)


@router.get("/{product_id}")
def get_product(product_id: int):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product