import type { ToolHandler } from "../types/tool";

export const createCompareProductsTool = (): ToolHandler => (args) => {
  const productIds = Array.isArray(args.productIds) ? args.productIds.filter((id): id is number => typeof id === "number") : [];
  return { productIds, comparison: "Mock comparison ready" };
};
