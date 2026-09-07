"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import "react-phone-number-input/style.css";
import * as flags from "country-flag-icons/react/3x2";
import {
  Country,
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";
import { validatePhoneNumber } from "@/lib/validations/phoneValidation";
import { Label } from "./label";

interface CustomPhoneInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
  countryCode?: string;
  onCountryChange?: (code: string) => void;
  className?: string;
  validateOnChange?: boolean;
  disabled?: boolean;
}

export const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  value,
  onChange,
  error,
  required = false,
  placeholder = "999 999 9999",
  label = "Phone Number",
  countryCode = "IN",
  onCountryChange,
  className = "",
  validateOnChange = false,
  disabled,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Tracks whether the field has been blurred at least once, so we can
  // show validation errors on blur even when validateOnChange is false.
  const [hasBlurred, setHasBlurred] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => {
    return getCountries().sort((a, b) => {
      const nameA = getCountryName(a);
      const nameB = getCountryName(b);
      return nameA.localeCompare(nameB);
    });
  }, []);

  const filteredCountries = countries.filter((country) =>
    getCountryName(country).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function getCountryName(country: Country): string {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(country) || country;
  }

  // Derived, not synced-via-effect: selectedCountry is just the (validated)
  // countryCode prop. Selecting a country calls onCountryChange, which the
  // parent uses to update countryCode, which flows straight back in here.
  const selectedCountry: Country = useMemo(() => {
    return countries.includes(countryCode as Country)
      ? (countryCode as Country)
      : "IN";
  }, [countryCode, countries]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(
          inputContainerRef.current &&
          inputContainerRef.current.contains(event.target as Node)
        )
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Derived validation error: recomputed on every render from value/country,
  // gated by whether live validation or a prior blur should surface it.
  const validationError = useMemo(() => {
    if (!value) return undefined;
    if (!validateOnChange && !hasBlurred) return undefined;
    const { isValid, errorMessage } = validatePhoneNumber(
      value,
      selectedCountry,
    );
    return isValid ? undefined : errorMessage;
  }, [value, selectedCountry, validateOnChange, hasBlurred]);

  const handleCountrySelect = (country: Country) => {
    const currentPhoneNumber = value ? value.replace(/^\+\d+\s?/, "") : "";
    setIsDropdownOpen(false);
    setSearchQuery("");
    const newCountryCode = `+${getCountryCallingCode(country)}`;
    const phoneNumber = `${newCountryCode} ${currentPhoneNumber}`.trim();
    onChange(phoneNumber);

    if (onCountryChange) {
      onCountryChange(country);
    }
  };

  const renderFlag = (country: Country) => {
    const Flag = flags[country];
    return Flag ? <Flag className="w-5 h-3" /> : null;
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    const phoneNumber =
      `+${getCountryCallingCode(selectedCountry)} ${numericValue}`.trim();
    onChange(phoneNumber);
  };

  const handlePhoneInputBlur = () => {
    setHasBlurred(true);
  };

  const displayError = error || validationError;

  return (
    <div className={`${className} space-y-1.5`}>
      {label && (
        <Label className="text-xs font-medium">
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
      )}

      <div className="relative" ref={inputContainerRef}>
        <div
          className={`flex h-9 w-full rounded-xl border bg-white text-xs sm:text-sm items-center transition-colors ${
            displayError ? "border-rose-400 bg-rose-50/20" : "border-slate-300"
          }`}
        >
          <div
            className="flex items-center pl-3 pr-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {renderFlag(selectedCountry)}
            <span className="ml-1.5">
              +{getCountryCallingCode(selectedCountry)}
            </span>
          </div>

          <input
            type="tel"
            value={value ? value.replace(/^\+\d+\s?/, "") : ""}
            onChange={handlePhoneInputChange}
            onBlur={handlePhoneInputBlur}
            placeholder={placeholder}
            className="flex-1 h-full py-1 px-2 focus:outline-none rounded-r-xl bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
            disabled={disabled}
          />
        </div>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-auto bg-white shadow-lg rounded-md border border-gray-300 overflow-auto"
            style={{ maxHeight: "300px" }}
          >
            <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full p-2 bg-gray-50 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              />
            </div>

            <div className="overflow-y-auto">
              {filteredCountries.length > 0 ? (
                <>
                  {filteredCountries.map((country) => (
                    <button
                      key={country}
                      type="button"
                      className={`w-full text-left px-3 py-2 hover:bg-blue-100  flex items-center ${
                        selectedCountry === country
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                      onClick={() => handleCountrySelect(country)}
                      disabled={disabled}
                    >
                      {renderFlag(country)}
                      <span className="ml-2">{getCountryName(country)}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {displayError && (
        <div className="text-red-500 text-sm mt-1">{displayError}</div>
      )}
    </div>
  );
};
