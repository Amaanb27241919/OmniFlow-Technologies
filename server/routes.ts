import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertAuditSchema } from "@shared/schema";
import { generateAuditResults } from "./lib/auditLogic";
import { notion, findDatabaseByTitle, addAuditToNotion } from "./lib/notion";
import { templateManager } from "./lib/templates/templateManager";
import { generateInsightTooltip, preGenerateTooltips } from "./lib/tooltipService";
import { generateContextualActions, type ContextData } from "./lib/quickActionsAI";
import omniCoreRoutes from "./omnicore/routes";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import { registerEnhancedAutomation } from "./enhanced-automation";
import { marketingEngine } from "./lib/marketingAutomation";

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

// File paths for JSON storage
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Enhanced middleware setup
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from the public directory
  app.use(express.static('public'));
  
  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });

  // Authentication endpoint
  app.post('/api/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const username = email; // Accept email or username
      
      console.log('Login attempt:', { email, passwordLength: password?.length });
      
      // Authentication check for both admin and clients
      if (username === 'admin' && password === 'admin') {
        const response = { 
          success: true, 
          token: 'admin-token', 
          username: 'admin',
          role: 'ops_manager'
        };
        console.log('Admin login successful:', response);
        res.json(response);
      } else if (password && password.length >= 6) {
        // Allow any email with password 6+ characters for client access
        const response = { 
          success: true, 
          token: 'client-token', 
          username: username,
          role: 'client'
        };
        console.log('Client login successful:', response);
        res.json(response);
      } else {
        const response = { 
          success: false, 
          message: 'Invalid credentials. Password must be at least 6 characters.' 
        };
        console.log('Login failed:', response);
        res.json(response);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(200).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
  });

  // Landing page route is now handled in index.ts
  
  // Serve the login page
  app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: 'public' });
  });
  
  // Serve the app dashboard for logged-in users
  app.get('/app', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });
  
  // Direct route to the Business Audit Tool
  app.get('/audit', (req, res) => {
    // Send the integrated Business Audit Form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OmniCore Business Audit Tool</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          .audit-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            margin: 20px 0;
          }
          .audit-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .audit-header h1 {
            color: #4F46E5;
            margin-bottom: 10px;
            font-size: 2.5rem;
          }
          .audit-subtitle {
            font-size: 1.2rem;
            color: #374151;
            margin-bottom: 10px;
          }
          .value-prop {
            color: #059669;
            font-weight: 600;
          }
          .form-section {
            margin-bottom: 30px;
            padding: 25px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #4F46E5;
          }
          .form-section h3 {
            color: #1f2937;
            margin-bottom: 20px;
            font-size: 1.3rem;
          }
          .form-row {
            margin-bottom: 20px;
          }
          .form-row label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #374151;
          }
          .form-row input, .form-row select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
          }
          .form-row input:focus, .form-row select:focus {
            outline: none;
            border-color: #4F46E5;
          }
          .checkbox-group {
            display: grid;
            gap: 12px;
          }
          .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: normal;
            cursor: pointer;
            padding: 10px;
            border-radius: 6px;
            transition: background-color 0.3s;
          }
          .checkbox-group label:hover {
            background-color: #f3f4f6;
          }
          .checkbox-group input[type="checkbox"] {
            width: auto;
            margin: 0;
          }
          .audit-submit-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s;
            margin-top: 20px;
          }
          .audit-submit-btn:hover {
            transform: translateY(-2px);
          }
          .privacy-note {
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 15px;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
          }
          .logo-icon {
            width: 32px;
            height: 32px;
          }
          .logo-text {
            font-size: 1.5rem;
            font-weight: 600;
            color: #4F46E5;
          }
          .logo-tag {
            font-size: 0.75rem;
            background-color: #4F46E5;
            color: white;
            padding: 0.1rem 0.35rem;
            border-radius: 0.25rem;
            margin-left: 0.25rem;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #4F46E5;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #4338CA;
          }
          .btn-outline {
            background-color: transparent;
            color: #4F46E5;
            border: 1px solid #4F46E5;
          }
          .btn-outline:hover {
            background-color: rgba(79, 70, 229, 0.05);
          }
          .btn-icon {
            margin-right: 0.5rem;
            width: 16px;
            height: 16px;
          }
          iframe {
            width: 100%;
            height: 800px;
            border: none;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="/" class="logo-section">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8l6-6 6 6H6z" fill="#4F46E5"></path>
                <path d="M12 22l-6-6h12l-6 6z" fill="#4F46E5"></path>
                <path d="M2 12l4-4h12l4 4-4 4H6l-4-4z" fill="#818CF8"></path>
              </svg>
              <span class="logo-text">OmniCore</span>
              <span class="logo-tag">by OmniFlow</span>
            </a>
            <a href="/" class="btn btn-outline">
              <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </a>
          </div>
          
          <!-- Lead Magnet Business Audit Form -->
          <div class="audit-container">
            <div class="audit-header">
              <h1>🚀 Free Business Automation Audit</h1>
              <p class="audit-subtitle">Discover $10,000+ in annual savings through AI automation</p>
              <p class="value-prop">✓ No login required ✓ Get instant results ✓ Personalized recommendations</p>
            </div>
            
            <form id="audit-form" class="audit-form">
              <div class="form-section">
                <h3>📊 Business Overview</h3>
                <div class="form-row">
                  <label>Business Name:</label>
                  <input type="text" name="businessName" required placeholder="e.g., Tech Solutions Inc">
                </div>
                <div class="form-row">
                  <label>Industry:</label>
                  <select name="industry" required>
                    <option value="">Select your industry</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing Agency</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">Software/SaaS</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Annual Revenue:</label>
                  <select name="revenue" required>
                    <option value="">Select revenue range</option>
                    <option value="under-100k">Under $100K</option>
                    <option value="100k-500k">$100K - $500K</option>
                    <option value="500k-1m">$500K - $1M</option>
                    <option value="1m-5m">$1M - $5M</option>
                    <option value="over-5m">Over $5M</option>
                  </select>
                </div>
              </div>
              
              <div class="form-section">
                <h3>⚡ Current Challenges</h3>
                <div class="checkbox-group">
                  <label><input type="checkbox" name="challenges" value="manual-tasks"> Too many manual, repetitive tasks</label>
                  <label><input type="checkbox" name="challenges" value="client-communication"> Client communication takes too much time</label>
                  <label><input type="checkbox" name="challenges" value="content-creation"> Content creation is slow and expensive</label>
                  <label><input type="checkbox" name="challenges" value="data-analysis"> Difficulty analyzing business data</label>
                  <label><input type="checkbox" name="challenges" value="scaling"> Hard to scale without hiring more staff</label>
                  <label><input type="checkbox" name="challenges" value="roi-tracking"> Can't measure ROI effectively</label>
                </div>
              </div>
              
              <div class="form-section">
                <h3>📧 Get Your Results</h3>
                <div class="form-row">
                  <label>Email Address:</label>
                  <input type="email" name="email" required placeholder="your@email.com">
                </div>
                <div class="form-row">
                  <label>Phone (optional):</label>
                  <input type="tel" name="phone" placeholder="For priority consultation">
                </div>
              </div>
              
              <button type="submit" class="audit-submit-btn">
                🚀 Get My Free Automation Analysis
              </button>
              
              <p class="privacy-note">We respect your privacy. No spam, unsubscribe anytime.</p>
            </form>
          </div>
        </div>
        
        <script>
          document.getElementById('audit-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('.audit-submit-btn');
            submitBtn.innerHTML = '🔄 Analyzing Your Business...';
            submitBtn.disabled = true;
            
            const formData = new FormData(this);
            const challenges = formData.getAll('challenges');
            
            const auditData = {
              businessName: formData.get('businessName'),
              industry: formData.get('industry'),
              revenue: formData.get('revenue'),
              challenges: challenges,
              email: formData.get('email'),
              phone: formData.get('phone'),
              timestamp: new Date().toISOString()
            };
            
            try {
              const response = await fetch('/api/submit-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(auditData)
              });
              
              if (response.ok) {
                // Show conversion page with results + upgrade CTA
                showAuditResults(auditData);
              } else {
                throw new Error('Submission failed');
              }
            } catch (error) {
              submitBtn.innerHTML = '❌ Please try again';
              submitBtn.disabled = false;
              setTimeout(() => {
                submitBtn.innerHTML = '🚀 Get My Free Automation Analysis';
              }, 2000);
            }
          });
          
          function showAuditResults(data) {
            document.querySelector('.audit-container').innerHTML = \`
              <div class="results-container">
                <div class="results-header">
                  <h1>🎉 Your Business Automation Analysis</h1>
                  <p class="results-subtitle">Based on your \${data.industry} business with \${data.revenue} revenue</p>
                </div>
                
                <div class="savings-highlight">
                  <h2>💰 Estimated Annual Savings: $12,000 - $45,000</h2>
                  <p>Through AI automation of your current pain points</p>
                </div>
                
                <div class="recommendations">
                  <h3>🎯 Priority Automation Opportunities:</h3>
                  <div class="recommendation-list">
                    \${generateRecommendations(data.challenges)}
                  </div>
                </div>
                
                <div class="conversion-cta">
                  <h3>🚀 Ready to Implement These Solutions?</h3>
                  <p>Unlock full access to OmniCore's automation platform:</p>
                  <ul class="benefits-list">
                    <li>✅ AI Chat Assistant for ongoing strategy</li>
                    <li>✅ Automation Hub for content processing</li>
                    <li>✅ ROI tracking and analytics</li>
                    <li>✅ Custom workflow templates</li>
                    <li>✅ Priority support and consultation</li>
                  </ul>
                  
                  <div class="pricing-box">
                    <div class="price">$97/month</div>
                    <p class="price-note">Cancel anytime • 30-day money-back guarantee</p>
                    <button class="upgrade-btn" onclick="window.location.href='mailto:hello@omni-flow.net?subject=OmniCore Subscription&body=I completed the audit and want to subscribe to OmniCore.'">
                      🎯 Start My Automation Journey
                    </button>
                  </div>
                  
                  <p class="contact-note">Questions? Email us at hello@omni-flow.net</p>
                </div>
              </div>
            \`;
          }
          
          function generateRecommendations(challenges) {
            const recommendations = {
              'manual-tasks': '⚡ Automated workflow builder for repetitive processes',
              'client-communication': '📧 AI-powered email templates and response automation',
              'content-creation': '✍️ AI content generation and marketing copy automation',
              'data-analysis': '📊 Automated reporting and business intelligence dashboards',
              'scaling': '🚀 Scalable automation templates for team expansion',
              'roi-tracking': '💹 Real-time ROI monitoring and performance analytics'
            };
            
            return challenges.map(challenge => 
              \`<div class="recommendation-item">\${recommendations[challenge] || '🔧 Custom automation solution'}</div>\`
            ).join('');
          }
        </script>
        
        <style>
          .results-container {
            text-align: center;
          }
          .savings-highlight {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
          }
          .savings-highlight h2 {
            margin: 0 0 10px 0;
            font-size: 2rem;
          }
          .recommendations {
            background: #f0f9ff;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            text-align: left;
          }
          .recommendation-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #4F46E5;
          }
          .conversion-cta {
            background: #fef7ff;
            padding: 40px;
            border-radius: 12px;
            border: 2px solid #7c3aed;
          }
          .benefits-list {
            text-align: left;
            margin: 20px 0;
            display: inline-block;
          }
          .benefits-list li {
            margin: 8px 0;
            font-size: 1.1rem;
          }
          .pricing-box {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          .price {
            font-size: 3rem;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
          }
          .upgrade-btn {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            border: none;
            padding: 18px 40px;
            border-radius: 8px;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s;
          }
          .upgrade-btn:hover {
            transform: scale(1.05);
          }
          .contact-note {
            margin-top: 20px;
            color: #6b7280;
          }
        </style>
      </body>
      </html>
    `);
  });
  
  // Set up routes for the audit form app
  app.get('/audit-form', (req, res) => {
    // Serve the client app HTML for the audit form
    res.sendFile('index.html', { root: './client/dist' });
  });
  
  // Handle audit form submissions (lead capture)
  app.post('/api/submit-audit', async (req, res) => {
    try {
      const auditData = req.body;
      
      // Save the lead to your database/storage
      const leads = await readJsonFile('leads.json', []);
      const newLead = {
        id: leads.length + 1,
        ...auditData,
        status: 'new_lead',
        timestamp: new Date().toISOString()
      };
      
      leads.push(newLead);
      await writeJsonFile('leads.json', leads);
      
      // Here you could also send an email to yourself about the new lead
      console.log('New lead captured:', newLead.businessName, newLead.email);
      
      res.json({ 
        success: true, 
        message: 'Audit submitted successfully',
        leadId: newLead.id 
      });
    } catch (error) {
      console.error('Error saving lead:', error);
      res.status(500).json({ success: false, message: 'Error processing audit' });
    }
  });

  // Client registration endpoint (for new subscribers)
  app.post('/api/register-client', async (req, res) => {
    try {
      const { email, password, businessName, subscriptionPlan } = req.body;
      
      const clients = await readJsonFile('clients.json', []);
      
      // Check if client already exists
      const existingClient = clients.find(c => c.email === email);
      if (existingClient) {
        return res.status(400).json({ success: false, message: 'Account already exists' });
      }
      
      const newClient = {
        id: clients.length + 1,
        email,
        password, // In production, hash this password
        businessName,
        subscriptionPlan: subscriptionPlan || 'basic',
        status: 'active',
        registeredAt: new Date().toISOString()
      };
      
      clients.push(newClient);
      await writeJsonFile('clients.json', clients);
      
      console.log('New client registered:', email);
      
      res.json({ 
        success: true, 
        message: 'Account created successfully',
        clientId: newClient.id 
      });
    } catch (error) {
      console.error('Error registering client:', error);
      res.status(500).json({ success: false, message: 'Error creating account' });
    }
  });
  
  // AI Chat API endpoint with advanced routing and analytics
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      // Import advanced systems
      const { featureFlagManager } = await import('./lib/featureFlags');
      const { multiModelRouter } = await import('./lib/multiModelRouter');
      const { analyticsEngine } = await import('./lib/analyticsEngine');
      
      // Use session or default user for demo
      const currentUserId = userId || req.session?.user?.id || 'demo-user';
      
      // Check if user can use chat feature
      const chatAccess = featureFlagManager.canUseFeature(currentUserId, 'chat');
      
      if (!chatAccess.allowed) {
        const userUsage = featureFlagManager.getUserUsage(currentUserId);
        const tierInfo = featureFlagManager.getTierInfo(userUsage.tier);
        
        return res.status(429).json({
          success: false,
          error: 'Chat limit reached',
          limit: chatAccess.limit,
          tier: tierInfo?.name,
          upgradeRequired: true
        });
      }

      // Track chat event for analytics
      analyticsEngine.trackEvent(currentUserId, 'chat_message', {
        messageLength: message.length,
        timestamp: new Date()
      });

      // Get user tier for optimal model routing
      const userUsage = featureFlagManager.getUserUsage(currentUserId);
      
      // Route to optimal AI model based on query and user tier
      const modelResponse = await multiModelRouter.routeQuery(message, userUsage.tier);

      // Increment usage counter
      featureFlagManager.incrementUsage(currentUserId, 'chat');
      
      // Get updated usage info
      const updatedAccess = featureFlagManager.canUseFeature(currentUserId, 'chat');
      const upgradeSuggestion = featureFlagManager.getUpgradeSuggestions(currentUserId);

      res.json({
        success: true,
        response: modelResponse.response,
        model: modelResponse.model,
        usage: {
          remaining: updatedAccess.remaining,
          limit: updatedAccess.limit
        },
        cost: modelResponse.cost,
        upgradeSuggestion: upgradeSuggestion.shouldUpgrade ? upgradeSuggestion : null
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  });

  // Analytics Dashboard API
  app.get('/api/analytics/overview', async (req, res) => {
    try {
      const { analyticsEngine } = await import('./lib/analyticsEngine');
      
      const metrics = analyticsEngine.getConversionMetrics();
      const usage = analyticsEngine.getUsageMetrics();
      const insights = analyticsEngine.generateBusinessInsights();
      const trends = analyticsEngine.getTrendAnalysis(30);
      
      res.json({
        success: true,
        data: {
          metrics,
          usage,
          insights,
          trends
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to get analytics' });
    }
  });

  // Client Insights API
  app.get('/api/analytics/clients', async (req, res) => {
    try {
      const { analyticsEngine } = await import('./lib/analyticsEngine');
      const clientInsights = analyticsEngine.generateClientInsights();
      
      res.json({
        success: true,
        data: clientInsights
      });
    } catch (error) {
      console.error('Client insights error:', error);
      res.status(500).json({ success: false, error: 'Failed to get client insights' });
    }
  });

  // Referral System APIs
  app.get('/api/referrals/code/:userId', async (req, res) => {
    try {
      const { referralSystem } = await import('./lib/referralRewards');
      const { userId } = req.params;
      
      const content = referralSystem.generateReferralContent(userId);
      const stats = referralSystem.getReferralStats(userId);
      
      res.json({
        success: true,
        data: { content, stats }
      });
    } catch (error) {
      console.error('Referral code error:', error);
      res.status(500).json({ success: false, error: 'Failed to get referral code' });
    }
  });

  app.post('/api/referrals/signup', async (req, res) => {
    try {
      const { referralSystem } = await import('./lib/referralRewards');
      const { referralCode, newUserId } = req.body;
      
      const result = referralSystem.processReferralSignup(referralCode, newUserId);
      
      res.json({
        success: result.success,
        message: result.message,
        reward: result.reward
      });
    } catch (error) {
      console.error('Referral signup error:', error);
      res.status(500).json({ success: false, error: 'Failed to process referral' });
    }
  });

  app.get('/api/referrals/leaderboard', async (req, res) => {
    try {
      const { referralSystem } = await import('./lib/referralRewards');
      const leaderboard = referralSystem.getLeaderboard(10);
      
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
    }
  });

  // Tier upgrade endpoint with referral rewards
  app.post('/api/upgrade-tier', async (req, res) => {
    try {
      const { featureFlagManager } = await import('./lib/featureFlags');
      const { referralSystem } = await import('./lib/referralRewards');
      const { analyticsEngine } = await import('./lib/analyticsEngine');
      
      const { userId, newTier } = req.body;
      
      // Upgrade user tier
      const upgradeSuccess = featureFlagManager.upgradeUserTier(userId, newTier);
      
      if (upgradeSuccess) {
        // Process referral reward if applicable
        const referralReward = referralSystem.processConversionReward(userId, newTier);
        
        // Track conversion event
        analyticsEngine.trackEvent(userId, 'tier_upgrade', {
          newTier,
          timestamp: new Date()
        });
        
        res.json({
          success: true,
          message: 'Tier upgraded successfully',
          referralReward
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid tier or upgrade failed'
        });
      }
    } catch (error) {
      console.error('Tier upgrade error:', error);
      res.status(500).json({ success: false, error: 'Failed to upgrade tier' });
    }
  });

  // Enterprise Blueprint Library API
  app.get('/api/blueprints', async (req, res) => {
    try {
      const AutomationBlueprintLibrary = require('./lib/automationBlueprints');
      const blueprintLibrary = new AutomationBlueprintLibrary();
      const { featureFlagManager } = await import('./lib/featureFlags');
      
      const userId = req.query.userId || 'demo-user';
      const userUsage = featureFlagManager.getUserUsage(userId);
      const blueprints = blueprintLibrary.getBlueprintsForTier(userUsage.tier);
      
      res.json({
        success: true,
        data: blueprints,
        tier: userUsage.tier
      });
    } catch (error) {
      console.error('Blueprints error:', error);
      res.status(500).json({ success: false, error: 'Failed to load blueprints' });
    }
  });

  // Enhanced Client Portal API
  app.get('/api/portal/dashboard', async (req, res) => {
    try {
      const ClientPortalEnhancements = require('./lib/clientPortalEnhancements');
      const portal = new ClientPortalEnhancements();
      const userId = req.query.userId || 'demo-user';
      
      const dashboard = {
        projects: [
          portal.createProjectTracker(userId, {
            name: 'Lead Qualification Automation',
            type: 'Sales Automation',
            estimatedROI: '$5,000/month'
          })
        ],
        notifications: portal.getUserNotifications(userId),
        usageAnalytics: portal.generateUsageAnalytics(userId),
        supportChat: portal.initializeSupportChat(userId)
      };
      
      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      console.error('Portal error:', error);
      res.status(500).json({ success: false, error: 'Failed to load portal' });
    }
  });

  // Admin Dashboard API
  app.get('/api/admin/overview', async (req, res) => {
    try {
      const AdminDashboard = require('./lib/adminDashboard');
      const adminDash = new AdminDashboard();
      
      const overview = await adminDash.getPlatformOverview();
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ success: false, error: 'Failed to load admin data' });
    }
  });

  // Integrated Automation Pipeline API
  app.post('/api/automation/pipeline/start', async (req, res) => {
    try {
      const { automationPipeline } = await import('./lib/automationPipeline');
      const { blueprintId, businessData } = req.body;
      const userId = req.body.userId || `user_${Date.now()}`;
      
      const executionId = await automationPipeline.startPipeline(userId, blueprintId, businessData);
      
      res.json({
        success: true,
        data: {
          executionId,
          status: 'started',
          estimatedCompletion: '45 minutes'
        }
      });
    } catch (error) {
      console.error('Pipeline start error:', error);
      res.status(500).json({ success: false, error: 'Failed to start automation pipeline' });
    }
  });

  app.get('/api/automation/pipeline/:executionId/status', async (req, res) => {
    try {
      const { automationPipeline } = await import('./lib/automationPipeline');
      const { executionId } = req.params;
      
      const execution = await automationPipeline.getExecutionStatus(executionId);
      if (!execution) {
        return res.status(404).json({ success: false, error: 'Execution not found' });
      }
      
      res.json({
        success: true,
        data: {
          status: execution.status,
          currentStage: execution.currentStage,
          completedStages: Array.from(execution.results.keys()),
          estimatedROI: execution.estimatedROI,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt
        }
      });
    } catch (error) {
      console.error('Pipeline status error:', error);
      res.status(500).json({ success: false, error: 'Failed to get pipeline status' });
    }
  });

  app.get('/api/automation/pipeline/:executionId/results', async (req, res) => {
    try {
      const { automationPipeline } = await import('./lib/automationPipeline');
      const { executionId } = req.params;
      
      const results = await automationPipeline.getExecutionResults(executionId);
      if (!results) {
        return res.status(404).json({ success: false, error: 'Results not found' });
      }
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Pipeline results error:', error);
      res.status(500).json({ success: false, error: 'Failed to get pipeline results' });
    }
  });

  // Enhanced Chat with Agent Router and Memory
  app.post('/api/chat/enhanced', async (req, res) => {
    try {
      const { agentRouter } = await import('./lib/agentRouter');
      const { persistentMemory } = await import('./lib/persistentMemory');
      const { featureFlagManager } = await import('./lib/featureFlags');
      
      const { message, userId } = req.body;
      const userUsage = featureFlagManager.getUserUsage(userId);
      
      // Check usage limits
      if (!featureFlagManager.canUseFeature(userId, 'chat')) {
        return res.json({
          success: false,
          error: 'Usage limit reached',
          upgradeRequired: true,
          suggestedTier: userUsage.tier === 'pro_bono' ? 'pro' : 'enterprise'
        });
      }
      
      // Enhance query with context
      const enhancedQuery = await persistentMemory.enhanceQuery(userId, message);
      
      // Route to optimal AI model
      const response = await agentRouter.routeRequest({
        query: enhancedQuery,
        userTier: userUsage.tier,
        context: 'business_consultation'
      });
      
      // Record conversation
      await persistentMemory.addConversation(userId, {
        timestamp: new Date(),
        query: message,
        response: response.content,
        model: response.model,
        confidence: response.confidence
      });
      
      // Track usage
      featureFlagManager.trackUsage(userId, 'chat');
      
      // Get contextual insights
      const insights = await persistentMemory.getContextualInsights(userId);
      
      res.json({
        success: true,
        data: {
          response: response.content,
          model: response.model,
          cost: response.cost,
          insights: {
            automationReadiness: insights.automationReadiness,
            recommendedNextSteps: insights.recommendedNextSteps,
            potentialROI: insights.potentialROI
          },
          usage: featureFlagManager.getUserUsage(userId)
        }
      });
      
    } catch (error) {
      console.error('Enhanced chat error:', error);
      res.status(500).json({ success: false, error: 'Failed to process chat message' });
    }
  });

  // OmniFlow Advisory Service Assessment
  app.post('/api/omniflow/assess-client', async (req, res) => {
    try {
      const { omniflowPlatform } = await import('./lib/omniflowCore');
      const { leadScoringEngine } = await import('./lib/leadScoringEngine');
      
      const { userId } = req.body;
      
      // Generate comprehensive client assessment
      const [clientAssessment, leadScore] = await Promise.all([
        omniflowPlatform.assessClientReadiness(userId),
        leadScoringEngine.scoreProspect(userId)
      ]);
      
      res.json({
        success: true,
        data: {
          clientStage: clientAssessment.currentStage,
          recommendedService: clientAssessment.recommendedService,
          transitionPath: clientAssessment.transitionPath,
          timeToValue: clientAssessment.timeToValue,
          leadScore: leadScore.overall,
          conversionProbability: leadScore.conversionProbability,
          predictedLTV: leadScore.predictedLTV,
          nextBestAction: leadScore.nextBestAction,
          recommendedActions: leadScore.recommendedActions
        }
      });
      
    } catch (error) {
      console.error('Client assessment error:', error);
      res.status(500).json({ success: false, error: 'Failed to assess client readiness' });
    }
  });

  // Generate Service Proposal
  app.post('/api/omniflow/generate-proposal', async (req, res) => {
    try {
      const { omniflowPlatform } = await import('./lib/omniflowCore');
      const { userId, serviceType } = req.body;
      
      const proposal = await omniflowPlatform.generateProposal(userId, serviceType || 'advisory');
      
      res.json({
        success: true,
        data: proposal
      });
      
    } catch (error) {
      console.error('Proposal generation error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate proposal' });
    }
  });

  // Service-to-SaaS Transition Evaluation
  app.post('/api/omniflow/evaluate-transition', async (req, res) => {
    try {
      const { omniflowPlatform } = await import('./lib/omniflowCore');
      const { userId, advisoryResults } = req.body;
      
      const transition = await omniflowPlatform.initiateServiceToSaaSTransition(userId, advisoryResults || {});
      
      res.json({
        success: true,
        data: transition
      });
      
    } catch (error) {
      console.error('Transition evaluation error:', error);
      res.status(500).json({ success: false, error: 'Failed to evaluate SaaS transition' });
    }
  });

  // Lead Scoring Dashboard
  app.get('/api/omniflow/lead-scores', async (req, res) => {
    try {
      const { leadScoringEngine } = await import('./lib/leadScoringEngine');
      const { userId } = req.query;
      
      if (userId) {
        // Get single lead score
        const score = await leadScoringEngine.scoreProspect(userId as string);
        res.json({ success: true, data: { [userId]: score } });
      } else {
        // Get top prospects
        const topProspects = await leadScoringEngine.getTopProspects(10);
        res.json({ success: true, data: topProspects });
      }
      
    } catch (error) {
      console.error('Lead scoring error:', error);
      res.status(500).json({ success: false, error: 'Failed to get lead scores' });
    }
  });

  // Compliance Reporting
  app.get('/api/omniflow/compliance-report', async (req, res) => {
    try {
      const { complianceLogger } = await import('./lib/complianceLogger');
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await complianceLogger.getComplianceReport(start, end);
      
      res.json({
        success: true,
        data: report
      });
      
    } catch (error) {
      console.error('Compliance report error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate compliance report' });
    }
  });

  // Enterprise API Management
  app.get('/api/enterprise/api-keys', async (req, res) => {
    try {
      const EnterpriseAPI = require('./lib/enterpriseAPI');
      const enterpriseAPI = new EnterpriseAPI();
      const userId = req.query.userId || 'demo-user';
      
      // Generate a sample API key for demo
      const apiKey = enterpriseAPI.generateAPIKey(userId, 'Default API Key', ['read', 'write']);
      const documentation = enterpriseAPI.generateAPIDocumentation();
      
      res.json({
        success: true,
        data: {
          apiKey,
          documentation,
          integrations: Array.from(enterpriseAPI.integrations.values())
        }
      });
    } catch (error) {
      console.error('Enterprise API error:', error);
      res.status(500).json({ success: false, error: 'Failed to load API data' });
    }
  });

  // Mount OmniCore routes
  app.use('/api', omniCoreRoutes);
  
  // Mount Automation routes
  const automationRoutes = await import('./routes/automationRoutes');
  app.use('/api/automation', automationRoutes.default);
  
  // Register enhanced automation capabilities
  registerEnhancedAutomation(app);

  // Role-based access route
  app.post('/api/user-role', async (req, res) => {
    try {
      const { username } = req.body;
      
      // Define your admin credentials here
      const isOpsManager = username === 'admin' || username === 'ops_manager' || username === 'manager';
      
      const roleConfig = {
        role: isOpsManager ? 'ops_manager' : 'smb_owner',
        permissions: isOpsManager ? [
          'view_all_clients',
          'system_analytics', 
          'manage_workflows',
          'support_access',
          'bulk_operations'
        ] : [
          'basic_automation',
          'own_analytics',
          'chat_access'
        ],
        dashboardType: isOpsManager ? 'admin' : 'client'
      };
      
      res.json(roleConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to determine user role' });
    }
  });

  // AI-powered quick actions endpoint
  app.post('/api/quick-actions', async (req, res) => {
    try {
      const contextData: ContextData = {
        currentPage: req.body.currentPage || 'dashboard',
        userRole: req.body.userRole || 'business_owner',
        businessType: req.body.businessType || 'small_business',
        selectedText: req.body.selectedText || '',
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
        recentActions: req.body.recentActions || [],
        businessGoals: req.body.businessGoals || ['growth', 'efficiency']
      };

      const actions = await generateContextualActions(contextData);
      res.json({ success: true, actions });
    } catch (error) {
      console.error('Error generating quick actions:', error);
      res.status(500).json({ error: 'Failed to generate quick actions' });
    }
  });
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

  // Marketing Automation & Lead Capture Endpoints
  
  // Capture leads from landing page contact forms
  app.post('/api/leads/capture', async (req, res) => {
    try {
      const leadData = req.body;
      
      // Add lead to marketing automation system
      const lead = await marketingEngine.addLead({
        email: leadData.email,
        businessName: leadData.businessName,
        contactName: leadData.contactName,
        phone: leadData.phone,
        companySize: leadData.companySize,
        challenge: leadData.challenge,
        source: leadData.serviceType === 'advisory' ? 'consultation_request' : 'platform_trial',
        status: 'new'
      });

      // Also save to existing leads file for compatibility
      const existingLeads = await readJsonFile('./leads.json', []);
      existingLeads.push({
        ...leadData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        score: lead.score,
        tags: lead.tags
      });
      await writeJsonFile('./leads.json', existingLeads);

      res.json({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead captured and nurturing sequence started' 
      });
    } catch (error) {
      console.error('Error capturing lead:', error);
      res.status(500).json({ error: 'Failed to capture lead' });
    }
  });

  // Track user interactions for lead scoring
  app.post('/api/leads/track-interaction', async (req, res) => {
    try {
      const { leadId, type, metadata } = req.body;
      
      await marketingEngine.recordInteraction(leadId, {
        type,
        timestamp: new Date(),
        metadata
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      res.status(500).json({ error: 'Failed to track interaction' });
    }
  });

  // Get lead analytics for admin dashboard
  app.get('/api/marketing/analytics', async (req, res) => {
    try {
      const analytics = marketingEngine.getConversionAnalytics();
      const highValueLeads = marketingEngine.getHighValueLeads();
      const followupNeeded = marketingEngine.getLeadsNeedingFollowup();

      res.json({
        analytics,
        highValueLeads: highValueLeads.slice(0, 10),
        followupNeeded: followupNeeded.slice(0, 5)
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  // Update lead status
  app.put('/api/leads/:leadId/status', async (req, res) => {
    try {
      const { leadId } = req.params;
      const { status } = req.body;
      
      await marketingEngine.updateLeadStatus(leadId, status);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ error: 'Failed to update lead status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
