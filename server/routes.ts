import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertAuditSchema } from "@shared/schema";
import { generateAuditResults } from "./lib/auditLogic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new business audit
  app.post("/api/audits", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertAuditSchema.parse(req.body);
      
      // Generate audit results based on the input data (using async/await)
      const auditResults = await generateAuditResults(validatedData);
      
      // Store the audit in the database
      const audit = await storage.createAudit(auditResults);
      
      res.status(201).json(audit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        console.error("Error creating audit:", error);
        res.status(500).json({ message: "Failed to create audit" });
      }
    }
  });

  // Get a specific audit by ID
  app.get("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }

      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }

      res.json(audit);
    } catch (error) {
      console.error("Error fetching audit:", error);
      res.status(500).json({ message: "Failed to fetch audit" });
    }
  });

  // Get all audits
  app.get("/api/audits", async (req, res) => {
    try {
      const audits = await storage.getAllAudits();
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
