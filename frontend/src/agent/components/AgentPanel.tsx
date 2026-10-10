import { useEffect, useRef } from "react";
import { useAgent } from "../context/AgentContext";
import { AgentHeader } from "./AgentHeader";
import { AgentInput } from "./AgentInput";
import { AgentMessage } from "./AgentMessage";
import { AgentThinking } from "./AgentThinking";

export const AgentPanel = () => {
  const { closeAgent, isOpen, isThinking, messages, sendMessage } = useAgent();
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  return (
    <aside
      aria-hidden={!isOpen}
      className={`fixed bottom-24 right-3 z-[60] flex h-[min(38rem,calc(100vh-7.5rem))] w-[calc(100%-1.5rem)] max-w-md origin-bottom-right flex-col overflow-hidden rounded-3xl border transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
        isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-5 scale-95 opacity-0"
      }`}
      style={{
        backgroundColor: "#FAF7F2",
        borderColor: "#E8E2D9",
        boxShadow: "0 20px 60px rgba(124, 58, 237, 0.20), 0 0 0 1px rgba(13, 11, 30, 0.04)",
      }}
    >
      <AgentHeader thinking={isThinking} onClose={closeAgent} />
      <div
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
        style={{
          backgroundImage: "radial-gradient(circle, #DDD6FE 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {messages.map((message) => (message.content || message.products?.length) && (
          <AgentMessage key={message.id} message={message} />
        ))}
        {isThinking && <AgentThinking />}
        <div ref={conversationEndRef} />
      </div>
      <div
        className="px-4 pb-4 pt-1"
        style={{ backgroundColor: "rgba(250, 247, 242, 0.95)" }}
      >
        <AgentInput onSubmit={sendMessage} disabled={isThinking} />
      </div>
    </aside>
  );
};
