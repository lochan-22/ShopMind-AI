import { forwardRef, type HTMLAttributes } from "react";

import { MOCK_PRODUCTS } from "@/components/product/mock";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/components/product/types";
import { cn } from "@/utils/cn";

export type ProductGridColumns = 2 | 3 | 4 | "auto";

const columnClasses: Record<ProductGridColumns, string> = {
  2: "product-grid-cols-2",
  3: "product-grid-cols-3",
  4: "product-grid-cols-4",
  auto: "product-grid-cols-auto",
};

export interface ProductGridProps extends HTMLAttributes<HTMLDivElement> {
  products?: Product[];
  columns?: ProductGridColumns;
  showDescription?: boolean;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  (
    {
      products = MOCK_PRODUCTS,
      columns = "auto",
      showDescription = false,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="list"
        aria-label="Products"
        className={cn("product-grid", columnClasses[columns], className)}
        {...props}
      >
        {products.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard product={product} showDescription={showDescription} />
          </div>
        ))}
      </div>
    );
  },
);

ProductGrid.displayName = "ProductGrid";
