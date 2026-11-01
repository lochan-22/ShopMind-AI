import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../services/productService";
import { isComparable, productKey } from "../utils/product";

const COMPARE_STORAGE_KEY = "shopmind-compare";
export const MAX_COMPARE = 2;

const getStoredSelection = (): Product[] => {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? (stored as Product[]).filter(isComparable).slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
};

interface CompareContextValue {
  selected: Product[];
  /** Candidate list (usually the current search results) offered when picking a second product. */
  candidates: Product[];
  isSelected: (product: Product) => boolean;
  toggle: (product: Product, candidates?: Product[]) => void;
  remove: (product: Product) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [selected, setSelected] = useState<Product[]>(getStoredSelection);
  const [candidates, setCandidates] = useState<Product[]>([]);

  useEffect(() => {
    try {
      sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // Selection still works for this page view without storage.
    }
  }, [selected]);

  const value = useMemo<CompareContextValue>(() => {
    const keys = new Set(selected.map(productKey));
    return {
      selected,
      candidates,
      isSelected: (product) => keys.has(productKey(product)),
      toggle: (product, nextCandidates) => {
        if (!isComparable(product)) return;
        if (nextCandidates) setCandidates(nextCandidates);
        setSelected((current) => {
          const key = productKey(product);
          if (current.some((item) => productKey(item) === key)) {
            return current.filter((item) => productKey(item) !== key);
          }
          // Keep the most recent choice when the tray is already full.
          return [...current, product].slice(-MAX_COMPARE);
        });
      },
      remove: (product) => setSelected((current) => current.filter((item) => productKey(item) !== productKey(product))),
      clear: () => setSelected([]),
    };
  }, [selected, candidates]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCompare = (): CompareContextValue => {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within a CompareProvider");
  return context;
};
