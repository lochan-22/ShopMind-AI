import React from "react";

type ActivityStatus = "active" | "waiting" | "done";

interface ActivityItem {
  icon: string;
  title: string;
  description: string;
  status: ActivityStatus;
}

const activities: ActivityItem[] = [
  {
    icon: "🎤",
    title: "Listening...",
    description: "Capturing your voice or text input.",
    status: "active",
  },
  {
    icon: "🧠",
    title: "Understanding your request...",
    description: "Extracting intent, products, brands, and price range.",
    status: "waiting",
  },
  {
    icon: "🔍",
    title: "Searching products...",
    description: "Querying catalogues for the best matches.",
    status: "waiting",
  },
  {
    icon: "⚖️",
    title: "Comparing products...",
    description: "Ranking options by relevance, price, and reviews.",
    status: "waiting",
  },
  {
    icon: "🛒",
    title: "Adding best option to cart...",
    description: "Navigating and placing the selected item automatically.",
    status: "waiting",
  },
  {
    icon: "✅",
    title: "Task completed.",
    description: "Your cart is ready. Please review before checkout.",
    status: "waiting",
  },
];

/* ── Status pill ── */
const StatusPill: React.FC<{ status: ActivityStatus }> = ({ status }) => {
  const map: Record<ActivityStatus, { label: string; classes: string; dot: string }> = {
    active: {
      label: "Active",
      classes: "bg-indigo-50 text-indigo-600 border-indigo-100",
      dot: "bg-indigo-400 animate-pulse",
    },
    waiting: {
      label: "Waiting",
      classes: "bg-gray-50 text-gray-400 border-gray-100",
      dot: "bg-gray-300",
    },
    done: {
      label: "Done",
      classes: "bg-emerald-50 text-emerald-600 border-emerald-100",
      dot: "bg-emerald-400",
    },
  };

  const { label, classes, dot } = map[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

/* ── Single timeline card ── */
const ActivityCard: React.FC<ActivityItem & { isLast: boolean }> = ({
  icon,
  title,
  description,
  status,
  isLast,
}) => {
  const isActive = status === "active";
  const isWaiting = status === "waiting";

  return (
    <div className="flex gap-4">
      {/* Left spine */}
      <div className="flex flex-col items-center">
        {/* Icon bubble */}
        <div
          className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg transition-all duration-300
            ${isActive
              ? "border-indigo-100 bg-indigo-50 shadow-sm shadow-indigo-100"
              : isWaiting
              ? "border-gray-100 bg-gray-50"
              : "border-emerald-100 bg-emerald-50"
            }`}
        >
          <span role="img" aria-label={title}>{icon}</span>

          {/* Active ring pulse */}
          {isActive && (
            <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-300 ring-offset-1 animate-ping opacity-30" />
          )}
        </div>

        {/* Connector */}
        {!isLast && (
          <div
            aria-hidden="true"
            className="mt-1 w-px flex-1 min-h-[1.5rem]"
            style={{
              background: isActive
                ? "linear-gradient(to bottom, #a5b4fc, #e9d5ff)"
                : "linear-gradient(to bottom, #e5e7eb, #f3f4f6)",
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`group mb-3 flex-1 rounded-2xl border p-4 transition-all duration-300
          ${isActive
            ? "border-indigo-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
            : "border-gray-100 bg-white/60 hover:bg-white hover:border-gray-200 hover:shadow-sm hover:-translate-y-0.5"
          }`}
        style={
          isActive
            ? {
                background:
                  "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(238,242,255,0.5) 100%)",
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <p
              className={`text-[13.5px] font-semibold leading-snug tracking-tight
                ${isActive ? "text-gray-900" : "text-gray-400"}`}
            >
              {title}
            </p>
            <p
              className={`text-[12px] leading-relaxed
                ${isActive ? "text-gray-500" : "text-gray-300"}`}
            >
              {description}
            </p>
          </div>
          <div className="flex-shrink-0 pt-0.5">
            <StatusPill status={status} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Agent panel header badge ── */
const AgentStatusBadge: React.FC = () => (
  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-600">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
    Ready
  </div>
);

/* ── Root component ── */
const AgentPanel: React.FC = () => (
  <section className="w-full px-6 py-24">
    <div className="mx-auto max-w-2xl">

      {/* Outer glass card */}
      <div
        className="rounded-3xl border border-gray-100 p-6 shadow-sm"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,248,252,0.8) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Panel header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold tracking-tight text-gray-900 leading-none">
                ShopMind AI Agent
              </p>
              <p className="mt-0.5 text-[11.5px] text-gray-400 leading-none">
                Activity log
              </p>
            </div>
          </div>
          <AgentStatusBadge />
        </div>

        {/* Divider */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

        {/* Timeline */}
        <div className="flex flex-col">
          {activities.map((item, i) => (
            <ActivityCard
              key={item.title}
              {...item}
              isLast={i === activities.length - 1}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-2.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0 text-gray-400"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[11.5px] text-gray-400 leading-relaxed">
            The agent acts autonomously. You confirm before any purchase is made.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default AgentPanel;