import { Audit, type InsertAudit } from "@shared/schema";
import { Recommendation } from "@/lib/auditTypes";

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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private audits: Map<number, Audit>;
  private userId: number;
  private auditId: number;

  constructor() {
    this.users = new Map();
    this.audits = new Map();
    this.userId = 1;
    this.auditId = 1;
  }

  // User-related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Audit-related methods
  async createAudit(auditData: any): Promise<Audit> {
    const id = this.auditId++;
    const createdAt = new Date().toISOString();
    
    // Format the audit with the generated ID and timestamp
    const audit: Audit = { 
      ...auditData, 
      id,
      createdAt
    };
    
    this.audits.set(id, audit);
    return audit;
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    return this.audits.get(id);
  }

  async getAllAudits(): Promise<Audit[]> {
    return Array.from(this.audits.values());
  }
}

export const storage = new MemStorage();
