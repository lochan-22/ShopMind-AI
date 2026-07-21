import { forwardRef, type HTMLAttributes } from "react";

import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "product-rating-sm",
  md: "product-rating-md",
  lg: "product-rating-lg",
};

export interface ProductRatingProps extends HTMLAttributes<HTMLDivElement> {
  rating: number;
  reviewCount?: number;
  maxRating?: number;
  size?: Exclude<ComponentSize, "xs" | "xl">;
  showValue?: boolean;
  showCount?: boolean;
}

export const ProductRating = forwardRef<HTMLDivElement, ProductRatingProps>(
  (
    {
      rating,
      reviewCount,
      maxRating = 5,
      size = "md",
      showValue = true,
      showCount = true,
      className,
      ...props
    },
    ref,
  ) => {
    const clampedRating = Math.min(Math.max(rating, 0), maxRating);
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating - fullStars >= 0.5;

    return (
      <div
        ref={ref}
        className={cn("product-rating", sizeClasses[size], className)}
        role="img"
        aria-label={`Rated ${clampedRating.toFixed(1)} out of ${maxRating}${reviewCount !== undefined ? `, ${reviewCount} reviews` : ""}`}
        {...props}
      >
        <span className="product-rating-stars" aria-hidden="true">
          {Array.from({ length: maxRating }, (_, index) => {
            const starIndex = index + 1;
            const filled = starIndex <= fullStars;
            const half = !filled && hasHalfStar && starIndex === fullStars + 1;

            return (
              <StarIcon
                key={index}
                filled={filled}
                half={half}
                className="product-rating-star"
              />
            );
          })}
        </span>

        {showValue && (
          <span className="product-rating-value" aria-hidden="true">
            {clampedRating.toFixed(1)}
          </span>
        )}

        {showCount && reviewCount !== undefined && (
          <span className="product-rating-count" aria-hidden="true">
            ({reviewCount.toLocaleString()})
          </span>
        )}
      </div>
    );
  },
);

ProductRating.displayName = "ProductRating";

interface StarIconProps {
  filled: boolean;
  half: boolean;
  className?: string;
}

function StarIcon({ filled, half, className }: StarIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled || half ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        className,
        half && "product-rating-star-half",
        !filled && !half && "product-rating-star-empty",
      )}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
