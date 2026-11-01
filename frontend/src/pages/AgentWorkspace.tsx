import { RotateCcw } from "lucide-react";
import { useAgent } from "../agent/AgentContext";
import { ChatThread } from "../agent/components/ChatThread";
import { ChatComposer } from "../agent/components/ChatComposer";
import { ConciergeIntro } from "../agent/components/AgentPanel";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/** Full-screen concierge. Shares its conversation with the slide-over panel. */
const AgentWorkspace = () => {
  useDocumentTitle("Concierge");
  const { messages, isThinking, sendMessage, retryMessage, resetConversation } = useAgent();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden" aria-hidden="true">
        <div className="animate-float-a absolute -left-20 -top-32 h-96 w-96 rounded-full bg-jade-200/50 blur-[100px]" />
        <div className="animate-float-b absolute -right-20 -top-24 h-96 w-96 rounded-full bg-iris/15 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-muted">Concierge</p>
          {messages.length > 0 && (
            <button type="button" onClick={resetConversation} disabled={isThinking} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] text-muted hover:bg-sunken hover:text-ink disabled:opacity-40">
              <RotateCcw className="h-3.5 w-3.5" /> New conversation
            </button>
          )}
        </div>
        <div className="flex-1 pb-8">
          {messages.length === 0 ? (
            <ConciergeIntro onPick={(prompt) => void sendMessage(prompt)} />
          ) : (
            <ChatThread messages={messages} isThinking={isThinking} onRetry={retryMessage} className="pt-6" />
          )}
        </div>
        <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-paper via-paper to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:-mx-6 sm:px-6">
          <ChatComposer onSend={(text) => void sendMessage(text)} disabled={isThinking} autoFocus />
          <p className="mt-2 text-center text-[11px] text-faint">Product facts come from live listings. Verify details with the retailer before buying.</p>
        </div>
      </div>
    </div>
  );
};

export default AgentWorkspace;
