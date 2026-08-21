import type { NavigateFunction } from "react-router-dom";
import type { ToolArgs, ToolHandler } from "../types/tool";

const getProductId = (args: ToolArgs): number => {
  const productId = args.productId;
  if (typeof productId !== "number" || !Number.isFinite(productId)) {
    throw new Error("Missing required number argument: productId");
  }
  return productId;
};

export const createOpenProductTool = (navigateTo: NavigateFunction): ToolHandler => (args) => {
  const productId = getProductId(args);
  navigateTo(`/products/${productId}`);
  return { productId };
};
