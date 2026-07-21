import { forwardRef, type HTMLAttributes } from "react";

import type { ProductBadgeType } from "@/components/product/types";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const badgeConfig: Record<
  ProductBadgeType,
  { label: string; variant: BadgeVariant }
> = {
  sale: { label: "Sale", variant: "error" },
  new: { label: "New", variant: "accent" },
  bestseller: { label: "Best Seller", variant: "secondary" },
  limited: { label: "Limited", variant: "warning" },
  "out-of-stock": { label: "Out of Stock", variant: "outline" },
};

export interface ProductBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type: ProductBadgeType;
  label?: string;
}

export const ProductBadge = forwardRef<HTMLSpanElement, ProductBadgeProps>(
  ({ type, label, className, ...props }, ref) => {
    const config = badgeConfig[type];
    const displayLabel = label ?? config.label;

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size="sm"
        className={cn("product-badge", className)}
        {...props}
      >
        {displayLabel}
      </Badge>
    );
  },
);

ProductBadge.displayName = "ProductBadge";
