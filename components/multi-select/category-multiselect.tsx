// components/multi-select-optimized.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CommandSeparator,
} from "@/components/ui/command";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 hover:bg-blue-500 text-white font-medium border-gray-200",
        secondary:
          "border-gray-200 bg-secondary text-white hover:bg-secondary/80",
        destructive:
          "border-gray-200 bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Virtual scrolling hook
const useVirtualList = (
  items: any[],
  containerHeight: number,
  itemHeight: number,
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length,
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

interface MultiSelectProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    latitude?: string;
    longitude?: string;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
  onInputChange?: (searchText: string) => void;
  priorityOptions?: string[];
  enableVirtualScrolling?: boolean;
  searchDebounceMs?: number;
  showSelectAll?: boolean;
  enableAddNew?: boolean;
  onAddNewOption?: (newOption: string) => void;
  searchPlaceholder?: string;
}

export const MultiSelectOptimized = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      className,
      onInputChange,
      priorityOptions = [],
      enableVirtualScrolling = true,
      searchDebounceMs = 300,
      showSelectAll = true,
      enableAddNew = false,
      onAddNewOption,
      searchPlaceholder = "Search...",
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
    const [triggerWidth, setTriggerWidth] = React.useState<number>(0);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.offsetWidth);
      }
    }, [isPopoverOpen]);

    // Debounce search term
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, searchDebounceMs);

      return () => clearTimeout(timer);
    }, [searchTerm, searchDebounceMs]);

    const isSearching = searchTerm !== debouncedSearchTerm;

    // Optimized filtering with priority options
    const filteredOptions = React.useMemo(() => {
      if (!debouncedSearchTerm) {
        const priorityOpts = options.filter((opt) =>
          priorityOptions.includes(opt.label),
        );
        const regularOpts = options.filter(
          (opt) => !priorityOptions.includes(opt.label),
        );
        return [...priorityOpts, ...regularOpts];
      }

      const searchLower = debouncedSearchTerm.toLowerCase();
      const filtered = options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchLower) ||
          option.value.toLowerCase().includes(searchLower),
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

    // Virtual scrolling setup
    const containerHeight = 300;
    const itemHeight = 35;
    const virtualList = useVirtualList(
      filteredOptions,
      containerHeight,
      itemHeight,
    );

    const handleInputChange = (value: string) => {
      setSearchTerm(value);
      onInputChange?.(value);
    };

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === filteredOptions.length) {
        handleClear();
      } else {
        const allValues = filteredOptions.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    // Check if we should show "Add new" option
    const showAddNew = React.useMemo(() => {
      return (
        enableAddNew &&
        onAddNewOption &&
        searchTerm.trim() !== "" &&
        !filteredOptions.some(
          (opt) => opt.value.toLowerCase() === searchTerm.trim().toLowerCase(),
        )
      );
    }, [enableAddNew, onAddNewOption, searchTerm, filteredOptions]);

    // Handle adding a new option
    const handleAddNewOption = () => {
      if (!onAddNewOption) return;

      const newOption = searchTerm.trim();
      if (newOption) {
        onAddNewOption(newOption);
        toggleOption(newOption);
        setSearchTerm("");
      }
    };

    // Helper function to get display label from value
    const getDisplayLabel = (value: string): string => {
      const option = options.find((o) => o.value === value);
      return option?.label || value.split("|")[0] || value;
    };

    // Render virtual scrolled options
    const renderVirtualOptions = () => {
      if (!enableVirtualScrolling || filteredOptions.length < 100) {
        return filteredOptions.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <CommandItem
              key={option.value}
              onSelect={() => toggleOption(option.value)}
              className="cursor-pointer"
            >
              <div
                className={cn(
                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "opacity-50 [&_svg]:invisible",
                )}
              >
                <CheckIcon className="h-4 w-4" />
              </div>
              <span>{option.label}</span>
            </CommandItem>
          );
        });
      }

      // Virtual scrolling for large lists
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
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                    style={{ height: itemHeight }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-blue-500 text-white border-blue-500"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
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
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref || triggerRef}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "capitalize flex w-full p-1 rounded-md border border-slate-200 min-h-10 h-auto items-center justify-between bg-gray-50 hover:bg-gray-50 [&_svg]:pointer-events-auto",
              className,
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const displayLabel = getDisplayLabel(value);
                    return (
                      <Badge
                        key={value}
                        className={cn(
                          isAnimating ? "animate-bounce" : "",
                          multiSelectVariants({ variant }),
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {displayLabel}
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer text-white/80 hover:text-white"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant }),
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </Badge>
                  )}
                </div>
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
          className="p-0 border border-slate-200 shadow-md bg-white rounded-lg"
          style={{ width: triggerWidth }}
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={isSearching ? "Searching..." : searchPlaceholder}
              onKeyDown={handleInputKeyDown}
              onValueChange={handleInputChange}
              value={searchTerm}
            />
            <CommandList className="[&>div]:overflow-hidden">
              {filteredOptions.length === 0 && !isSearching && !showAddNew && (
                <CommandEmpty>No options found.</CommandEmpty>
              )}

              {(showSelectAll || filteredOptions.length > 0 || showAddNew) && (
                <CommandGroup>
                  {showSelectAll && (
                    <CommandItem
                      key="all"
                      onSelect={toggleAll}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedValues.length === filteredOptions.length
                            ? "bg-blue-500 text-white border-blue-500"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>
                        (Select All
                        {filteredOptions.length < options.length
                          ? ` ${filteredOptions.length}`
                          : ""}
                        )
                      </span>
                    </CommandItem>
                  )}

                  {filteredOptions.length > 0 && renderVirtualOptions()}

                  {showAddNew && (
                    <CommandItem
                      onSelect={handleAddNewOption}
                      className="cursor-pointer text-green-600"
                    >
                      <span className="mr-2">+</span>
                      Add &quot;{searchTerm.trim()}&quot;
                    </CommandItem>
                  )}
                </CommandGroup>
              )}

              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear ({selectedValues.length})
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
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground",
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  },
);

MultiSelectOptimized.displayName = "MultiSelectOptimized";
