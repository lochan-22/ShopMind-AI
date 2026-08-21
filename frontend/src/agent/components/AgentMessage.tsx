import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AgentMessageData } from "../context/AgentContext";

export const AgentMessage = ({ message }: { message: AgentMessageData }) => (
  <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
    </div>
  </div>
);
