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
      // Process the data for database insertion
      const processedData = { ...auditData };
      
      // Ensure recommendations is properly converted to JSON
      if (processedData.recommendations) {
        processedData.recommendations = typeof processedData.recommendations === 'string' 
          ? processedData.recommendations 
          : JSON.stringify(processedData.recommendations);
      }
      
      // Ensure workflowRecommendations is properly converted to JSON
      if (processedData.workflowRecommendations) {
        processedData.workflowRecommendations = typeof processedData.workflowRecommendations === 'string'
          ? processedData.workflowRecommendations
          : JSON.stringify(processedData.workflowRecommendations);
      }
      
      // Insert the processed audit data into the database
      const [newAudit] = await db.insert(audits)
        .values(processedData)
        .returning();
      
      // Process data for return
      const result = { ...newAudit };
      
      // Convert recommendations back to object if stored as string
      if (typeof result.recommendations === 'string') {
        result.recommendations = JSON.parse(result.recommendations);
      }
      
      // Convert workflowRecommendations back to object if stored as string
      if (typeof result.workflowRecommendations === 'string') {
        result.workflowRecommendations = JSON.parse(result.workflowRecommendations);
      } else if (result.workflowRecommendations === null) {
        result.workflowRecommendations = undefined;
      }
      
      return result as Audit;
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
      
      // Process data for return
      const result = { ...audit };
      
      // Convert recommendations back to object if stored as string
      if (typeof result.recommendations === 'string') {
        result.recommendations = JSON.parse(result.recommendations);
      }
      
      // Convert workflowRecommendations back to object if stored as string
      if (typeof result.workflowRecommendations === 'string') {
        result.workflowRecommendations = JSON.parse(result.workflowRecommendations);
      } else if (result.workflowRecommendations === null) {
        result.workflowRecommendations = undefined;
      }
      
      return result as Audit;
    } catch (error) {
      console.error("Error getting audit from database:", error);
      return undefined;
    }
  }

  async getAllAudits(): Promise<Audit[]> {
    try {
      const allAudits = await db.select().from(audits);
      
      // Process each audit for return
      return allAudits.map(audit => {
        const result = { ...audit };
        
        // Convert recommendations back to object if stored as string
        if (typeof result.recommendations === 'string') {
          try {
            result.recommendations = JSON.parse(result.recommendations);
          } catch (e) {
            console.error("Error parsing recommendations JSON:", e);
            result.recommendations = [];
          }
        }
        
        // Convert workflowRecommendations back to object if stored as string
        if (typeof result.workflowRecommendations === 'string') {
          try {
            result.workflowRecommendations = JSON.parse(result.workflowRecommendations);
          } catch (e) {
            console.error("Error parsing workflowRecommendations JSON:", e);
            result.workflowRecommendations = undefined;
          }
        } else if (result.workflowRecommendations === null) {
          result.workflowRecommendations = undefined;
        }
        
        return result as Audit;
      });
    } catch (error) {
      console.error("Error getting all audits from database:", error);
      return [];
    }
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
