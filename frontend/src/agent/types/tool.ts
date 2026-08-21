export type AgentToolName =
  | "searchProducts"
  | "navigate"
  | "openProduct"
  | "addToCart"
  | "openCart"
  | "compareProducts"
  | "checkout";

export type ToolArgs = Record<string, unknown>;

export interface AgentAction {
  tool: AgentToolName;
  args: ToolArgs;
}

export interface MockAgentResponse {
  message: string;
  actions: AgentAction[];
}

export type ToolExecutionStatus = "pending" | "running" | "completed" | "failed";

export interface ToolExecutionProgress {
  id: string;
  action: AgentAction;
  status: ToolExecutionStatus;
  label: string;
  message?: string;
}

export interface ToolExecutionResult {
  action: AgentAction;
  success: boolean;
  data?: unknown;
  error?: string;
}

export type ToolProgressReporter = (progress: ToolExecutionProgress) => void;

export type ToolHandler = (args: ToolArgs) => Promise<unknown> | unknown;

export type ToolRegistry = Record<AgentToolName, ToolHandler>;
