/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RFPStatus {
  isSubmitted: boolean;
  exists: boolean;
  isNew?: boolean;
}

export const VALID_SECTIONS = [
  "category",
  "requirement",
  "scope",
  "boq",
  "evaluation",
  "financials",
  "generalTerms",
  "specialTerms",
  "documents",
  "vendors",
  "vendorcontacts",
  "dates",
  "preview",
  "working-on",
] as const;

export function validateSection(section?: string): boolean {
  if (!section) return false;
  return (VALID_SECTIONS as readonly string[]).includes(section as any);
}

export function getTargetSection({
  isLoggedIn,
  rfpStatus,
  requestedSection,
}: {
  isLoggedIn: boolean;
  rfpStatus: RFPStatus | null;
  requestedSection?: string;
}): string {
  if (validateSection(requestedSection)) {
    if (requestedSection === "company" && isLoggedIn) {
      return "category";
    }
    return requestedSection!;
  }
  if (rfpStatus?.isSubmitted) {
    return "vendorcontacts";
  }
  return "category";
}
