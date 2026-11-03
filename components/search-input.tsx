"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  /** Value from the parent; external changes overwrite the local text. */
  value?: string;
  /** Initial value when no `value` is passed. */
  defaultValue?: string;
  /** Fires after the user stops typing for `debounce` ms. */
  onSearch?: (value: string) => void;
  /** Debounce delay in ms. Defaults to 350. */
  debounce?: number;
};

export function SearchInput({
  className,
  value,
  defaultValue = "",
  onSearch,
  debounce = 350,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  const [currentValue, setCurrentValue] = React.useState(value ?? defaultValue);
  const [prevValue, setPrevValue] = React.useState(value);

  // Sync local text when the parent changes `value` (like passive useVModel).
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== undefined) setCurrentValue(value);
  }

  const debouncedSearch = useDebouncedCallback((next: string) => {
    onSearch?.(next);
  }, debounce);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setCurrentValue(next);
    debouncedSearch(next);
  }

  return (
    <InputGroup className={cn("w-full sm:max-w-xs", className)}>
      <InputGroupInput
        type="search"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
}
