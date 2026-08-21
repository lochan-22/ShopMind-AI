import { useState, type ReactNode } from "react";
import { streamChat, type ChatHistoryMessage } from "../../services/agentService";
import { AgentContext, type AgentMessageData } from "./AgentContext";

const createMessage = (role: AgentMessageData["role"], content: string): AgentMessageData => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
});

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<AgentMessageData[]>([
    createMessage("agent", "Hi! I'm your ShopMind AI assistant. How can I help you shop today?"),
  ]);

  const sendMessage = async (content: string) => {
    const message = content.trim();
    if (!message || isThinking) return;

    const history: ChatHistoryMessage[] = messages
      .filter((item) => item.role === "user" || item.role === "agent")
      .map((item) => ({ role: item.role === "agent" ? "assistant" : "user", content: item.content }));
    const assistantMessage = createMessage("agent", "");
    let receivedResponse = false;
    setMessages((current) => [...current, createMessage("user", message), assistantMessage]);
    setIsThinking(true);

    try {
      await streamChat(message, history, (event) => {
        if (event.type === "token") {
          receivedResponse = true;
          setMessages((current) => current.map((item) => item.id === assistantMessage.id
            ? { ...item, content: item.content + event.content }
            : item));
        }
        if (event.type === "error") {
          receivedResponse = true;
          setMessages((current) => current.map((item) => item.id === assistantMessage.id
            ? { ...item, content: event.message }
            : item));
        }
      });
      if (!receivedResponse) {
        setMessages((current) => current.map((item) => item.id === assistantMessage.id
          ? { ...item, content: "I didn't receive a response. Please try again." }
          : item));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "I couldn't connect to the AI assistant. Please try again.";
      setMessages((current) => current.map((item) => item.id === assistantMessage.id ? { ...item, content: message } : item));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AgentContext.Provider
      value={{
        isOpen,
        isThinking,
        messages,
        openAgent: () => setIsOpen(true),
        closeAgent: () => setIsOpen(false),
        sendMessage,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};
