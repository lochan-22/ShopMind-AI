import React, { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Global Scroll Restoration Component.
 *
 * Ensures:
 * 1. PUSH / REPLACE navigation (clicking links, category cards, navigation items)
 *    always opens the new page at the very top (scroll position 0, 0).
 * 2. Hash navigation (e.g., #hero-search) smoothly scrolls the target into view.
 * 3. Browser Back / Forward (POP navigation) preserves previous scroll positions,
 *    especially when returning to Search Results or previous pages.
 */
export const ScrollRestoration: React.FC = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    // If there is an anchor hash, allow smooth scrolling to target element
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        prevPathnameRef.current = location.pathname;
        return;
      }
    }

    // On standard link click (PUSH) or programmatic replace (REPLACE)
    if (navType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else {
      // On browser Back / Forward (POP):
      // Do not force scroll to (0, 0). If the destination is /search,
      // SearchResults.tsx will restore its own tracked scroll position from searchCache.
    }

    prevPathnameRef.current = location.pathname;
  }, [location.pathname, location.search, location.hash, navType]);

  return null;
};

export default ScrollRestoration;

