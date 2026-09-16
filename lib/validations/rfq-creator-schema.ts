import { z } from "zod";

//************---------------- Category -----------------*********** */

const toStringArray = (val: unknown): string[] => {
  if (Array.isArray(val)) {
    return val.filter(
      (v): v is string => typeof v === "string" && v.trim().length > 0,
    );
  }
  if (typeof val === "string" && val.trim().length > 0) {
    return [val];
  }
  return [];
};

export const categorySelectionSchema = z.object({
  category: z.preprocess(
    toStringArray,
    z.array(z.string()).min(1, "Select at least one gifting category"),
  ),
  subCategory: z.preprocess(toStringArray, z.array(z.string())),
  tags: z.preprocess(toStringArray, z.array(z.string())),
  serviceAreas: z.preprocess(
    toStringArray,
    z.array(z.string()).min(1, "Select at least one delivery/coverage area"),
  ),
});

export type CategorySelectionInput = z.input<typeof categorySelectionSchema>;
export type CategorySelection = z.output<typeof categorySelectionSchema>;

export type CategoryFieldErrors = Partial<
  Record<keyof CategorySelectionInput, string>
>;

export function getCategorySelectionErrors(
  value: unknown,
): CategoryFieldErrors {
  const result = categorySelectionSchema.safeParse(value);
  if (result.success) return {};

  const errors: CategoryFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CategorySelectionInput;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

//************---------------- About Requirements -----------------*********** */

export const requirementSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  purpose: z.string().trim().min(1, "Purpose is required"),
});

export type RequirementData = z.infer<typeof requirementSchema>;
export type RequirementFieldErrors = Partial<
  Record<keyof RequirementData, string>
>;

export function getRequirementErrors(value: unknown): RequirementFieldErrors {
  const result = requirementSchema.safeParse(value);
  if (result.success) return {};

  const errors: RequirementFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RequirementData;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

//************---------------- Scope of Work -----------------*********** */

export const scopeSchema = z.object({
  deliverables: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one deliverable"),
});

export type ScopeData = z.infer<typeof scopeSchema>;
export type ScopeFieldErrors = Partial<Record<keyof ScopeData, string>>;

export function getScopeErrors(value: unknown): ScopeFieldErrors {
  const result = scopeSchema.safeParse(value);
  if (result.success) return {};

  const errors: ScopeFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ScopeData;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

//************---------------- BOQ -----------------*********** */

const decimalRegex = /^\d+(\.\d+)?$/;

export const boqItemSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  uom: z.string().min(1, "Unit of Measure is required"),
  qty: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => decimalRegex.test(val), {
      message: "Quantity must be a positive number (e.g., 5 or 5.25)",
    }),
  targetPrice: z
    .string()
    .min(1, "Target price is required")
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message:
          "Target price must be a valid number (0 or positive, e.g., 0, 10.99)",
      },
    ),
  specification: z.string().min(1, "Specification is required"),
  remarks: z.string().optional(),
  isVisible: z.boolean().optional(),
  itemRef: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

export type BOQItemData = z.infer<typeof boqItemSchema>;


export const boqListSchema = z
  .array(boqItemSchema)
  .min(1, "Add at least one BOQ item before proceeding");

export type BOQListFieldErrors = { items?: string };

export function getBoqListErrors(value: unknown): BOQListFieldErrors {
  const result = boqListSchema.safeParse(value);
  if (result.success) return {};
  const message = result.error.issues[0]?.message ?? "Invalid BOQ list";
  return { items: message };
}
