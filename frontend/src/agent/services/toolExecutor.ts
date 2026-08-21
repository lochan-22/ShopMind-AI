import type {
  AgentAction,
  ToolExecutionProgress,
  ToolExecutionResult,
  ToolProgressReporter,
  ToolRegistry,
} from "../types/tool";

const getActionId = (action: AgentAction, index: number) => `${index}-${action.tool}`;

export class ToolExecutor {
  private readonly registry: ToolRegistry;
  private readonly labels: Record<string, string>;

  constructor(registry: ToolRegistry, labels: Record<string, string>) {
    this.registry = registry;
    this.labels = labels;
  }

  async execute(actions: AgentAction[], onProgress?: ToolProgressReporter): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];

    for (const [index, action] of actions.entries()) {
      const id = getActionId(action, index);
      const label = this.labels[action.tool] ?? action.tool;

      this.report(onProgress, { id, action, status: "pending", label });
      this.report(onProgress, { id, action, status: "running", label, message: "Running" });

      try {
        const handler = this.registry[action.tool];
        if (!handler) throw new Error(`Tool is not registered: ${action.tool}`);

        const data = await handler(action.args);
        this.report(onProgress, { id, action, status: "completed", label, message: "Completed" });
        results.push({ action, success: true, data });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown tool execution error";
        this.report(onProgress, { id, action, status: "failed", label, message });
        results.push({ action, success: false, error: message });
      }
    }

    return results;
  }

  private report(onProgress: ToolProgressReporter | undefined, progress: ToolExecutionProgress) {
    onProgress?.(progress);
  }
}
