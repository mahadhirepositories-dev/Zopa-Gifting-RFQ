import { z } from "zod";

export const RFQBuyerRegisterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit number"),
  companyName: z.string().min(2, "Company name is required"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  agreeTerms: z.literal(true, {
    message: "You must accept the Terms of Service",
  }),
});

export type RFQBuyerRegisterInput = z.infer<typeof RFQBuyerRegisterSchema>;
