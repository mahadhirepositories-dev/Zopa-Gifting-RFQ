import { db } from "@/db";
import { sql } from "drizzle-orm";

let approvalTablesCreated = false;

export async function ensureApprovalTablesExist() {
  if (approvalTablesCreated) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "rfq_approvals" (
        "id" SERIAL PRIMARY KEY,
        "rfq_id" TEXT NOT NULL,
        "status" VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
        "approval_level" VARCHAR(20) NOT NULL DEFAULT 'level1',
        "level1_approver_email" VARCHAR(255),
        "level2_approver_email" VARCHAR(255),
        "level1_status" VARCHAR(50) DEFAULT 'pending',
        "level2_status" VARCHAR(50) DEFAULT 'pending',
        "buyer_comments" TEXT,
        "level1_comments" TEXT,
        "level2_comments" TEXT,
        "level1_reviewed_at" TIMESTAMP,
        "level2_reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "rfq_approval_recommendations" (
        "id" SERIAL PRIMARY KEY,
        "rfq_id" TEXT NOT NULL,
        "approval_id" INTEGER REFERENCES "rfq_approvals"("id") ON DELETE CASCADE,
        "vendor_response_id" TEXT NOT NULL,
        "reason" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'recommended',
        "recommender_role" VARCHAR(50) NOT NULL DEFAULT 'buyer',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    approvalTablesCreated = true;
  } catch (err) {
    console.error("Error ensuring approval tables exist:", err);
  }
}
