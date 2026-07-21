import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/utils/cn";

interface ModalContextValue {
  titleId: string;
  descriptionId: string;
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within Modal.");
  }
  return context;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const onClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const focusFirstElement = () => {
      const focusable =
        contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable?.[0]?.focus();
    };

    const frame = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !contentRef.current) return;

      const focusable = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return createPortal(
    <ModalContext.Provider value={{ titleId, descriptionId, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalOverlay
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
        <div
          ref={contentRef}
          className="relative z-10 w-full max-w-lg"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body,
  );
}

interface ModalOverlayProps {
  onClick?: () => void;
  "aria-hidden"?: boolean | "true" | "false";
}

function ModalOverlay({ onClick }: ModalOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-200 ease-out animate-in fade-in"
      onClick={onClick}
    />
  );
}

export type ModalContentProps = HTMLAttributes<HTMLDivElement>;

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => {
    const { titleId, descriptionId } = useModalContext();

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "surface-elevated w-full overflow-hidden outline-none",
          "animate-in fade-in zoom-in-95 duration-base",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ModalContent.displayName = "ModalContent";

export type ModalHeaderProps = HTMLAttributes<HTMLDivElement>;

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 p-card pb-0", className)}
      {...props}
    />
  ),
);

ModalHeader.displayName = "ModalHeader";

export type ModalTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => {
    const { titleId } = useModalContext();

    return (
      <h2
        ref={ref}
        id={titleId}
        className={cn("text-h4 font-semibold tracking-tight", className)}
        {...props}
      />
    );
  },
);

ModalTitle.displayName = "ModalTitle";

export type ModalDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, ...props }, ref) => {
  const { descriptionId } = useModalContext();

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn("text-body-sm text-muted", className)}
      {...props}
    />
  );
});

ModalDescription.displayName = "ModalDescription";

export type ModalBodyProps = HTMLAttributes<HTMLDivElement>;

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-card", className)} {...props} />
  ),
);

ModalBody.displayName = "ModalBody";

export type ModalFooterProps = HTMLAttributes<HTMLDivElement>;

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3 border-t border-border-subtle p-card pt-4",
        className,
      )}
      {...props}
    />
  ),
);

ModalFooter.displayName = "ModalFooter";

export type ModalCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function ModalClose({ className, onClick, ...props }: ModalCloseProps) {
  const { onClose } = useModalContext();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      onClose();
    }
  };

  return (
    <IconButton
      aria-label="Close dialog"
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleClick}
      {...props}
    >
      <CloseIcon />
    </IconButton>
  );
}

function CloseIcon() {
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
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
