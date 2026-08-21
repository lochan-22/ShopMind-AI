export const AgentStatus = ({ thinking }: { thinking: boolean }) => (
  <span className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${thinking ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${thinking ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
    {thinking ? "Thinking" : "Ready"}
  </span>
);
