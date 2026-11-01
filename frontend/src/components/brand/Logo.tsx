import { cn } from "../../utils/cn";

/** Official ShopMind AI artwork, extracted from the supplied brand files. */
export const BRAND = {
  icon128: "/brand/shopmind-icon-128.webp",
  icon256: "/brand/shopmind-icon-256.webp",
  wordmark: "/brand/shopmind-wordmark.webp",
  full: "/brand/shopmind-logo.webp",
} as const;

// Intrinsic sizes of the extracted files, so images reserve space before loading.
const WORDMARK_SIZE = { width: 1801, height: 384 };
const FULL_SIZE = { width: 1801, height: 471 };

/** The circular ShopMind badge, for icon placements (avatars, loaders, compact headers). */
export const LogoMark = ({ className, alt = "" }: { className?: string; alt?: string }) => (
  <img
    src={BRAND.icon128}
    srcSet={`${BRAND.icon128} 128w, ${BRAND.icon256} 256w`}
    sizes="64px"
    width={128}
    height={128}
    alt={alt}
    aria-hidden={alt ? undefined : true}
    decoding="async"
    draggable={false}
    className={cn("h-8 w-8 shrink-0 select-none rounded-full object-contain", className)}
  />
);

interface LogoProps {
  className?: string;
  /** "wordmark" omits the tagline row, which is unreadable at header sizes. */
  variant?: "wordmark" | "full";
  /**
   * The supplied logo has white lettering made for dark backgrounds. On light
   * surfaces, set this to seat it in a dark capsule.
   */
  framed?: boolean;
  imgClassName?: string;
}

export const Logo = ({ className, variant = "wordmark", framed = false, imgClassName }: LogoProps) => {
  const size = variant === "full" ? FULL_SIZE : WORDMARK_SIZE;
  const image = (
    <img
      src={variant === "full" ? BRAND.full : BRAND.wordmark}
      width={size.width}
      height={size.height}
      alt="ShopMind AI"
      decoding="async"
      draggable={false}
      className={cn("block w-auto select-none", variant === "full" ? "h-14" : "h-[26px]", imgClassName)}
    />
  );
  if (!framed) return <span className={cn("inline-flex", className)}>{image}</span>;
  return (
    <span className={cn("inline-flex h-10 items-center rounded-full bg-night px-3.5 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]", className)}>
      {image}
    </span>
  );
};
