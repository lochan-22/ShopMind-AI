import type { NavigateFunction } from "react-router-dom";
import type { ToolHandler } from "../types/tool";

export const createOpenCartTool = (navigateTo: NavigateFunction): ToolHandler => () => {
  navigateTo("/cart");
  return { path: "/cart" };
};
