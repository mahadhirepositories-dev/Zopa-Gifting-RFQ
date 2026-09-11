import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface SearchableDropdownProps {
  id: string;
  name: string;
  label: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  hasError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onRemoveOption?: (optionValue: string) => void;
  isOptionRemovable?: (option: string) => boolean;
  onTabOut?: () => void;
}

const SearchableDropdown = forwardRef<
  { focus: () => void },
  SearchableDropdownProps
>(
  (
    {
      id,
      name,
      label,
      value,
      options,
      onChange,
      hasError = false,
      errorMessage = "",
      disabled = false,
      placeholder,
      className = "",
      onRemoveOption,
      isOptionRemovable = () => false,
      onTabOut,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selectControlRef = useRef<HTMLDivElement>(null);

    // Expose the focus method to the parent component via the ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        selectControlRef.current?.focus();
      },
    }));

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const createChangeEvent = (
      selectedValue: string,
    ): React.ChangeEvent<HTMLSelectElement> => {
      return {
        target: {
          id,
          name,
          value: selectedValue,
        },
        currentTarget: {} as EventTarget & HTMLSelectElement,
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: true,
        nativeEvent: {} as Event,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
        timeStamp: 0,
        type: "change",
      } as React.ChangeEvent<HTMLSelectElement>;
    };

    const handleOptionSelect = (selectedValue: string) => {
      onChange(createChangeEvent(selectedValue));
      setIsOpen(false);
      setSearchTerm("");
    };

    const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRemoveOption) {
        onRemoveOption(optionValue);
        if (value === optionValue) {
          onChange(createChangeEvent(""));
        }
      }
    };

    const handleBlur = (e: React.FocusEvent) => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node) && onTabOut) {
        onTabOut();
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative" ref={dropdownRef}>
          <div
            ref={selectControlRef}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input ring-offset-2 bg-gray-50 px-3 py-2 text-base ring-offset-background cursor-pointer transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              hasError && "border-red-500 ring-1  ring-red-500",
              disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
              className,
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onBlur={handleBlur}
            tabIndex={disabled ? -1 : 0}
          >
            <div className="truncate">
              {value || (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <svg
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                isOpen && "transform rotate-180",
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 animate-in fade-in-0 zoom-in-95">
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-gray-50 px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>

              <div className="max-h-[180px] overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  <ul className="py-1">
                    {filteredOptions.map((option, index) => (
                      <li
                        key={index}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-blue-50 hover:text-blue-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                          option === value &&
                            "bg-blue-50 text-blue-900 font-medium",
                        )}
                        onClick={() => handleOptionSelect(option)}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="truncate">{option}</div>
                          {onRemoveOption && isOptionRemovable(option) && (
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 ml-2 p-1 rounded-sm hover:bg-red-50"
                              onClick={(e) => handleRemoveOption(option, e)}
                              title="Remove option"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {hasError && errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}

        {/* Hidden select for form compatibility */}
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="sr-only"
          disabled={disabled}
          tabIndex={-1}
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  },
);

SearchableDropdown.displayName = "SearchableDropdown";

export default SearchableDropdown;
