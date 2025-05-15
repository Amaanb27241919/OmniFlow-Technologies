import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Audit entity to store business audits
export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  businessAge: text("business_age").notNull(),
  employees: text("employees").notNull(),
  monthlyRevenue: text("monthly_revenue").notNull(),
  profitMargin: text("profit_margin").notNull(),
  revenueIncreased: text("revenue_increased").notNull(),
  primaryExpense: text("primary_expense").notNull(),
  usesAutomation: text("uses_automation").notNull(),
  automationTools: text("automation_tools").array(),
  leadSource: text("lead_source").notNull(),
  tracksCAC: text("tracks_cac").notNull(),
  businessGoals: text("business_goals").array(),
  biggestChallenges: text("biggest_challenges").array(),
  additionalInfo: text("additional_info"),
  strengths: text("strengths").array(),
  opportunities: text("opportunities").array(),
  recommendations: json("recommendations"),
  aiRecommendation: text("ai_recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting a new audit
export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  strengths: true,
  opportunities: true,
  recommendations: true,
  aiRecommendation: true,
  createdAt: true,
});

export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Audit = typeof audits.$inferSelect;

// Schema for recommendations structure
export const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
