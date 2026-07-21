import { forwardRef, type HTMLAttributes } from "react";

import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "product-price-sm",
  md: "product-price-md",
  lg: "product-price-lg",
};

export interface ProductPriceProps extends HTMLAttributes<HTMLDivElement> {
  price: number;
  compareAtPrice?: number;
  currency?: string;
  locale?: string;
  size?: Exclude<ComponentSize, "xs" | "xl">;
  showDiscount?: boolean;
}

function formatPrice(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export const ProductPrice = forwardRef<HTMLDivElement, ProductPriceProps>(
  (
    {
      price,
      compareAtPrice,
      currency = "USD",
      locale = "en-US",
      size = "md",
      showDiscount = true,
      className,
      ...props
    },
    ref,
  ) => {
    const hasDiscount =
      compareAtPrice !== undefined && compareAtPrice > price;
    const discountPercent = hasDiscount
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

    return (
      <div
        ref={ref}
        className={cn("product-price", sizeClasses[size], className)}
        {...props}
      >
        <span className="product-price-current" aria-label={`Price ${formatPrice(price, currency, locale)}`}>
          {formatPrice(price, currency, locale)}
        </span>

        {hasDiscount && (
          <>
            <span className="product-price-compare" aria-hidden="true">
              {formatPrice(compareAtPrice, currency, locale)}
            </span>
            {showDiscount && (
              <span className="product-price-discount" aria-label={`${discountPercent} percent off`}>
                -{discountPercent}%
              </span>
            )}
          </>
        )}
      </div>
    );
  },
);

ProductPrice.displayName = "ProductPrice";
