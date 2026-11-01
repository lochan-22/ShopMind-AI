import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CircleAlert, RotateCcw } from "lucide-react";
import type { AgentMessageData } from "../AgentContext";
import type { Product } from "../../services/productService";
import { LogoMark } from "../../components/brand/Logo";
import { ProductImage } from "../../components/product/ProductImage";
import { Rating } from "../../components/product/ProductCard";
import { formatPrice } from "../../utils/format";
import { productPath, productRetailer } from "../../utils/product";
import { cn } from "../../utils/cn";
import { TypingIndicator } from "./TypingIndicator";
import { ProductRail } from "./ProductRail";

const ChatProduct = ({ product, all, onNavigate }: { product: Product; all: Product[]; onNavigate?: () => void }) => {
  const price = formatPrice(product.price, product.currency);
  return (
    <Link
      to={productPath(product)}
      state={{ product, comparisonCandidates: all }}
      onClick={onNavigate}
      draggable={false}
      className="group flex w-[13.25rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-surface p-1.5 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card sm:w-[14.5rem]"
    >
      <ProductImage src={product.image} alt={product.name} className="aspect-[4/3] rounded-xl" imgClassName="p-3 group-hover:scale-105" />
      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-2.5">
        <p className="eyebrow truncate text-[9.5px] text-faint">{productRetailer(product) ?? product.brand ?? "Live listing"}</p>
        <p className="line-clamp-2 mt-1 text-[13px] font-medium leading-snug text-ink">{product.name}</p>
        <Rating rating={product.rating} reviews={product.review_count} className="mt-1.5" />
        <p className="tabular mt-auto pt-2 text-[15px] font-semibold text-ink">{price ?? <span className="text-xs font-normal text-faint">Price unavailable</span>}</p>
      </div>
    </Link>
  );
};

interface ChatThreadProps {
  messages: AgentMessageData[];
  isThinking: boolean;
  onNavigate?: () => void;
  onRetry?: (messageId: string) => void;
  className?: string;
}

export const ChatThread = ({ messages, isThinking, onNavigate, onRetry, className }: ChatThreadProps) => {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, last?.content.length, last?.products?.length]);

  return (
    <div className={cn("space-y-6", className)} aria-live="polite" aria-busy={isThinking}>
      {messages.map((message) =>
        message.role === "user" ? (
          <div key={message.id} className="rise-in flex justify-end">
            <p className="max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-ink px-4 py-2.5 text-[14.5px] leading-relaxed text-white">
              {message.content}
            </p>
          </div>
        ) : (
          <div key={message.id} className="rise-in flex gap-3">
            <LogoMark className="mt-0.5 h-7 w-7" />
            <div className="min-w-0 flex-1">
              {message.isError ? (
                <div role="alert" className="rounded-2xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                  <p className="flex gap-2">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {message.content}
                  </p>
                  {onRetry && message.id === last?.id && (
                    <button
                      type="button"
                      onClick={() => onRetry(message.id)}
                      disabled={isThinking}
                      className="ml-6 mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink ring-1 ring-inset ring-line transition-colors hover:ring-ink disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Try again
                    </button>
                  )}
                </div>
              ) : message.content ? (
                <div className="prose-chat">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                isThinking && message.id === last?.id && <TypingIndicator />
              )}
              {message.products && message.products.length > 0 && (
                <ProductRail count={message.products.length} label="Products from this answer">
                  {message.products.map((product, index) => (
                    <ChatProduct key={`${product.product_id ?? product.id}-${index}`} product={product} all={message.products ?? []} onNavigate={onNavigate} />
                  ))}
                </ProductRail>
              )}
            </div>
          </div>
        ),
      )}
      <div ref={endRef} />
    </div>
  );
};
