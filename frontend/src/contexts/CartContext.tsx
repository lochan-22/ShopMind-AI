import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../services/productService";
import { productKey } from "../utils/product";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "shopmind-cart";

const getStoredItems = (): CartItem[] => {
  try {
    const storedItems: unknown = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    return Array.isArray(storedItems)
      ? (storedItems as CartItem[]).filter((item) => item?.product?.name && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
};

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  /** Sum of known prices; items without a listed price are excluded. */
  subtotal: number;
  unpricedCount: number;
  addToCart: (product: Product) => void;
  removeProduct: (key: string) => void;
  increaseQuantity: (key: string) => void;
  decreaseQuantity: (key: string) => void;
  isInCart: (product: Product) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getStoredItems);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or disabled; the in-memory cart still works.
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const keys = new Set(items.map((item) => productKey(item.product)));
    return {
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0),
      unpricedCount: items.filter((item) => item.product.price == null).length,
      addToCart: (product) =>
        setItems((current) => {
          const key = productKey(product);
          const existing = current.find((item) => productKey(item.product) === key);
          return existing
            ? current.map((item) =>
                productKey(item.product) === key ? { ...item, quantity: item.quantity + 1 } : item,
              )
            : [...current, { product, quantity: 1 }];
        }),
      removeProduct: (key) => setItems((current) => current.filter((item) => productKey(item.product) !== key)),
      increaseQuantity: (key) =>
        setItems((current) =>
          current.map((item) => (productKey(item.product) === key ? { ...item, quantity: item.quantity + 1 } : item)),
        ),
      decreaseQuantity: (key) =>
        setItems((current) =>
          current.flatMap((item) => {
            if (productKey(item.product) !== key) return [item];
            return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
          }),
        ),
      isInCart: (product) => keys.has(productKey(product)),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
