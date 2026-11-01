import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

interface ProductRailProps {
  count: number;
  label: string;
  children: ReactNode;
}

const DRAG_THRESHOLD = 6;

/**
 * Horizontal product strip. Touch and trackpad swipes scroll natively; mouse
 * users get arrow buttons and click-and-drag. A drag never triggers the card link.
 */
export const ProductRail = ({ count, label, children }: ProductRailProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [edges, setEdges] = useState({ start: true, end: true });
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : el.clientWidth;
    // At the far end, report the last card so the indicator always reaches it.
    setIndex(el.scrollLeft >= max - 2 ? count - 1 : Math.round(el.scrollLeft / step));
  }, [count]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const scrollByCards = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const card = first ? first.offsetWidth + 12 : el.clientWidth * 0.8;
    const perView = Math.max(1, Math.floor(el.clientWidth / card));
    el.scrollBy({ left: direction * card * perView, behavior: "smooth" });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { active: true, moved: false, startX: event.clientX, startScroll: event.currentTarget.scrollLeft };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state.active) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
    if (!state.moved) {
      state.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.currentTarget.scrollLeft = state.startScroll - delta;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const scrollable = !(edges.start && edges.end);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="eyebrow text-[10px] text-faint">
          {count} live {count === 1 ? "result" : "results"}
          {scrollable && (
            <span className="tabular ml-2 normal-case tracking-normal text-muted">
              {Math.min(index + 1, count)} / {count}
            </span>
          )}
        </p>
        {scrollable && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={edges.start}
              aria-label="Previous products"
              className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={edges.end}
              aria-label="Next products"
              className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-35 disabled:hover:border-line"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          onScroll={measure}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(event) => {
            // Swallow the click that ends a drag so the card link doesn't open.
            if (drag.current.moved) {
              event.preventDefault();
              event.stopPropagation();
              drag.current.moved = false;
            }
          }}
          onDragStart={(event) => event.preventDefault()}
          className={cn(
            "rail-scroll relative flex gap-3 overflow-x-auto overscroll-x-contain px-0.5 pb-3 pt-1 outline-none focus-visible:ring-2 focus-visible:ring-jade-400/60",
            dragging ? "cursor-grabbing select-none" : "snap-x snap-mandatory scroll-smooth",
            scrollable && !dragging && "cursor-grab",
          )}
        >
          {children}
        </div>
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--rail-fade,var(--color-paper))] to-transparent transition-opacity duration-300", edges.start && "opacity-0")}
        />
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--rail-fade,var(--color-paper))] to-transparent transition-opacity duration-300", edges.end && "opacity-0")}
        />
      </div>
    </div>
  );
};
