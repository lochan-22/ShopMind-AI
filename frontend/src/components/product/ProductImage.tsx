import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "../../utils/cn";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Retailer images usually sit on white. Multiply-blending them onto a soft
 * well lets every product share the same calm backdrop.
 */
export const ProductImage = ({ src, alt, className, imgClassName, eager = false }: ProductImageProps) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-well", className)}>
      {showImage ? (
        <>
          {!loaded && <div className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}
          <img
            src={src ?? undefined}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "h-full w-full object-contain mix-blend-multiply transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
              loaded ? "opacity-100" : "opacity-0",
              imgClassName,
            )}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-faint">
          <ImageOff className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-[11px]">Image unavailable</span>
        </div>
      )}
    </div>
  );
};
