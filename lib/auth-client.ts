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
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();

      const cookiesToClear = [
        "zopa_user_email",
        "zopa_user_name",
        "zopa_user_mobile",
        "zopa_user_company",
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
      ];

      cookiesToClear.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      });
    } catch (e) {
      console.warn("Error clearing local storage:", e);
    }
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
