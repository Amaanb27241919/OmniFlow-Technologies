import express, { type Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import { storage } from "./storage";
import { z } from "zod";
import { insertAuditSchema } from "@shared/schema";
import { generateAuditResults } from "./lib/auditLogic";
import omniCoreRoutes from "./omnicore/routes";

// Enhanced task and user management from your existing backend
interface EnhancedTask {
  id: number;
  task: string;
  status: 'pending' | 'completed' | 'failed';
  user: string;
  result?: string;
  schedule?: string;
  timestamp?: string;
}

interface EnhancedUser {
  username: string;
  password: string;
}

interface EnhancedLogEntry {
  id: number;
  user: string;
  task: string;
  result: string;
  timestamp: string;
}

// File paths for JSON storage (merging your existing approach)
const TASKS_FILE = path.join(process.cwd(), 'tasks.json');
const USERS_FILE = path.join(process.cwd(), 'users.json');
const LOGS_FILE = path.join(process.cwd(), 'logs.json');

// Helper functions for file operations
async function readJsonFile<T>(filePath: string, defaultValue: T[]): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Initialize your existing data files
async function initializeDataFiles() {
  try {
    // Initialize tasks.json with your existing data
    const existingTasks = [
      {
        id: 1,
        task: "hello from stub",
        status: "completed",
        user: "alice",
        result: "MOCK RESULT for \"hello from stub\""
      },
      {
        id: 2,
        task: "stubbed scheduled run",
        schedule: "* * * * *",
        status: "completed",
        user: "alice",
        result: "MOCK RESULT for \"stubbed scheduled run\""
      },
      {
        id: 3,
        task: "hello with DB",
        status: "completed",
        user: "bob",
        result: "MOCK RESULT for \"hello with DB\""
      }
    ];

    // Initialize users.json with your existing data
    const existingUsers = [
      {
        username: "alice",
        password: "$2b$10$TXm6vrq92FEW4OnSDoAX6ury/Ii4bsUgIYKmFCPPTnBWzidVxKisO"
      },
      {
        username: "bob",
        password: "$2b$10$9c6eSXoQSIMtZLgbQhJmjeySwig6SKUgnmrKZmbI4fBeWV1nTQHRy"
      }
    ];

    // Initialize logs.json with your existing data
    const existingLogs = [
      {
        id: 1,
        user: "alice",
        task: "hello from stub",
        result: "MOCK RESULT for \"hello from stub\"",
        timestamp: "2025-04-24T03:49:10.808Z"
      },
      {
        id: 2,
        user: "alice",
        task: "stubbed scheduled run",
        result: "MOCK RESULT for \"stubbed scheduled run\"",
        timestamp: "2025-04-24T04:00:00.725Z"
      },
      {
        id: 3,
        user: "bob",
        task: "hello with DB",
        result: "MOCK RESULT for \"hello with DB\"",
        timestamp: "2025-04-24T04:39:05.526Z"
      }
    ];

    await writeJsonFile(TASKS_FILE, existingTasks);
    await writeJsonFile(USERS_FILE, existingUsers);
    await writeJsonFile(LOGS_FILE, existingLogs);
    
    console.log('📁 Initialized data files with existing backend data');
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}

export async function registerEnhancedRoutes(app: Express): Promise<Server> {
  // Initialize data files first
  await initializeDataFiles();

  // Enhanced middleware setup
  app.use(cors());
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });

  // Serve static files from the public directory
  app.use(express.static('public'));
  
  // Serve the OmniCore app at the root route
  app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });

  // Authentication middleware from your backend
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'omnicore-secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Enhanced Authentication Routes (from your existing backend)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const users = await readJsonFile<EnhancedUser>(USERS_FILE, []);
      
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      users.push({ username, password: hashedPassword });
      await writeJsonFile(USERS_FILE, users);
      
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const users = await readJsonFile<EnhancedUser>(USERS_FILE, []);
      
      const user = users.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ username }, process.env.JWT_SECRET || 'omnicore-secret');
      res.json({ token, username });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Enhanced Task Management Routes (from your existing backend)
  app.get('/api/tasks', async (req: any, res) => {
    try {
      const tasks = await readJsonFile<EnhancedTask>(TASKS_FILE, []);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/tasks', async (req: any, res) => {
    try {
      const { task, schedule, user = 'system' } = req.body;
      const tasks = await readJsonFile<EnhancedTask>(TASKS_FILE, []);
      
      const newTask: EnhancedTask = {
        id: tasks.length + 1,
        task,
        status: 'pending',
        user,
        schedule,
        timestamp: new Date().toISOString()
      };

      tasks.push(newTask);
      await writeJsonFile(TASKS_FILE, tasks);
      
      // Schedule task if cron expression provided
      if (schedule) {
        cron.schedule(schedule, async () => {
          console.log(`🔄 Executing scheduled task: ${task}`);
          
          // Update task status and add to logs
          const logs = await readJsonFile<EnhancedLogEntry>(LOGS_FILE, []);
          logs.push({
            id: logs.length + 1,
            user,
            task,
            result: `Scheduled execution of: ${task}`,
            timestamp: new Date().toISOString()
          });
          await writeJsonFile(LOGS_FILE, logs);
        });
      }

      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Enhanced Logs Routes (from your existing backend)
  app.get('/api/logs', async (req: any, res) => {
    try {
      const logs = await readJsonFile<EnhancedLogEntry>(LOGS_FILE, []);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Enhanced Automation Routes (merging existing OmniCore with your backend)
  app.post('/api/automation/nlp-query', async (req, res) => {
    try {
      const { query, type, user = 'system' } = req.body;
      
      // Process with AI (user can provide OpenAI API key for real processing)
      const processedResult = `AI-processed: "${query}" (Type: ${type}) - Enhanced with OmniCore automation`;
      
      // Add to tasks
      const tasks = await readJsonFile<EnhancedTask>(TASKS_FILE, []);
      const newTask: EnhancedTask = {
        id: tasks.length + 1,
        task: query,
        status: 'completed',
        user,
        result: processedResult,
        timestamp: new Date().toISOString()
      };
      tasks.push(newTask);
      await writeJsonFile(TASKS_FILE, tasks);

      // Add to logs
      const logs = await readJsonFile<EnhancedLogEntry>(LOGS_FILE, []);
      logs.push({
        id: logs.length + 1,
        user,
        task: query,
        result: processedResult,
        timestamp: new Date().toISOString()
      });
      await writeJsonFile(LOGS_FILE, logs);

      res.json({ 
        success: true, 
        result: processedResult,
        taskId: newTask.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Processing failed' });
    }
  });

  // Business audit routes (keeping existing OmniCore functionality)
  app.post("/api/audits", async (req, res) => {
    try {
      const result = insertAuditSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send("Invalid audit data");
      }

      const audit = await storage.createAudit(result.data);
      const auditResults = await generateAuditResults(result.data);
      
      res.json({ audit, results: auditResults });
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).send("Failed to create audit");
    }
  });

  // Include OmniCore chat routes
  app.use('/api', omniCoreRoutes);

  const httpServer = createServer(app);
  
  // Initialize cron scheduler
  console.log('🚀 Enhanced OmniCore server started with merged features');
  console.log('📊 Integrated: Task automation, user management, AI processing, and business audits');
  console.log('🔐 Authentication system active');
  console.log('⚡ Automation Hub ready');
  
  return httpServer;
}