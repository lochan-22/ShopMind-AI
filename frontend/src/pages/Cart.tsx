import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, GitCompareArrows, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { ProductImage } from "../components/product/ProductImage";
import { StateView } from "../components/ui/StateView";
import { Accent } from "../components/ui/SectionHeading";
import { Button, buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatPrice } from "../utils/format";
import { bestOfferUrl, isComparable, productKey, productPath, productRetailer } from "../utils/product";
import { cn } from "../utils/cn";

const Cart = () => {
  useDocumentTitle("Cart");
  const navigate = useNavigate();
  const { items, totalQuantity, subtotal, unpricedCount, removeProduct, increaseQuantity, decreaseQuantity } = useCart();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const comparable = useMemo(() => items.map((item) => item.product).filter(isComparable), [items]);
  const validSelected = selected.filter((key) => comparable.some((product) => productKey(product) === key));

  const toggleSelected = (key: string) => {
    setMessage(null);
    setSelected((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key].slice(-2)));
  };

  const compare = () => {
    const chosen =
      comparable.length === 2 ? comparable : validSelected.map((key) => comparable.find((product) => productKey(product) === key)).filter(Boolean);
    if (chosen.length !== 2) {
      setMessage(comparable.length < 2 ? "Add at least two live products to compare them." : "Select two products below to compare.");
      return;
    }
    const [a, b] = chosen;
    navigate(`/compare?product_a=${encodeURIComponent(a!.product_id!)}&product_b=${encodeURIComponent(b!.product_id!)}`, {
      state: { comparisonCandidates: comparable },
    });
  };

  if (items.length === 0) {
    return (
      <div className="container-x pb-24 pt-32">
        <StateView
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Save products here while you decide. Purchases are completed on the retailer's site."
          actions={
            <>
              <Link to="/search" className={buttonClasses()}>
                Ask ShopMind <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/categories" className={buttonClasses("secondary")}>
                Browse collections
              </Link>
            </>
          }
        />
      </div>
    );
  }

  const showSelection = comparable.length > 2;

  return (
    <div className="container-x pb-24 pt-32 sm:pt-40">
      <div className="rise-in">
        <p className="eyebrow text-muted">Cart · {totalQuantity} item{totalQuantity === 1 ? "" : "s"}</p>
        <h1 className="mt-4 text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[3.4rem]">
          Your <Accent>selection</Accent>
        </h1>
        <p className="mt-3 max-w-lg text-[15px] text-muted">Saved picks, ready to compare or buy from the retailer.</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="space-y-3">
          {items.map(({ product, quantity }, index) => {
            const key = productKey(product);
            const price = formatPrice(product.price, product.currency);
            const lineTotal = product.price != null ? formatPrice(product.price * quantity, product.currency) : null;
            const url = bestOfferUrl(product);
            const isChecked = validSelected.includes(key);
            return (
              <li
                key={key}
                className={cn("card rise-in flex gap-4 p-3 transition-[border-color,box-shadow] sm:p-4", isChecked && "border-jade-300 shadow-glow")}
                style={{ ["--rise-index" as string]: index }}
              >
                <Link to={productPath(product)} state={{ productFallback: product }} className="shrink-0">
                  <ProductImage src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" imgClassName="p-2" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow truncate text-[10px] text-faint">{[product.brand, productRetailer(product)].filter(Boolean).join(" · ") || "Live listing"}</p>
                      <Link to={productPath(product)} state={{ productFallback: product }} className="line-clamp-2 mt-1 text-[14.5px] font-medium leading-snug text-ink hover:underline hover:underline-offset-4">
                        {product.name}
                      </Link>
                    </div>
                    {showSelection && isComparable(product) && (
                      <button
                        type="button"
                        onClick={() => toggleSelected(key)}
                        aria-pressed={isChecked}
                        className={cn(
                          "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] transition-colors",
                          isChecked ? "border-jade-600 bg-jade-600 text-white" : "border-line text-ink-2 hover:border-ink",
                        )}
                      >
                        {isChecked ? <Check className="h-3.5 w-3.5" /> : <GitCompareArrows className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">{isChecked ? "Selected" : "Compare"}</span>
                      </button>
                    )}
                  </div>
                  <p className="tabular mt-1.5 text-[13px] text-muted">{price ? `${price} each` : "Price unavailable"}</p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button type="button" onClick={() => decreaseQuantity(key)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 hover:bg-sunken" aria-label={`Decrease quantity of ${product.name}`}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="tabular w-7 text-center text-sm font-medium" aria-live="polite">
                        {quantity}
                      </span>
                      <button type="button" onClick={() => increaseQuantity(key)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-2 hover:bg-sunken" aria-label={`Increase quantity of ${product.name}`}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button type="button" onClick={() => removeProduct(key)} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] text-muted hover:bg-danger-soft hover:text-danger" aria-label={`Remove ${product.name}`}>
                      <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                    <div className="ml-auto flex items-center gap-3">
                      {lineTotal && <span className="tabular text-[15px] font-semibold text-ink">{lineTotal}</span>}
                      {url && (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full bg-ink px-3.5 text-[12px] font-medium text-white hover:bg-jade-700">
                          Buy <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card rise-in p-6" style={{ ["--rise-index" as string]: 2 }}>
            <p className="eyebrow text-[10px] text-muted">Summary</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Items</dt>
                <dd className="tabular text-ink">{totalQuantity}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <dt className="font-medium text-ink">Estimated total</dt>
                <dd className="tabular text-xl font-semibold tracking-tight text-ink">{formatPrice(subtotal) ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Based on listed prices{unpricedCount > 0 ? `; ${unpricedCount} item${unpricedCount === 1 ? " has" : "s have"} no listed price` : ""}. Each purchase is completed on the retailer's site, where the final price is confirmed.
            </p>

            <Button className="mt-6 w-full" size="lg" onClick={compare} disabled={comparable.length < 2} icon={<GitCompareArrows className="h-4 w-4" />}>
              {comparable.length === 2 ? "Compare these two" : validSelected.length === 2 ? "Compare selected" : "Compare products"}
            </Button>
            {showSelection && validSelected.length < 2 && !message && <p className="mt-3 text-center text-[12px] text-muted">Select two items to compare ({validSelected.length}/2).</p>}
            {message && (
              <p className="pop-in mt-3 text-center text-[12.5px] text-warn" role="status">
                {message}
              </p>
            )}
            <Link to="/search" className={buttonClasses("ghost", "md", "mt-2 w-full")}>
              Keep shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
