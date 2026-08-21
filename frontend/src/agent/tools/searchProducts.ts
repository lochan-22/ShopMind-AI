import type { ToolArgs, ToolHandler } from "../types/tool";

const getQuery = (args: ToolArgs): string => {
  const query = args.query;
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Missing required string argument: query");
  }
  return query.trim();
};

export const createSearchProductsTool = (): ToolHandler => async (args) => {
  const query = getQuery(args);
  return { query, products: [] };
};
