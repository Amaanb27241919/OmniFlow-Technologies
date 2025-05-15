import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertAuditSchema } from "@shared/schema";
import { generateAuditResults } from "./lib/auditLogic";
import { notion, findDatabaseByTitle, addAuditToNotion } from "./lib/notion";
import { templateManager } from "./lib/templates/templateManager";
import { generateInsightTooltip, preGenerateTooltips } from "./lib/tooltipService";

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
      
      // If Notion integration is enabled, sync the audit data to Notion
      if (notion) {
        try {
          // Find the existing database or create one if needed
          const database = await findDatabaseByTitle("Business Audit Intakes");
          if (database) {
            // Add the audit data to Notion (asynchronously - don't await)
            // This way, Notion sync doesn't block the API response
            addAuditToNotion(audit, database.id)
              .then(success => {
                if (success) {
                  console.log(`Audit #${audit.id} for ${audit.businessName} synced to Notion successfully`);
                } else {
                  console.warn(`Failed to sync audit #${audit.id} to Notion`);
                }
              })
              .catch(err => {
                console.error("Error syncing audit to Notion:", err);
              });
          }
        } catch (notionError) {
          // Log the error but don't fail the request
          console.error("Error with Notion integration:", notionError);
        }
      }
      
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
  
  // Get Notion integration status
  app.get("/api/notion/status", (req, res) => {
    const notionEnabled = !!notion;
    
    res.json({
      enabled: notionEnabled,
      message: notionEnabled 
        ? "Notion integration is active and ready to sync audit data" 
        : "Notion integration is not enabled. Add NOTION_INTEGRATION_SECRET and NOTION_PAGE_URL to enable it."
    });
  });
  
  // Templates API endpoints
  
  // Get all available templates
  app.get("/api/templates", (req, res) => {
    try {
      const templates = templateManager.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  
  // Get a template by ID
  app.get("/api/templates/:id", (req, res) => {
    try {
      const id = req.params.id;
      const template = templateManager.getTemplateById(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  
  // Get a template for a specific industry
  app.get("/api/templates/industry/:industry", (req, res) => {
    try {
      const industry = req.params.industry;
      const template = templateManager.getTemplateByIndustry(industry);
      res.json(template);
    } catch (error) {
      console.error("Error fetching industry template:", error);
      res.status(500).json({ message: "Failed to fetch industry template" });
    }
  });
  
  // Get a list of available industries
  app.get("/api/industries", (req, res) => {
    try {
      const industries = templateManager.getAvailableIndustries();
      res.json(industries);
    } catch (error) {
      console.error("Error fetching industries:", error);
      res.status(500).json({ message: "Failed to fetch industries" });
    }
  });

  // AI-powered insight tooltips
  app.get("/api/tooltips/:field", async (req, res) => {
    try {
      const { field } = req.params;
      const { industry } = req.query;
      
      // Generate the tooltip for the requested field
      const tooltip = await generateInsightTooltip(
        field, 
        industry as string | undefined
      );
      
      res.json(tooltip);
    } catch (error) {
      console.error("Error generating tooltip:", error);
      res.status(500).json({ 
        message: "Failed to generate tooltip",
        error: (error as Error).message
      });
    }
  });
  
  // Pre-generate tooltips for multiple fields
  app.get("/api/tooltips", async (req, res) => {
    try {
      const { industry } = req.query;
      
      // Pre-generate tooltips for common fields
      const tooltips = await preGenerateTooltips(
        industry as string | undefined
      );
      
      res.json(tooltips);
    } catch (error) {
      console.error("Error generating tooltips:", error);
      res.status(500).json({ 
        message: "Failed to generate tooltips",
        error: (error as Error).message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
