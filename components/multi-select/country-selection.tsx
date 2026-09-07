// components/multi-select/country-selection.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Country } from "country-state-city";
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

interface CountrySelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  required?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  error,
  disabled,
  onBlur,
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const countries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() => {
    if (!searchValue) return countries;
    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [countries, searchValue]);

  const selectedCountries = useMemo(
    () => countries.filter((c) => value.includes(c.name)),
    [countries, value],
  );

  const toggleCountry = useCallback(
    (countryName: string) => {
      if (value.includes(countryName)) {
        onChange(value.filter((v) => v !== countryName));
      } else {
        onChange([...value, countryName]);
      }
    },
    [value, onChange],
  );

  const removeCountry = useCallback(
    (countryName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== countryName));
    },
    [value, onChange],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearchValue("");
        onBlur?.();
      }
    },
    [onBlur],
  );

  return (
    <div className="flex-1 space-y-1.5">
      <Label className="text-xs font-medium">
        Country {required && <span className="text-rose-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full min-h-[36px] h-auto px-3 py-1 font-normal rounded-xl border border-slate-300 bg-white text-xs sm:text-sm items-center justify-between text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors shadow-none",
              error && "border-rose-400 bg-rose-50/20",
            )}
            disabled={disabled}
          >
            {selectedCountries.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-0.5">
                {selectedCountries.map((country) => (
                  <Badge
                    key={country.isoCode}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium py-0.5"
                  >
                    {country.flag} {country.name}
                    <span
                      role="button"
                      onClick={(e) => removeCountry(country.name, e)}
                      className="ml-1 rounded-full hover:bg-blue-200/50 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 text-xs sm:text-sm">
                Select country...
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search country..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.isoCode}
                    value={country.name}
                    onSelect={() => toggleCountry(country.name)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(country.name)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="flex items-center">
                      {country.flag} {country.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
