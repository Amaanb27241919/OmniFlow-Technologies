import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertAuditSchema } from "@shared/schema";
import { generateAuditResults } from "./lib/auditLogic";
import { notion, findDatabaseByTitle, addAuditToNotion } from "./lib/notion";
import { templateManager } from "./lib/templates/templateManager";
import { generateInsightTooltip, preGenerateTooltips } from "./lib/tooltipService";
import omniCoreRoutes from "./omnicore/routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the public directory
  app.use(express.static('public'));
  
  // Serve the OmniCore app at the root route
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });
  
  // Direct route to the Business Audit Tool
  app.get('/audit', (req, res) => {
    // For now, let's show a message that this integration is coming soon
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OmniCore Audit Tool - Coming Soon</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          .container {
            max-width: 800px;
            margin: 100px auto;
            text-align: center;
            padding: 20px;
          }
          .btn {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Business Audit Tool Integration</h1>
          <p>The full integration with the Business Audit Tool is coming soon.</p>
          <p>This will allow you to analyze your business operations and get tailored workflow automation recommendations.</p>
          <a href="/" class="btn">Return to OmniCore Dashboard</a>
        </div>
      </body>
      </html>
    `);
  });
  
  // Mount OmniCore routes
  app.use('/api', omniCoreRoutes);
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

  // FEATURE 1: Downloadable Implementation Guides
  app.get("/api/guides/:moduleId", async (req, res) => {
    try {
      const { moduleId } = req.params;
      const { auditId } = req.query;
      
      if (!auditId) {
        return res.status(400).json({ message: "Missing auditId parameter" });
      }
      
      // Get the audit data
      const id = parseInt(auditId as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }
      
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // Find the specific workflow module
      const module = audit.workflowRecommendations?.find(
        m => m.name.toLowerCase().replace(/\s+/g, '-') === moduleId
      );
      
      if (!module) {
        return res.status(404).json({ message: "Workflow module not found" });
      }
      
      // In a real implementation, this would generate and return a PDF
      // For demo purposes, just return a mock download link with implementation details
      
      const downloadUrl = `/api/guides/download/${moduleId}-implementation-guide-${Date.now()}.pdf`;
      
      res.json({ 
        success: true,
        downloadUrl,
        module: module.name,
        businessName: audit.businessName,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating implementation guide:", error);
      res.status(500).json({ message: "Failed to generate implementation guide" });
    }
  });
  
  // FEATURE 2: Implementation Progress Tracking
  app.post("/api/progress/:auditId", async (req, res) => {
    try {
      const { auditId } = req.params;
      const { moduleId, steps, notes } = req.body;
      
      if (!moduleId || !steps) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const id = parseInt(auditId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }
      
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // In a real implementation, this would save to database
      // For demo purposes, just return success with the data that would be saved
      
      res.status(201).json({
        success: true,
        auditId: id,
        moduleId,
        progress: steps,
        notes,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving implementation progress:", error);
      res.status(500).json({ message: "Failed to save implementation progress" });
    }
  });
  
  // Get implementation progress for a specific module
  app.get("/api/progress/:auditId/:moduleId", async (req, res) => {
    try {
      const { auditId, moduleId } = req.params;
      
      const id = parseInt(auditId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }
      
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // For demo purposes, return mock progress data
      res.json({
        success: true,
        auditId: id,
        moduleId,
        progress: {
          steps: [
            { id: 1, title: "Step 1", completed: true, completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 2, title: "Step 2", completed: false, completedAt: null },
            { id: 3, title: "Step 3", completed: false, completedAt: null }
          ],
          notes: "Completed the initial setup phase. Working on configuring the system now.",
          overallProgress: 33, // Percentage
          startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error("Error fetching implementation progress:", error);
      res.status(500).json({ message: "Failed to fetch implementation progress" });
    }
  });
  
  // FEATURE 3: Email Reminders
  app.post("/api/reminders", async (req, res) => {
    try {
      const { auditId, moduleId, email, frequency } = req.body;
      
      if (!auditId || !moduleId || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const id = parseInt(auditId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }
      
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // Find the module
      const module = audit.workflowRecommendations?.find(
        m => m.name.toLowerCase().replace(/\s+/g, '-') === moduleId
      );
      
      if (!module) {
        return res.status(404).json({ message: "Workflow module not found" });
      }
      
      // In a real implementation, this would set up scheduled emails
      // For demo purposes, just return success
      
      res.status(201).json({
        success: true,
        message: "Reminders scheduled successfully",
        email,
        frequency: frequency || "weekly",
        reminderDetails: {
          businessName: audit.businessName,
          module: module.name,
          nextReminder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error("Error setting up email reminders:", error);
      res.status(500).json({ message: "Failed to set up email reminders" });
    }
  });
  
  // FEATURE 4: Task Management Integration
  app.get("/api/tasks/:auditId/:moduleId", async (req, res) => {
    try {
      const { auditId, moduleId } = req.params;
      const { platform } = req.query; // e.g., 'trello', 'asana', 'jira'
      
      const id = parseInt(auditId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid audit ID" });
      }
      
      const audit = await storage.getAudit(id);
      if (!audit) {
        return res.status(404).json({ message: "Audit not found" });
      }
      
      // Find the module
      const module = audit.workflowRecommendations?.find(
        m => m.name.toLowerCase().replace(/\s+/g, '-') === moduleId
      );
      
      if (!module) {
        return res.status(404).json({ message: "Workflow module not found" });
      }
      
      // In a real implementation, this would generate tasks formatted for the specific platform
      // For demo purposes, return generic task data
      
      const implementationSteps = [
        {
          title: module.name === "OmniBot" ? "Define Your Customer Journey" : 
                 module.name === "OmniAgent" ? "Build Your Knowledge Base" :
                 module.name === "OmniAI" ? "Data Assessment and Preparation" :
                 module.name === "OmniForge" ? "Process Mapping and Analysis" :
                 module.name === "OmniConnect" ? "System Audit and Integration Planning" :
                 "Define Your Implementation Goals",
          description: "First phase of implementation focused on discovery and planning",
          priority: "high",
          subtasks: [
            { title: "Document current process", estimate: "2-3 hours", difficulty: "easy" },
            { title: "Identify improvement opportunities", estimate: "2-3 hours", difficulty: "medium" },
            { title: "Define success metrics", estimate: "1-2 hours", difficulty: "easy" }
          ]
        },
        {
          title: module.name === "OmniBot" ? "Set Up Automated Email Sequences" : 
                 module.name === "OmniAgent" ? "Train Your Virtual Assistant" :
                 module.name === "OmniAI" ? "Model Development and Training" :
                 module.name === "OmniForge" ? "Workflow Design and Configuration" :
                 module.name === "OmniConnect" ? "Data Mapping and Transformation" :
                 "Configure and Customize",
          description: "Configuration and setup of the core functionality",
          priority: "high",
          subtasks: [
            { title: "Review configuration options", estimate: "1-2 hours", difficulty: "easy" },
            { title: "Customize settings for your business", estimate: "3-5 hours", difficulty: "medium" },
            { title: "Test configuration with sample data", estimate: "2-3 hours", difficulty: "medium" }
          ]
        },
        {
          title: module.name === "OmniBot" ? "Integrate with Your CRM" : 
                 module.name === "OmniAgent" ? "Deploy Customer-Facing Channels" :
                 module.name === "OmniAI" ? "Insight Dashboard Creation" :
                 module.name === "OmniForge" ? "Testing and Deployment" :
                 module.name === "OmniConnect" ? "Connection Setup and Testing" :
                 "Testing and Launch",
          description: "Final implementation phase focused on deployment and going live",
          priority: "medium",
          subtasks: [
            { title: "Prepare for deployment", estimate: "2-3 hours", difficulty: "medium" },
            { title: "Run user acceptance testing", estimate: "4-6 hours", difficulty: "medium" },
            { title: "Launch and monitor", estimate: "2-4 hours", difficulty: "medium" }
          ]
        }
      ];
      
      res.json({
        success: true,
        platform: platform || 'generic',
        businessName: audit.businessName,
        projectName: `${module.name} Implementation for ${audit.businessName}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tasks: implementationSteps
      });
    } catch (error) {
      console.error("Error generating task data:", error);
      res.status(500).json({ message: "Failed to generate task data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
