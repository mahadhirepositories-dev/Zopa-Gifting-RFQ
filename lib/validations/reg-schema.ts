import { z } from "zod";
import type { Country } from "react-phone-number-input";
import { validatePhoneNumber } from "@/lib/validations/phoneValidation";

export const registerSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name is too long"),
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    email: z
      .string()
      .trim()
      .min(1, "Work email is required")
      .email("Enter a valid email address"),
    phoneNumber: z.string().trim().min(1, "Phone number is required"),
    // Not a form field — the calling-code the phone input is currently set
    // to, passed in alongside regForm at validation time so we can check
    // digit length/format per-country.
    phoneCountryCode: z.string().min(2).default("IN"),
    addressLine1: z
      .string()
      .trim()
      .min(3, "Address line 1 must be at least 3 characters")
      .max(200, "Address line 1 is too long"),
    addressLine2: z
      .string()
      .trim()
      .max(200, "Address line 2 is too long")
      .optional()
      .or(z.literal("")),
    country: z.array(z.string()).min(1, "Please select a country"),
    state: z.array(z.string()).min(1, "Please select a state"),
    city: z.array(z.string()).min(1, "Please select a city"),
    postalCode: z
      .string()
      .trim()
      .min(3, "Postal code must be at least 3 characters")
      .max(12, "Postal code is too long")
      .regex(/^[A-Za-z0-9\s-]+$/, "Postal code contains invalid characters"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  })
  .superRefine((data, ctx) => {
    const digits = data.phoneNumber.replace(/\D/g, "").length;
    if (digits === 0) {
      // Already caught by the min(1) check above — avoid a duplicate error.
      return;
    }

    const { isValid, errorMessage } = validatePhoneNumber(
      data.phoneNumber,
      data.phoneCountryCode as Country,
    );

    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: errorMessage || "Enter a valid phone number",
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
