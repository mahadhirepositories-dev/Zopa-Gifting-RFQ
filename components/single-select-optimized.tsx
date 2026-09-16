// components/single-select-optimized.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Virtual scrolling hook
const useVirtualList = (
  items: any[],
  containerHeight: number,
  itemHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight,
    setScrollTop,
  };
};

interface SingleSelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onInputChange?: (searchText: string) => void;
  priorityOptions?: string[];
  enableVirtualScrolling?: boolean;
  searchDebounceMs?: number;
}

export const SingleSelectOptimized = React.forwardRef<
  HTMLButtonElement,
  SingleSelectProps
>(
  (
    {
      options,
      onValueChange,
      defaultValue = "",
      placeholder = "Select option",
      className,
      onInputChange,
      priorityOptions = [],
      enableVirtualScrolling = true,
      searchDebounceMs = 300,
      ...props
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] =
      React.useState<string>(defaultValue);

    React.useEffect(() => {
      setSelectedValue(defaultValue);
    }, [defaultValue]);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
    const [isSearching, setIsSearching] = React.useState(false);
    const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    }, [isPopoverOpen]);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setIsSearching(false);
      }, searchDebounceMs);

      if (searchTerm !== debouncedSearchTerm) {
        setIsSearching(true);
      }

      return () => clearTimeout(timer);
    }, [searchTerm, searchDebounceMs, debouncedSearchTerm]);

    const filteredOptions = React.useMemo(() => {
      if (!debouncedSearchTerm) {
        const priorityOpts = options.filter((opt) =>
          priorityOptions.includes(opt.value)
        );
        const regularOpts = options.filter(
          (opt) => !priorityOptions.includes(opt.value)
        );
        return [...priorityOpts, ...regularOpts];
      }

      const searchLower = debouncedSearchTerm.toLowerCase();
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchLower) ||
          option.value.toLowerCase().includes(searchLower)
      );

      return filtered.sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();

        if (aLabel === searchLower) return -1;
        if (bLabel === searchLower) return 1;
        if (aLabel.startsWith(searchLower) && !bLabel.startsWith(searchLower))
          return -1;
        if (bLabel.startsWith(searchLower) && !aLabel.startsWith(searchLower))
          return 1;

        return aLabel.localeCompare(bLabel);
      });
    }, [options, debouncedSearchTerm, priorityOptions]);

    const containerHeight = 300;
    const itemHeight = 35;
    const virtualList = useVirtualList(
      filteredOptions,
      containerHeight,
      itemHeight
    );

    const handleInputChange = (value: string) => {
      setSearchTerm(value);
      onInputChange?.(value);
    };

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        setSelectedValue("");
        onValueChange("");
      }
    };

    const selectOption = (option: string) => {
      setSelectedValue(option);
      onValueChange(option);
      setIsPopoverOpen(false);
    };

    const handleClear = () => {
      setSelectedValue("");
      onValueChange("");
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const renderVirtualOptions = () => {
      if (!enableVirtualScrolling || filteredOptions.length < 100) {
        return filteredOptions.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <CommandItem
              key={option.value}
              onSelect={() => selectOption(option.value)}
              className="cursor-pointer"
            >
              <div
                className={cn(
                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "opacity-50 [&_svg]:invisible"
                )}
              >
                <CheckIcon className="h-4 w-4" />
              </div>
              {option.icon && (
                <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{option.label}</span>
            </CommandItem>
          );
        });
      }

      return (
        <div
          style={{ height: containerHeight }}
          className="overflow-auto"
          onScroll={(e) => virtualList.setScrollTop(e.currentTarget.scrollTop)}
        >
          <div
            style={{ height: virtualList.totalHeight, position: "relative" }}
          >
            <div style={{ transform: `translateY(${virtualList.offsetY}px)` }}>
              {virtualList.visibleItems.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => selectOption(option.value)}
                    className="cursor-pointer"
                    style={{ height: itemHeight }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref || triggerRef}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "capitalize flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-gray-50 hover:bg-gray-50 [&_svg]:pointer-events-auto",
              className
            )}
          >
            {selectedValue ? (
              <div className="flex justify-between items-center w-full">
                <div className="text-black">{selectedOption?.label}</div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: triggerWidth }}
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={isSearching ? "Searching..." : "Search cities..."}
              onKeyDown={handleInputKeyDown}
              onValueChange={handleInputChange}
              value={searchTerm}
            />
            <CommandList className="[&>div]:overflow-hidden">
              {filteredOptions.length === 0 && !isSearching && (
                <CommandEmpty>No cities found.</CommandEmpty>
              )}
              {filteredOptions.length > 0 && (
                <CommandGroup>{renderVirtualOptions()}</CommandGroup>
              )}
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValue && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

SingleSelectOptimized.displayName = "SingleSelectOptimized";
