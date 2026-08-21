import type { NavigateFunction } from "react-router-dom";
import type { ToolArgs, ToolHandler } from "../types/tool";

const getPath = (args: ToolArgs): string => {
  const path = args.path;
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("Missing required string argument: path");
  }
  return path.trim();
};

export const createNavigateTool = (navigateTo: NavigateFunction): ToolHandler => (args) => {
  const path = getPath(args);
  navigateTo(path);
  return { path };
};
