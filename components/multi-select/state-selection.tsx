// components/multi-select/state-selection.tsx

import React, { useMemo, useState, useCallback } from "react";
import { State, Country } from "country-state-city";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StateOption {
  name: string;
  isoCode: string;
  countryIsoCode: string;
  countryName: string;
}

interface CountryGroup {
  countryName: string;
  countryIsoCode: string;
  states: StateOption[];
}

interface StateSelectProps {
  countryNames: string[]; // one or more selected countries
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  required?: boolean;
}

export const StateSelect: React.FC<StateSelectProps> = ({
  countryNames,
  value,
  onChange,
  error,
  disabled,
  onBlur,
  required = false,
}) => {
  const [open, setOpen] = useState(false);

  // Group states by their parent country, preserving country selection order
  const groupedStates: CountryGroup[] = useMemo(() => {
    if (!countryNames.length) return [];

    const allCountries = Country.getAllCountries();

    return countryNames
      .map((countryName) => {
        const country = allCountries.find(
          (c) => c.name.toLowerCase() === countryName.toLowerCase(),
        );
        if (!country) return null;

        const states: StateOption[] = State.getStatesOfCountry(
          country.isoCode,
        ).map((s) => ({
          name: s.name,
          isoCode: s.isoCode,
          countryIsoCode: country.isoCode,
          countryName: country.name,
        }));

        return {
          countryName: country.name,
          countryIsoCode: country.isoCode,
          states,
        };
      })
      .filter((g): g is CountryGroup => g !== null && g.states.length > 0);
  }, [countryNames]);

  // Flat list, only used for looking up selected badges
  const allStates = useMemo(
    () => groupedStates.flatMap((g) => g.states),
    [groupedStates],
  );

  const selectedStates = useMemo(
    () => allStates.filter((s) => value.includes(s.name)),
    [allStates, value],
  );

  const toggleState = useCallback(
    (stateName: string) => {
      if (value.includes(stateName)) {
        onChange(value.filter((v) => v !== stateName));
      } else {
        onChange([...value, stateName]);
      }
    },
    [value, onChange],
  );

  const removeState = useCallback(
    (stateName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== stateName));
    },
    [value, onChange],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) onBlur?.();
    },
    [onBlur],
  );

  const showCountryOnBadge = countryNames.length > 1;
  const hasStates = groupedStates.length > 0;

  return (
    <div className="flex-1 space-y-1.5">
      <Label className="text-xs font-medium">
        State {required && <span className="text-rose-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full min-h-[36px] h-auto px-3 py-1 font-normal rounded-xl border border-slate-300 bg-white text-xs sm:text-sm items-center justify-between text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors shadow-none [&_svg]:pointer-events-auto",
              error && "border-rose-400 bg-rose-50/20",
            )}
            disabled={disabled || countryNames.length === 0 || !hasStates}
          >
            {selectedStates.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-0.5">
                {selectedStates.map((state) => (
                  <Badge
                    key={`${state.countryIsoCode}-${state.isoCode}`}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium py-0.5"
                  >
                    {showCountryOnBadge
                      ? `${state.name} (${state.countryName})`
                      : state.name}
                    <span
                      role="button"
                      onClick={(e) => removeState(state.name, e)}
                      className="ml-1 rounded-full hover:bg-blue-200/50 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 text-xs sm:text-sm">
                Select state...
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search state..." />
            <CommandList className="max-h-72 overflow-auto">
              <CommandEmpty>
                {!hasStates
                  ? "No states available for selected countries."
                  : "No state found."}
              </CommandEmpty>
              {/* One CommandGroup per country — this is what keeps
                  India's states clustered together, Nigeria's separate, etc. */}
              {groupedStates.map((group) => (
                <CommandGroup
                  key={group.countryIsoCode}
                  heading={group.countryName}
                >
                  {group.states.map((state) => (
                    <CommandItem
                      key={`${state.countryIsoCode}-${state.isoCode}`}
                      value={`${state.name} ${state.countryName}`}
                      onSelect={() => toggleState(state.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(state.name)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {state.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
