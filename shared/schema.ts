import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User entity
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit entity to store business audits
export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  subIndustry: text("sub_industry").default(""),
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
  // New metadata fields for tracking form submission type
  formType: text("form_type").default("standard"),
  templateId: text("template_id"),
  // Results fields
  strengths: text("strengths").array(),
  opportunities: text("opportunities").array(),
  recommendations: json("recommendations"),
  aiRecommendation: text("ai_recommendation"),
  workflowRecommendations: json("workflow_recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting a new audit
export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  strengths: true,
  opportunities: true,
  recommendations: true,
  aiRecommendation: true,
  workflowRecommendations: true,
  createdAt: true,
});

// Create user insert schema
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Audit = typeof audits.$inferSelect;

// Schema for recommendations structure
export const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// Schema for workflow module structure
export const workflowModuleSchema = z.object({
  name: z.string(),
  description: z.string(),
  integrationPoints: z.array(z.string()),
  benefits: z.array(z.string()),
  icon: z.string(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
export type WorkflowModule = z.infer<typeof workflowModuleSchema>;
