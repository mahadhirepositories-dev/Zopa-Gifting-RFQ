/**
 * permissions-constants.ts
 *
 * This file defines all the resources and actions for the permission system.
 * It serves as a single source of truth for all permissions in the application.
 */

/**
 * Resource constants for the permission system
 */
export const RESOURCES = {
  // Organization resources (match Better Auth exactly)
  ORGANIZATION: "organization",
  MEMBER: "member",
  INVITATION: "invitation",
  TEAM: "team",

  // Admin resources (match Better Auth exactly)
  USER: "user",
  SESSION: "session",

  // Profile resources
  ENTHUSIAST_PROFILE: "enthusiast_profile",
  VENDOR_PROFILE: "vendor_profile",
  BUYER_PROFILE: "buyer_profile",
  AGENCY_PROFILE: "agency_profile",

  // Content resources
  POST: "post",
  COMMENT: "comment",

  // Business resources
  AD: "ad",
  CREDIT: "credit",
} as const;

/**
 * Actions for organization resources (match Better Auth exactly)
 */
export const ORGANIZATION_ACTIONS = {
  UPDATE: "update",
  DELETE: "delete",
} as const;

export const MEMBER_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export const INVITATION_ACTIONS = {
  CREATE: "create",
  CANCEL: "cancel",
} as const;

export const TEAM_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

/**
 * Actions for admin resources (match Better Auth exactly)
 */
export const USER_ACTIONS = {
  CREATE: "create",
  LIST: "list",
  SET_ROLE: "set-role",
  BAN: "ban",
  IMPERSONATE: "impersonate",
  DELETE: "delete",
} as const;

export const SESSION_ACTIONS = {
  LIST: "list",
  REVOKE: "revoke",
  DELETE: "delete",
} as const;

/**
 * Common actions that can be performed on custom resources
 */
export const ACTIONS = {
  // Standard CRUD actions
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",

  // Specialized actions
  VIEW: "view",
  EDIT: "edit",
  DOWNLOAD: "download",
  VERIFY: "verify",
  APPROVE: "approve",
  MODERATE: "moderate",
  GRANT: "grant",
  USE: "use",
  CANCEL: "cancel",
  INVITE: "invite",
  REVOKE: "revoke",
  LIST: "list",
} as const;

/**
 * Organization types in the system
 */
export const ORGANIZATION_TYPES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  BUYER: "buyer",
} as const;

/**
 * User types in the system
 */
export const USER_TYPES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  BUYER: "buyer",
  AGENCY: "agency",
  ENTHUSIAST: "enthusiast",
} as const;

/**
 * Role constants for different organization types
 */
export const ROLES = {
  // Better Auth default organization roles (REQUIRED)
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",

  // Admin organization roles
  SUPER_ADMIN: "super_admin",
  CONTENT_MODERATOR: "content_moderator",
  VENDOR_VALIDATOR: "vendor_validator",
  CREDIT_MANAGER: "credit_manager",

  // Vendor organization roles
  VENDOR_ADMIN: "vendor_admin",
  VENDOR_USER: "vendor_user",

  // Buyer organization roles
  BUYER_ADMIN: "buyer_admin",
  BUYER: "buyer",
  APPROVER: "approver",
} as const;

// Type exports for TypeScript type checking
export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
export type OrganizationType =
  (typeof ORGANIZATION_TYPES)[keyof typeof ORGANIZATION_TYPES];
export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
export type Role = (typeof ROLES)[keyof typeof ROLES];

// A permission is a combination of a resource and actions
export type Permission = {
  [resource in Resource]?: Action[];
};
