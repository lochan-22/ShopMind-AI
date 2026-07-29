import { forwardRef, type HTMLAttributes } from "react";

import type { ProductImageAspect } from "@/components/product/types";
import type { ComponentSize } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const aspectClasses: Record<ProductImageAspect, string> = {
  square: "product-image-square",
  portrait: "product-image-portrait",
  landscape: "product-image-landscape",
};

const sizeClasses: Record<Exclude<ComponentSize, "xs" | "xl">, string> = {
  sm: "product-image-sm",
  md: "product-image-md",
  lg: "product-image-lg",
};

export interface ProductImageProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  aspect?: ProductImageAspect;
  size?: Exclude<ComponentSize, "xs" | "xl">;
  placeholderColor?: string;
  placeholderLabel?: string;
  loading?: "lazy" | "eager";
}

export const ProductImage = forwardRef<HTMLDivElement, ProductImageProps>(
  (
    {
      src,
      alt,
      aspect = "square",
      size = "md",
      placeholderColor = "#ececee",
      placeholderLabel,
      loading = "lazy",
      className,
      ...props
    },
    ref,
  ) => {
    const initial = placeholderLabel ?? alt.slice(0, 2).toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          "product-image",
          aspectClasses[aspect],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {src && src.trim() !== "" ? (
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="product-image-img"
          />
        ) : (
          <div
            className="product-image-placeholder"
            style={{ backgroundColor: placeholderColor }}
            aria-hidden="true"
          >
            <span className="product-image-placeholder-label">{initial}</span>
          </div>
        )}
      </div>
    );
  },
);

ProductImage.displayName = "ProductImage";
