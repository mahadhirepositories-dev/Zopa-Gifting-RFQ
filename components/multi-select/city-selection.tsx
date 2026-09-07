// components/\multi-select/city-selection.tsx
"use client";

import React, { useMemo, useState, useCallback } from "react";
import { City, Country, State } from "country-state-city";
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

interface CityOption {
  name: string;
  stateName: string;
  countryName: string;
  key: string;
}

interface StateGroup {
  stateName: string;
  stateIsoCode: string;
  countryName: string;
  countryIsoCode: string;
  cities: CityOption[];
}

interface CitySelectProps {
  countryNames: string[];
  stateNames: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  required?: boolean;
}

export const CitySelect: React.FC<CitySelectProps> = ({
  countryNames,
  stateNames,
  value,
  onChange,
  error,
  disabled,
  onBlur,
  required = false,
}) => {
  const [open, setOpen] = useState(false);

  // Group cities by state, and states stay ordered by which country they
  // belong to (in countryNames selection order) — mirrors:
  // India > Tamil Nadu > Chennai/Coimbatore/Madurai, Karnataka > ...
  const groupedCities: StateGroup[] = useMemo(() => {
    if (!countryNames.length || !stateNames.length) return [];

    const allCountries = Country.getAllCountries();
    const groups: StateGroup[] = [];

    countryNames.forEach((countryName) => {
      const country = allCountries.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase(),
      );
      if (!country) return;

      const countryStates = State.getStatesOfCountry(country.isoCode);

      stateNames.forEach((stateName) => {
        const state = countryStates.find(
          (s) => s.name.toLowerCase() === stateName.toLowerCase(),
        );
        if (!state) return; // this state doesn't belong to this country — skip

        const stateCities = City.getCitiesOfState(
          country.isoCode,
          state.isoCode,
        );
        if (stateCities.length === 0) return;

        groups.push({
          stateName: state.name,
          stateIsoCode: state.isoCode,
          countryName: country.name,
          countryIsoCode: country.isoCode,
          cities: stateCities.map((city) => ({
            name: city.name,
            stateName: state.name,
            countryName: country.name,
            key: `${country.isoCode}-${state.isoCode}-${city.name}`,
          })),
        });
      });
    });

    return groups;
  }, [countryNames, stateNames]);

  const allCities = useMemo(
    () => groupedCities.flatMap((g) => g.cities),
    [groupedCities],
  );

  const selectedCities = useMemo(
    () => allCities.filter((c) => value.includes(c.name)),
    [allCities, value],
  );

  const toggleCity = useCallback(
    (cityName: string) => {
      if (value.includes(cityName)) {
        onChange(value.filter((v) => v !== cityName));
      } else {
        onChange([...value, cityName]);
      }
    },
    [value, onChange],
  );

  const removeCity = useCallback(
    (cityName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== cityName));
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

  const showLocationSuffix = countryNames.length > 1 || stateNames.length > 1;
  const hasCities = groupedCities.length > 0;

  // Group heading shows "Country — State" when multiple countries are
  // selected, otherwise just the state name (since country is obvious).
  const headingFor = (group: StateGroup) =>
    countryNames.length > 1
      ? `${group.countryName} — ${group.stateName}`
      : group.stateName;

  return (
    <div className="flex-1 space-y-1.5">
      <Label className="text-xs font-medium">
        City {required && <span className="text-rose-500">*</span>}
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
            disabled={
              disabled ||
              !countryNames.length ||
              !stateNames.length ||
              !hasCities
            }
          >
            {selectedCities.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-0.5">
                {selectedCities.map((city) => (
                  <Badge
                    key={city.key}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium py-0.5"
                  >
                    {showLocationSuffix
                      ? `${city.name}, ${city.stateName}`
                      : city.name}
                    <span
                      role="button"
                      onClick={(e) => removeCity(city.name, e)}
                      className="ml-1 rounded-full hover:bg-blue-200/50 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 text-xs sm:text-sm">
                Select city...
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search city..." />
            <CommandList className="max-h-72 overflow-auto">
              <CommandEmpty>
                {!hasCities
                  ? "No cities available for selected states."
                  : "No city found."}
              </CommandEmpty>
              {/* One CommandGroup per state — cities cluster under their
                  own state, and states stay ordered under their country. */}
              {groupedCities.map((group) => (
                <CommandGroup
                  key={`${group.countryIsoCode}-${group.stateIsoCode}`}
                  heading={headingFor(group)}
                >
                  {group.cities.map((city) => (
                    <CommandItem
                      key={city.key}
                      value={`${city.name} ${city.stateName} ${city.countryName}`}
                      onSelect={() => toggleCity(city.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(city.name)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {city.name}
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
