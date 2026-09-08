/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, useSession } = authClient;
export const signOut = async (options?: any) => {
  // Clear RFP popup localStorage keys before signing out
  if (typeof window !== "undefined") {
    const keysToRemove: string[] = [];

    // Find all RFP popup keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("rfp-popup-shown-")) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${keysToRemove.length} RFP popup notifications`);
  }

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      console.log("[LOGOUT] Server-side session invalidated:", data);
    } else {
      console.warn(
        "[LOGOUT] Server-side invalidation failed, continuing with client-side logout",
      );
    }
  } catch (error) {
    console.warn("[LOGOUT] Server-side invalidation error:", error);
  }

  return await authClient.signOut(options);
};
