import type { ComponentSize } from "@/components/ui/types";

export type AgentRole = "user" | "agent";

export type VoiceButtonState = "idle" | "listening" | "processing";

export type AgentAnimationSize = Exclude<ComponentSize, "xs" | "xl">;

export interface AgentSource {
  id: string;
  label: string;
  url?: string;
}
