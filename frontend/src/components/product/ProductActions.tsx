import { Check, GitCompareArrows, ShoppingBag } from "lucide-react";
import type { Product } from "../../services/productService";
import { useCart } from "../../contexts/CartContext";
import { useCompare } from "../../contexts/CompareContext";
import { isComparable, isInStock } from "../../utils/product";
import { cn } from "../../utils/cn";

const iconButton =
  "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-90";

/** Compare toggle shown on every comparable product card. */
export const CompareToggle = ({
  product,
  candidates,
  className,
}: {
  product: Product;
  candidates?: Product[];
  className?: string;
}) => {
  const { isSelected, toggle } = useCompare();
  if (!isComparable(product)) return null;
  const selected = isSelected(product);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product, candidates);
      }}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
      title={selected ? "Selected for comparison" : "Compare"}
      className={cn(
        iconButton,
        selected
          ? "border-jade-600 bg-jade-600 text-white"
          : "border-line bg-surface/90 text-ink-2 backdrop-blur hover:border-ink hover:text-ink",
        className,
      )}
    >
      {selected ? <Check className="pop-in h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
    </button>
  );
};

/** Add-to-cart button; disabled only when the listing reports it out of stock. */
export const AddToCartButton = ({ product, className }: { product: Product; className?: string }) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product);
  const outOfStock = isInStock(product) === false;
  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(product);
      }}
      aria-label={outOfStock ? "Out of stock" : inCart ? `Add another ${product.name} to cart` : `Add ${product.name} to cart`}
      title={outOfStock ? "Out of stock" : inCart ? "In your cart — add another" : "Add to cart"}
      className={cn(
        iconButton,
        inCart ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-ink hover:bg-ink hover:text-white",
        "disabled:opacity-40",
        className,
      )}
    >
      {inCart ? <Check className="pop-in h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
    </button>
  );
};
