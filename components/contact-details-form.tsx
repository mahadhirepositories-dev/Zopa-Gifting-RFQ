"use client";

import { useState } from "react";
import { contactFormSchema, ContactFormData } from "@/lib/validations/contact-schema";
import { CustomPhoneInput } from "@/components/ui/phone-input";
import { CountrySelect } from "@/components/multi-select/country-selection";
import { StateSelect } from "@/components/multi-select/state-selection";
import { CitySelect } from "@/components/multi-select/city-selection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";

interface ContactDetailsFormProps {
  onSubmitSuccess: (data: ContactFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ContactDetailsForm({
  onSubmitSuccess,
  isSubmitting = false,
}: ContactDetailsFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    companyName: "KG Corp",
    name: "Devipriya Venkatesan",
    email: "devipriyavenkatesan.v@gmail.com",
    phoneCountryCode: "+91",
    phoneCountryFlag: "🇮🇳",
    phoneNumber: "8521479630",
    addressLine1: "894, Sri Ram Colony, Jai Ram Puram",
    addressLine2: "Anna Nagar East",
    selectedCountries: ["India"],
    selectedStates: ["Tamil Nadu"],
    selectedCities: ["Chennai"],
    postalCode: "600014",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactFormData;
        if (field) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmitSuccess(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Form Title */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Contact Details</h2>
        </div>

        {/* 2-Column Grid Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* 1. Company Name */}
          <div>
            <Label className="text-xs font-bold text-slate-700">
              Company Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={`bg-slate-50 border-slate-200 rounded-xl font-mono text-xs ${
                errors.companyName ? "border-rose-400 bg-rose-50/20" : ""
              }`}
            />
            {errors.companyName && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.companyName}</p>
            )}
          </div>

          {/* 2. Name */}
          <div>
            <Label className="text-xs font-bold text-slate-700">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`bg-slate-50 border-slate-200 rounded-xl font-mono text-xs ${
                errors.name ? "border-rose-400 bg-rose-50/20" : ""
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* 3. Email */}
          <div>
            <Label className="text-xs font-bold text-slate-700">
              Email <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`bg-slate-50 border-slate-200 rounded-xl font-mono text-xs ${
                errors.email ? "border-rose-400 bg-rose-50/20" : ""
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* 4. Phone Number */}
          <div>
            <CustomPhoneInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(num: string) => setFormData({ ...formData, phoneNumber: num })}
              error={errors.phoneNumber}
              required
            />
          </div>

          {/* 5. Address Line 1 */}
          <div>
            <Label className="text-xs font-bold text-slate-700">
              Address Line 1 <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter address line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className={`bg-slate-50 border-slate-200 rounded-xl font-mono text-xs ${
                errors.addressLine1 ? "border-rose-400 bg-rose-50/20" : ""
              }`}
            />
            {errors.addressLine1 && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.addressLine1}</p>
            )}
          </div>

          {/* 6. Address Line 2 */}
          <div>
            <Label className="text-xs font-bold text-slate-700">Address Line 2</Label>
            <Input
              type="text"
              placeholder="Enter address line 2"
              value={formData.addressLine2 || ""}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="bg-slate-50 border-slate-200 rounded-xl font-mono text-xs"
            />
          </div>

          {/* 7. Multilevel Country Selector (country-state-city) */}
          <CountrySelect
            value={formData.selectedCountries}
            onChange={(countries: string[]) =>
              setFormData({
                ...formData,
                selectedCountries: countries,
                selectedStates: [], // Reset states on country change
                selectedCities: [], // Reset cities on country change
              })
            }
            error={errors.selectedCountries}
            required
          />

          {/* 8. Multilevel State Selector (country-state-city) */}
          <StateSelect
            countryNames={formData.selectedCountries}
            value={formData.selectedStates}
            onChange={(states: string[]) =>
              setFormData({
                ...formData,
                selectedStates: states,
                selectedCities: [], // Reset cities on state change
              })
            }
            error={errors.selectedStates}
            required
          />

          {/* 9. Multilevel City Selector (country-state-city) */}
          <CitySelect
            countryNames={formData.selectedCountries}
            stateNames={formData.selectedStates}
            value={formData.selectedCities}
            onChange={(cities: string[]) => setFormData({ ...formData, selectedCities: cities })}
            error={errors.selectedCities}
          />

          {/* 10. Postal Code */}
          <div>
            <Label className="text-xs font-bold text-slate-700">
              Postal Code <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Enter postal code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className={`bg-slate-50 border-slate-200 rounded-xl font-mono text-xs ${
                errors.postalCode ? "border-rose-400 bg-rose-50/20" : ""
              }`}
            />
            {errors.postalCode && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.postalCode}</p>
            )}
          </div>

        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Generating Magic Link with Zod Validation...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                <span>Send Magic Link to Register</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

