/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Checks if an approval request has a pending revision requested for/by the buyer.
 */
export function isBuyerRevisionPending(currentApproval?: any): boolean {
  if (!currentApproval) return false;
  return (
    currentApproval.status === "revision_requested" ||
    currentApproval.status === "revision_pending" ||
    currentApproval.level1Status === "revision_requested" ||
    currentApproval.level2Status === "revision_requested"
  );
}
