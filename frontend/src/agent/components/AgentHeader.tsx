import { X } from "lucide-react";
import { AgentStatus } from "./AgentStatus";

export const AgentHeader = ({ thinking, onClose }: { thinking: boolean; onClose: () => void }) => (
  <header className="flex items-center justify-between border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-4 py-3.5">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-base text-white shadow-md shadow-indigo-200">✨</div>
      <div><p className="text-sm font-semibold tracking-tight text-slate-900">ShopMind AI</p><p className="text-xs text-slate-500">Your shopping copilot</p></div>
    </div>
    <div className="flex items-center gap-2"><AgentStatus thinking={thinking} /><button type="button" onClick={onClose} aria-label="Close AI assistant" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"><X className="h-4 w-4" /></button></div>
  </header>
);
