import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { AgentMessageData } from "../context/AgentContext";
import { ProductCard } from "../../components/product/ProductCard";

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-2 text-base font-bold text-[#0D0B1E]">{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-2 mt-3 text-sm font-bold text-[#0D0B1E]">{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mb-1.5 mt-2 text-xs font-bold text-[#0D0B1E]">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-2 list-disc space-y-1 pl-4 text-xs">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-4 text-xs">{children}</ol>
  ),
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a
      className="font-semibold text-purple-600 underline hover:text-purple-700"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
};

export const AgentMessage = ({ message }: { message: AgentMessageData }) => (
  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
    <div className="max-w-[88%]">
      {message.content && (
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
            message.role === "user"
              ? "text-white"
              : "border"
          }`}
          style={{
            background:
              message.role === "user"
                ? "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
                : "linear-gradient(135deg, #FFFFFF 0%, #FDFAF7 100%)",
            borderColor: message.role === "user" ? "transparent" : "#E8E2D9",
            color: message.role === "user" ? "#FFFFFF" : "#0D0B1E",
            boxShadow:
              message.role === "user"
                ? "0 4px 12px rgba(124, 58, 237, 0.25)"
                : "0 2px 8px rgba(13, 11, 30, 0.04)",
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}
      {message.role === "agent" && message.products?.length ? (
        <div className="mt-2.5 grid gap-2">
          {message.products.map((product) => (
            <ProductCard
              key={product.product_id ?? product.id}
              product={product}
              showDescription={false}
            />
          ))}
        </div>
      ) : null}
    </div>
  </div>
);
