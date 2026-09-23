export const DISALLOWED_PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "yahoo.ca",
  "yahoo.com.au",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "outlook.com",
  "outlook.in",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "mail.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "gmx.com",
  "gmx.net",
  "rediffmail.com",
  "live.com",
  "msn.com",
  "zoho.com",
  "lycos.com",
  "inbox.com",
]);

export function isWorkEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase().trim();
  if (!domain) return false;
  return !DISALLOWED_PERSONAL_DOMAINS.has(domain);
}
