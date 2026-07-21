import type { AgentSource } from "@/components/agent/types";

export const PLACEHOLDER_AGENT_NAME = "ShopMind";

export const PLACEHOLDER_USER_MESSAGE =
  "What are my top-selling products this week?";

export const PLACEHOLDER_AGENT_RESPONSE =
  "Based on your store data, your top three products this week are:\n\n1. **Wireless Earbuds Pro** — 142 units sold (+18% vs last week)\n2. **Organic Cotton Hoodie** — 98 units sold\n3. **Smart Water Bottle** — 76 units sold\n\nWireless Earbuds Pro is driving the most revenue at $12,780. Consider restocking — inventory is down to 23 units.";

export const PLACEHOLDER_THINKING_LABEL = "Analyzing your store data…";

export const PLACEHOLDER_SOURCES: AgentSource[] = [
  { id: "1", label: "Sales dashboard", url: "#" },
  { id: "2", label: "Inventory report", url: "#" },
  { id: "3", label: "Weekly trends", url: "#" },
];

export const PLACEHOLDER_TIMESTAMP = "Just now";
