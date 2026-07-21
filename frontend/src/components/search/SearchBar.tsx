import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { MOCK_SEARCH_PLACEHOLDER } from "@/components/search/mock";
import type { SearchBarSize } from "@/components/search/types";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/utils/cn";

const sizeClasses: Record<SearchBarSize, string> = {
  sm: "search-bar-sm",
  md: "search-bar-md",
  lg: "search-bar-lg",
};

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: SearchBarSize;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showClear?: boolean;
  leftIcon?: ReactNode;
  rightAddon?: ReactNode;
  wrapperClassName?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      size = "md",
      value,
      defaultValue,
      onSearch,
      onClear,
      onChange,
      showClear = true,
      leftIcon,
      rightAddon,
      placeholder = MOCK_SEARCH_PLACEHOLDER,
      className,
      wrapperClassName,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? ""),
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value ?? "") : internalValue;
    const hasValue = currentValue.length > 0;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      onChange?.(event);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
      }
      onClear?.();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const query = String(formData.get("search") ?? "").trim();
      if (query) onSearch?.(query);
    };

    return (
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn("search-bar", sizeClasses[size], wrapperClassName)}
      >
        <label htmlFor={inputId} className="sr-only">
          Search
        </label>

        <span className="search-bar-icon" aria-hidden="true">
          {leftIcon ?? <SearchIcon />}
        </span>

        <input
          ref={ref}
          id={inputId}
          name="search"
          type="search"
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className={cn("search-bar-input", className)}
          {...props}
        />

        {showClear && hasValue && (
          <IconButton
            type="button"
            aria-label="Clear search"
            variant="ghost"
            size="sm"
            className="search-bar-clear"
            onClick={handleClear}
          >
            <ClearIcon />
          </IconButton>
        )}

        {rightAddon}
      </form>
    );
  },
);

SearchBar.displayName = "SearchBar";

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClearIcon() {
  return (
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
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
