import { z } from "zod";

export const RFQBuyerRegisterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit number"),
  companyName: z.string().min(2, "Company name is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  country: z.string().min(1, "Select a country"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(1, "Select a city"),
  postalCode: z.string().regex(/^\d{4,10}$/, "Enter a valid postal code"),
  agreeTerms: z.literal(true, {
    message: "You must accept the Terms of Service",
  }),
});

export type RFQBuyerRegisterInput = z.infer<typeof RFQBuyerRegisterSchema>;
