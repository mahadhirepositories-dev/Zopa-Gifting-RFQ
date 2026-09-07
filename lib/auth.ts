import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  sessions,
  accounts,
  verifications,
  pendingRegistrations,
} from "@/db/schema";
import { EmailService } from "@/lib/email/email-service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: false, // Passwordless — Magic Link only
  },
  user: {
    additionalFields: {
      mobileNumber: { type: "string", required: false, input: false },
      companyName: { type: "string", required: false, input: false },
      addressLine1: { type: "string", required: false, input: false },
      addressLine2: { type: "string", required: false, input: false },
      country: { type: "string", required: false, input: false },
      state: { type: "string", required: false, input: false },
      city: { type: "string", required: false, input: false },
      postalCode: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Runs right before better-auth inserts a brand-new user (i.e. the
        // first time someone verifies a magic link for an email we haven't
        // seen before). We pull whatever the register form staged for this
        // email and merge it in, so the real `user` row is created complete
        // in one insert instead of a separate update afterwards.
        before: async (user) => {
          const [pending] = await db
            .select()
            .from(pendingRegistrations)
            .where(eq(pendingRegistrations.email, user.email))
            .limit(1);

          if (!pending) {
            return { data: user };
          }

          return {
            data: {
              ...user,
              name: user.name || pending.name,
              companyName: pending.companyName,
              mobileNumber: pending.mobileNumber,
              addressLine1: pending.addressLine1,
              addressLine2: pending.addressLine2 ?? null,
              country: pending.country,
              state: pending.state,
              city: pending.city,
              postalCode: pending.postalCode,
            },
          };
        },
        after: async (user) => {
          // Staging row has done its job — clean it up either way so it
          // doesn't linger or get reused by a future signup with the same
          // email.
          await db
            .delete(pendingRegistrations)
            .where(eq(pendingRegistrations.email, user.email));
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 600, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await EmailService.sendMagicLinkEmail({
          email,
          url,
        });
      },
    }),
  ],
});
