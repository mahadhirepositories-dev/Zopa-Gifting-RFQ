/* eslint-disable @typescript-eslint/no-explicit-any */
type LogContext = Record<string, any>;

/**
 * Lightweight, Edge-compatible logger for Next.js proxy / middleware.
 */
export const edgeLogger = {
  info: (context: LogContext | string, message?: string) => {
    if (typeof context === "string") {
      console.log(`[INFO] ${context}`);
    } else {
      console.log(`[INFO] ${message || ""}`, JSON.stringify(context));
    }
  },
  warn: (context: LogContext | string, message?: string) => {
    if (typeof context === "string") {
      console.warn(`[WARN] ${context}`);
    } else {
      console.warn(`[WARN] ${message || ""}`, JSON.stringify(context));
    }
  },
  error: (context: LogContext | string, message?: string) => {
    if (typeof context === "string") {
      console.error(`[ERROR] ${context}`);
    } else {
      console.error(`[ERROR] ${message || ""}`, JSON.stringify(context));
    }
  },
  debug: (context: LogContext | string, message?: string) => {
    if (process.env.NODE_ENV !== "production") {
      if (typeof context === "string") {
        console.debug(`[DEBUG] ${context}`);
      } else {
        console.debug(`[DEBUG] ${message || ""}`, JSON.stringify(context));
      }
    }
  },
};

export default edgeLogger;
