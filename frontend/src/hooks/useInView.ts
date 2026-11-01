import { useEffect, useRef, useState } from "react";

type Listener = () => void;

const pending = new Map<Element, Listener>();
let sharedObserver: IntersectionObserver | null = null;
let frame = 0;

const reveal = (element: Element) => {
  const listener = pending.get(element);
  if (!listener) return;
  pending.delete(element);
  sharedObserver?.unobserve(element);
  listener();
};

/**
 * A fast scroll can carry an element from below the viewport to above it
 * between two observer samples, so it never "intersects". Catch those here.
 */
const sweepPassedElements = () => {
  frame = 0;
  const limit = window.innerHeight;
  for (const element of [...pending.keys()]) {
    if (element.getBoundingClientRect().top < limit) reveal(element);
  }
};

const onScroll = () => {
  if (!frame && pending.size) frame = window.requestAnimationFrame(sweepPassedElements);
};

const getObserver = (): IntersectionObserver | null => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  return sharedObserver;
};

/**
 * Report once when an element scrolls into view. One shared observer serves
 * every revealed element on the page.
 */
export const useInView = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = getObserver();
    if (!observer) {
      setVisible(true);
      return;
    }
    pending.set(element, () => setVisible(true));
    observer.observe(element);
    return () => {
      pending.delete(element);
      observer.unobserve(element);
    };
  }, [visible]);

  return { ref, visible };
};
