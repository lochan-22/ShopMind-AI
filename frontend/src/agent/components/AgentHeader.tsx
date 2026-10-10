import { X } from "lucide-react";
import { AgentStatus } from "./AgentStatus";
import ShopMindLogo from "../../components/common/ShopMindLogo";

export const AgentHeader = ({ thinking, onClose }: { thinking: boolean; onClose: () => void }) => (
  <header
    className="flex items-center justify-between border-b px-4 py-3.5"
    style={{
      background: "rgba(250, 247, 242, 0.95)",
      borderColor: "#E8E2D9",
      backdropFilter: "blur(12px)",
    }}
  >
    <div className="flex items-center gap-2 select-none">
      <ShopMindLogo variant="full" size="sm" />
    </div>
    <div className="flex items-center gap-2">
      <AgentStatus thinking={thinking} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close AI assistant"
        className="rounded-lg p-1.5 transition-colors hover:bg-[#EDE9FE] hover:text-[#7C3AED]"
        style={{ color: "#7A7068" }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  </header>
);
