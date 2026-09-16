import { z } from "zod";

export const contactFormSchema = z.object({
  companyName: z.string().min(2, "Company Name is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phoneCountryCode: z.string().default("+91"),
  phoneCountryFlag: z.string().default("🇮🇳"),
  phoneNumber: z.string().min(7, "Phone Number is required"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  selectedCountries: z.array(z.string()).optional().default([]),
  selectedStates: z.array(z.string()).optional().default([]),
  selectedCities: z.array(z.string()).optional().default([]),
  postalCode: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
