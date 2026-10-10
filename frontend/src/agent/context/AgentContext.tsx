import { createContext, useContext } from "react";
import type { Product } from "../../services/productService";

export type AgentRole = "user" | "agent";

export interface AgentMessageData {
  id: string;
  role: AgentRole;
  content: string;
  products?: Product[];
}

export interface AgentContextValue {
  isOpen: boolean;
  isThinking: boolean;
  messages: AgentMessageData[];
  openAgent: () => void;
  closeAgent: () => void;
  sendMessage: (message: string) => Promise<void>;
}

export const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export const useAgent = (): AgentContextValue => {
  const context = useContext(AgentContext);
  if (!context) throw new Error("useAgent must be used within an AgentProvider");
  return context;
};
