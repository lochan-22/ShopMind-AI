import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { streamChat, type ChatHistoryMessage } from "../services/agentService";
import { AgentContext, type AgentContextValue, type AgentMessageData } from "./AgentContext";

const createMessage = (role: AgentMessageData["role"], content: string): AgentMessageData => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
});

const MAX_HISTORY = 40;

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<AgentMessageData[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const thinkingRef = useRef(false);

  const updateMessage = (id: string, update: (message: AgentMessageData) => AgentMessageData) =>
    setMessages((current) => current.map((item) => (item.id === id ? update(item) : item)));

  const runMessage = useCallback(async (message: string, previous: AgentMessageData[]) => {
    const history: ChatHistoryMessage[] = previous
      .filter((item) => item.content.trim() && !item.isError)
      .slice(-MAX_HISTORY)
      .map((item) => ({ role: item.role === "agent" ? "assistant" : "user", content: item.content }));
    const assistantMessage = createMessage("agent", "");
    let receivedResponse = false;
    setMessages([...previous, createMessage("user", message), assistantMessage]);
    thinkingRef.current = true;
    setIsThinking(true);

    try {
      await streamChat(message, history, (event) => {
        if (event.type === "token") {
          receivedResponse = true;
          updateMessage(assistantMessage.id, (item) => ({ ...item, content: item.content + event.content }));
        }
        if (event.type === "products") {
          receivedResponse = true;
          updateMessage(assistantMessage.id, (item) => ({ ...item, products: event.products }));
        }
        if (event.type === "error") {
          receivedResponse = true;
          updateMessage(assistantMessage.id, (item) => ({ ...item, content: event.message, isError: true }));
        }
      });
      if (!receivedResponse) {
        updateMessage(assistantMessage.id, (item) => ({
          ...item,
          content: "I didn't receive a response. Please try again.",
          isError: true,
        }));
      }
    } catch (error) {
      updateMessage(assistantMessage.id, (item) => ({
        ...item,
        content: error instanceof Error ? error.message : "I couldn't connect to the AI assistant. Please try again.",
        isError: true,
      }));
    } finally {
      thinkingRef.current = false;
      setIsThinking(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const message = content.trim();
      if (!message || thinkingRef.current) return;
      await runMessage(message, messagesRef.current);
    },
    [runMessage],
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      if (thinkingRef.current) return;
      const current = messagesRef.current;
      const index = current.findIndex((item) => item.id === messageId);
      const prompt = current[index - 1];
      if (index < 1 || prompt?.role !== "user") return;
      void runMessage(prompt.content, current.slice(0, index - 1));
    },
    [runMessage],
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      isOpen,
      isThinking,
      messages,
      openAgent: () => setIsOpen(true),
      closeAgent: () => setIsOpen(false),
      sendMessage,
      retryMessage,
      resetConversation: () => {
        if (!thinkingRef.current) setMessages([]);
      },
    }),
    [isOpen, isThinking, messages, sendMessage, retryMessage],
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};
