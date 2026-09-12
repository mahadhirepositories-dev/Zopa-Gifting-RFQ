/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/multi-select/country-selection";
import { StateSelect } from "@/components/multi-select/state-selection";
import { CitySelect } from "@/components/multi-select/city-selection";
import { CustomPhoneInput } from "@/components/ui/phone-input";

interface CompanyIntroductionProps {
  register: any;
  watch: any;
  setValue: any;
  trigger: any;
  errors: any;
  contact: {
    countryCode: string;
    mobileNo: string;
  };
  setContact: React.Dispatch<
    React.SetStateAction<{
      countryCode: string;
      mobileNo: string;
    }>
  >;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoPreview: string | null;
  logoFileName: string | null;
  fieldsDisabled?: boolean;
}

export const CompanyIntroduction: React.FC<CompanyIntroductionProps> = ({
  register,
  watch,
  setValue,
  trigger,
  errors,
  contact,
  setContact,
  handleFileChange,
  logoPreview,
  logoFileName,
  fieldsDisabled,
}) => {
  const currentCountry = watch("companydetails.country") || "India";
  const currentState = watch("companydetails.state") || "";
  const currentCity = watch("companydetails.city") || "";

  const countryArray = currentCountry ? [currentCountry] : [];
  const stateArray = currentState ? [currentState] : [];
  const cityArray = currentCity ? [currentCity] : [];

  return (
    <section className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        1. Company Introduction
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="companyName">
            Company Name <span className="text-destructive text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            type="text"
            className={
              errors.companydetails?.companyName ? "border-red-500" : ""
            }
            disabled={fieldsDisabled}
            {...register("companydetails.companyName", {
              required: true,
            })}
          />

          {errors.companydetails?.companyName && (
            <span className="text-red-500 text-sm">
              Company name is required
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="address">
            Address Line 1 <span className="text-destructive text-red-500">*</span>
          </Label>
          <Input
            id="address"
            type="text"
            className={
              errors.companydetails?.addressLine1 ? "border-red-500" : ""
            }
            disabled={fieldsDisabled}
            {...register("companydetails.addressLine1", {
              required: true,
            })}
          />
          {errors.companydetails?.addressLine1 && (
            <span className="text-red-500 text-sm">
              Address Line 1 is required
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            type="text"
            disabled={fieldsDisabled}
            {...register("companydetails.addressLine2")}
          />
        </div>
        <div className="space-y-1">
          <CountrySelect
            value={countryArray}
            onChange={(val) => {
              const selected = val[val.length - 1] || "";
              setValue("companydetails.country", selected, {
                shouldValidate: true,
              });
              setValue("companydetails.state", "");
              setValue("companydetails.city", "");
            }}
            onBlur={() => trigger("companydetails.country")}
            error={errors.companydetails?.country?.message}
            required={true}
            disabled={fieldsDisabled}
          />
        </div>

        <div className="space-y-1">
          <StateSelect
            countryNames={countryArray}
            value={stateArray}
            onChange={(val) => {
              const selected = val[val.length - 1] || "";
              setValue("companydetails.state", selected, {
                shouldValidate: true,
              });
              setValue("companydetails.city", "");
            }}
            onBlur={() => trigger("companydetails.state")}
            error={errors.companydetails?.state?.message}
            required={true}
            disabled={fieldsDisabled}
          />
        </div>

        <div className="space-y-1">
          <CitySelect
            countryNames={countryArray}
            stateNames={stateArray}
            value={cityArray}
            onChange={(val) => {
              const selected = val[val.length - 1] || "";
              setValue("companydetails.city", selected, {
                shouldValidate: true,
              });
            }}
            onBlur={() => trigger("companydetails.city")}
            error={errors.companydetails?.city?.message}
            required={true}
            disabled={fieldsDisabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="postalCode">
            Postal Code <span className="text-destructive text-red-500">*</span>
          </Label>
          <Input
            id="postalCode"
            type="text"
            className={
              errors.companydetails?.postalCode ? "border-red-500" : ""
            }
            disabled={fieldsDisabled}
            {...register("companydetails.postalCode", {
              required: "Postal code is required",
              pattern: {
                value: /^\d{6}$/,
                message: "Postal code must be exactly 6 digits",
              },
            })}
          />
          {errors.companydetails?.postalCode && (
            <span className="text-red-500 text-sm">
              {errors.companydetails.postalCode.message}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <CustomPhoneInput
            value={contact.mobileNo || ""}
            onChange={(value) => {
              setValue("companydetails.phone", value, {
                shouldValidate: true,
              });
              setContact((prev) => ({ ...prev, mobileNo: value }));
            }}
            countryCode={contact.countryCode}
            onCountryChange={(code) => {
              setContact((prev) => ({ ...prev, countryCode: code }));
            }}
            error={errors.companydetails?.phone?.message}
            required={true}
            disabled={fieldsDisabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">
            Email <span className="text-destructive text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            className={errors.companydetails?.email ? "border-red-500" : ""}
            disabled={fieldsDisabled}
            {...register("companydetails.email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.companydetails?.email && (
            <span className="text-red-500 text-sm">
              {errors.companydetails.email.message}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="businessType">
            Business type <span className="text-destructive text-red-500">*</span>
          </Label>
          <Input
            id="businessType"
            type="text"
            className={
              errors.companydetails?.businessType ? "border-red-500" : ""
            }
            disabled={fieldsDisabled}
            {...register("companydetails.businessType", {
              required: true,
            })}
          />
          {errors.companydetails?.businessType && (
            <span className="text-red-500 text-sm">
              Business type is required
            </span>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="logoUpload">Upload Logo</Label>
          <Input
            id="logoUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={fieldsDisabled}
          />
          {logoPreview && (
            <div className="mt-2">
              <p className="text-sm text-green-600">
                {logoFileName
                  ? `File: ${logoFileName}`
                  : "Logo uploaded successfully"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
