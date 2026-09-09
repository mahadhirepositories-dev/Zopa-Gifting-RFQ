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

//************---------------- BOQ -----------------*********** */
