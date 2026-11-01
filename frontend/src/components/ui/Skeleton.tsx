import { cn } from "../../utils/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("skeleton", className)} aria-hidden="true" />
);

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden p-2.5" aria-hidden="true">
    <Skeleton className="aspect-[4/3.4] w-full rounded-[14px]" />
    <div className="space-y-2.5 px-2 pb-2 pt-4">
      <Skeleton className="h-2.5 w-1/3 rounded-full" />
      <Skeleton className="h-3.5 w-full rounded-full" />
      <Skeleton className="h-3.5 w-3/4 rounded-full" />
      <div className="flex items-center justify-between pt-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8, className }: { count?: number; className?: string }) => (
  <div className={cn("grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4", className)} role="status" aria-label="Loading products">
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);
