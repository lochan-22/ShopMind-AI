import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/IconButton";
import type { ToastVariant } from "@/components/ui/types";
import { cn } from "@/utils/cn";

const variantClasses: Record<ToastVariant, string> = {
  default: "border-border bg-surface text-foreground",
  success: "border-green-200 bg-success-muted text-success",
  error: "border-red-200 bg-error-muted text-error",
  warning: "border-amber-200 bg-warning-muted text-warning",
  info: "border-blue-200 bg-info-muted text-info",
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <StatusIcon path="M20 6 9 17l-5-5" />,
  error: <StatusIcon path="M18 6 6 18M6 6l12 12" />,
  warning: <StatusIcon path="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  info: <StatusIcon path="M12 16v-4m0-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />,
};

function StatusIcon({ path }: { path: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export interface ToastProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = "default",
      title,
      description,
      action,
      onDismiss,
      dismissible = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const titleId = useId();
    const descriptionId = useId();
    const hasTitle = Boolean(title);
    const hasDescription = Boolean(description ?? children);
    const isAlert = variant === "error";

    return (
      <div
        ref={ref}
        role={isAlert ? "alert" : "status"}
        aria-live={isAlert ? "assertive" : "polite"}
        aria-atomic="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={cn(
          "toast animate-in slide-in-from-top fade-in duration-base",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {variantIcons[variant] && (
          <span className="toast-icon" aria-hidden="true">
            {variantIcons[variant]}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {title && (
            <p id={titleId} className="text-label font-medium text-inherit">
              {title}
            </p>
          )}
          {(description ?? children) && (
            <p
              id={descriptionId}
              className="text-body-sm text-inherit opacity-90"
            >
              {description ?? children}
            </p>
          )}
        </div>

        {action}

        {dismissible && onDismiss && (
          <IconButton
            aria-label="Dismiss notification"
            variant="ghost"
            size="sm"
            className="toast-dismiss"
            onClick={onDismiss}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </IconButton>
        )}
      </div>
    );
  },
);

Toast.displayName = "Toast";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

export interface ToastViewportProps extends HTMLAttributes<HTMLDivElement> {
  position?: ToastPosition;
}

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ position = "bottom-right", className, ...props }, ref) => (
    <div
      ref={ref}
      aria-label="Notifications"
      className={cn(
        "fixed z-[100] flex w-full max-w-sm flex-col gap-2 pointer-events-none",
        positionClasses[position],
        className,
      )}
      {...props}
    />
  ),
);

ToastViewport.displayName = "ToastViewport";

export interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

function createToastId() {
  toastCounter += 1;
  return `toast-${toastCounter}`;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  /** Default auto-dismiss duration in ms. Set to 0 to disable. */
  defaultDuration?: number;
  /** Maximum number of visible toasts. */
  limit?: number;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  defaultDuration = 5000,
  limit = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = createToastId();
      const duration = item.duration ?? defaultDuration;

      setToasts((current) => {
        const next = [{ ...item, id }, ...current];
        return next.slice(0, limit);
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, dismiss, limit],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <ToastViewport position={position}>
          {toasts.map((item) => (
            <Toast
              key={item.id}
              variant={item.variant}
              title={item.title}
              description={item.description}
              action={item.action}
              dismissible={item.dismissible}
              onDismiss={() => dismiss(item.id)}
              className="pointer-events-auto"
            />
          ))}
        </ToastViewport>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
