import { Audit, type InsertAudit, audits, User, InsertUser, users } from "@shared/schema";
import { Recommendation, WorkflowModule } from "@/lib/auditTypes";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Audit-related operations
  createAudit(auditData: any): Promise<Audit>;
  getAudit(id: number): Promise<Audit | undefined>;
  getAllAudits(): Promise<Audit[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Audit-related methods
  async createAudit(auditData: any): Promise<Audit> {
    try {
      // Insert the audit data into the database
      const [newAudit] = await db.insert(audits)
        .values({
          ...auditData,
          // Convert JSON objects to strings for database storage
          recommendations: JSON.stringify(auditData.recommendations),
          workflowRecommendations: auditData.workflowRecommendations 
            ? JSON.stringify(auditData.workflowRecommendations) 
            : null,
        })
        .returning();
      
      // Parse JSON strings back to objects
      return {
        ...newAudit,
        recommendations: JSON.parse(newAudit.recommendations as string),
        workflowRecommendations: newAudit.workflowRecommendations 
          ? JSON.parse(newAudit.workflowRecommendations as string) 
          : undefined,
      };
    } catch (error) {
      console.error("Error creating audit in database:", error);
      throw error;
    }
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    try {
      const [audit] = await db.select()
        .from(audits)
        .where(eq(audits.id, id));
      
      if (!audit) return undefined;
      
      // Parse JSON strings back to objects
      return {
        ...audit,
        recommendations: JSON.parse(audit.recommendations as string),
        workflowRecommendations: audit.workflowRecommendations 
          ? JSON.parse(audit.workflowRecommendations as string) 
          : undefined,
      };
    } catch (error) {
      console.error("Error getting audit from database:", error);
      return undefined;
    }
  }

  async getAllAudits(): Promise<Audit[]> {
    try {
      const allAudits = await db.select().from(audits);
      
      // Parse JSON strings back to objects for each audit
      return allAudits.map(audit => ({
        ...audit,
        recommendations: JSON.parse(audit.recommendations as string),
        workflowRecommendations: audit.workflowRecommendations 
          ? JSON.parse(audit.workflowRecommendations as string) 
          : undefined,
      }));
    } catch (error) {
      console.error("Error getting all audits from database:", error);
      return [];
    }
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
