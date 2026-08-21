import type { NavigateFunction } from "react-router-dom";
import type { Product } from "../../services/productService";
import { createAddToCartTool } from "./addToCart";
import { createCheckoutTool } from "./checkout";
import { createCompareProductsTool } from "./compareProducts";
import { createNavigateTool } from "./navigate";
import { createOpenCartTool } from "./openCart";
import { createOpenProductTool } from "./openProduct";
import { createSearchProductsTool } from "./searchProducts";
import type { AgentToolName, ToolRegistry } from "../types/tool";

export interface AgentTools {
  registry: ToolRegistry;
  labels: Record<AgentToolName, string>;
}

export const createAgentTools = (navigateTo: NavigateFunction, addProductToCart: (product: Product) => void): AgentTools => ({
  labels: {
    searchProducts: "Searching products",
    navigate: "Navigating",
    openProduct: "Opening product",
    addToCart: "Adding to cart",
    openCart: "Opening cart",
    compareProducts: "Comparing products",
    checkout: "Preparing checkout",
  },
  registry: {
    searchProducts: createSearchProductsTool(),
    navigate: createNavigateTool(navigateTo),
    openProduct: createOpenProductTool(navigateTo),
    addToCart: createAddToCartTool(addProductToCart),
    openCart: createOpenCartTool(navigateTo),
    compareProducts: createCompareProductsTool(),
    checkout: createCheckoutTool(navigateTo),
  },
});
