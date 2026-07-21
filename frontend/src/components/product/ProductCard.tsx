import { forwardRef, type HTMLAttributes } from "react";

import { ProductBadge } from "@/components/product/ProductBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductRating } from "@/components/product/ProductRating";
import type { Product } from "@/components/product/types";
import { cn } from "@/utils/cn";

export interface ProductCardProps extends HTMLAttributes<HTMLElement> {
  product: Product;
  interactive?: boolean;
  showDescription?: boolean;
}

export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(
  (
    {
      product,
      interactive = true,
      showDescription = false,
      className,
      ...props
    },
    ref,
  ) => {
    const badgeType =
      product.inStock === false ? "out-of-stock" : product.badge;

    return (
      <article
        ref={ref}
        aria-label={product.name}
        className={cn(
          "product-card",
          interactive && "product-card-interactive",
          className,
        )}
        {...props}
      >
        <div className="product-card-media">
          <ProductImage
            alt={product.name}
            placeholderColor={product.imageColor}
            placeholderLabel={product.imageLabel}
            aspect="square"
            size="md"
          />
          {badgeType && (
            <ProductBadge
              type={badgeType}
              label={product.badgeLabel}
              className="product-card-badge"
            />
          )}
        </div>

        <div className="product-card-body">
          <p className="product-card-category">{product.category}</p>
          <h3 className="product-card-title">{product.name}</h3>

          {showDescription && product.description && (
            <p className="product-card-description">{product.description}</p>
          )}

          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />

          <ProductPrice
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={product.currency}
            size="md"
          />
        </div>
      </article>
    );
  },
);

ProductCard.displayName = "ProductCard";
