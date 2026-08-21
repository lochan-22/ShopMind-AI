import type { AgentAction, MockAgentResponse } from "../types/tool";

const pause = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const createMockProduct = () => ({
  id: 1001,
  name: "ShopMind Mock Headphones",
  brand: "ShopMind",
  category: "Headphones",
  price: 129.99,
  rating: 4.6,
  review_count: 128,
  description: "A mock product used by the AI assistant tool engine.",
  stock: true,
  image: null,
});

export const mockAgent = async (message: string): Promise<MockAgentResponse> => {
  const normalized = message.trim().toLowerCase();
  const actions: AgentAction[] = [];

  await pause(700);

  if (normalized === "cart" || normalized.includes("open cart")) {
    actions.push({ tool: "openCart", args: {} });
    return { message: "Opening your cart.", actions };
  }

  if (normalized.includes("checkout")) {
    actions.push({ tool: "checkout", args: {} });
    return { message: "I can get your cart ready for checkout.", actions };
  }

  if (normalized.includes("category")) {
    actions.push({ tool: "navigate", args: { path: "/categories" } });
    return { message: "Opening categories for you.", actions };
  }

  if (normalized.startsWith("open product ")) {
    const productId = Number(normalized.replace("open product ", ""));
    if (Number.isInteger(productId)) {
      actions.push({ tool: "openProduct", args: { productId } });
      return { message: `Opening product ${productId}.`, actions };
    }
  }

  if (normalized.includes("add") && normalized.includes("cart")) {
    actions.push({ tool: "addToCart", args: { product: createMockProduct() } });
    actions.push({ tool: "openCart", args: {} });
    return { message: "Adding a mock product to your cart.", actions };
  }

  if (normalized.includes("compare")) {
    actions.push({ tool: "compareProducts", args: { productIds: [] } });
    return { message: "I can compare products in mock mode.", actions };
  }

  if (normalized.includes("search") || normalized.includes("find") || normalized.includes("show me")) {
    actions.push({ tool: "searchProducts", args: { query: message.trim() } });
    return { message: `Searching for "${message.trim()}" in mock mode.`, actions };
  }

  return {
    message: "I'm currently running in mock mode. I can simulate searching, comparing products, opening a product, adding items to your cart, and checkout actions.",
    actions,
  };
};
