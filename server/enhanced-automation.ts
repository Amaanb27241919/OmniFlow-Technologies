import { Express } from "express";
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";

// Enhanced automation capabilities
interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: 'manual' | 'schedule' | 'webhook' | 'email';
  schedule?: string;
  steps: AutomationStep[];
  isActive: boolean;
  createdBy: string;
  lastRun?: string;
  runCount: number;
}

interface AutomationStep {
  id: string;
  type: 'ai-process' | 'email-send' | 'data-transform' | 'webhook-call' | 'condition';
  config: any;
  description: string;
}

const WORKFLOWS_FILE = path.join(process.cwd(), 'workflows.json');

// Workflow templates for different business needs
const workflowTemplates = {
  'lead-processing': {
    name: 'Lead Processing Automation',
    description: 'Automatically process and qualify new leads',
    steps: [
      { type: 'ai-process', description: 'Analyze lead information and score' },
      { type: 'condition', description: 'Check if lead score > threshold' },
      { type: 'email-send', description: 'Send personalized follow-up email' }
    ]
  },
  'content-creation': {
    name: 'Content Creation Pipeline',
    description: 'Generate and schedule content across platforms',
    steps: [
      { type: 'ai-process', description: 'Generate blog post content' },
      { type: 'ai-process', description: 'Create social media snippets' },
      { type: 'webhook-call', description: 'Schedule posts on platforms' }
    ]
  },
  'customer-onboarding': {
    name: 'Customer Onboarding Sequence',
    description: 'Automated welcome and setup process for new customers',
    steps: [
      { type: 'email-send', description: 'Send welcome email with setup guide' },
      { type: 'ai-process', description: 'Generate personalized checklist' },
      { type: 'webhook-call', description: 'Create customer dashboard' }
    ]
  },
  'data-insights': {
    name: 'Business Intelligence Reports',
    description: 'Automated data analysis and reporting',
    steps: [
      { type: 'data-transform', description: 'Aggregate business metrics' },
      { type: 'ai-process', description: 'Generate insights and recommendations' },
      { type: 'email-send', description: 'Send weekly report to stakeholders' }
    ]
  }
};

// Smart scheduling suggestions based on business patterns
const scheduleRecommendations = {
  'daily-reports': '0 9 * * 1-5', // 9 AM weekdays
  'weekly-summary': '0 17 * * 5', // 5 PM Fridays
  'monthly-analysis': '0 9 1 * *', // 9 AM first of month
  'lead-follow-up': '0 10,14 * * 1-5', // 10 AM and 2 PM weekdays
  'social-posting': '0 8,12,17 * * *' // 8 AM, 12 PM, 5 PM daily
};

export function registerEnhancedAutomation(app: Express) {
  
  // Get workflow templates
  app.get('/api/automation/templates', (req, res) => {
    res.json(workflowTemplates);
  });

  // Get schedule recommendations
  app.get('/api/automation/schedules', (req, res) => {
    res.json(scheduleRecommendations);
  });

  // Create custom workflow
  app.post('/api/automation/workflows', async (req, res) => {
    try {
      const { name, trigger, schedule, steps, user } = req.body;
      
      const workflow: AutomationWorkflow = {
        id: `workflow_${Date.now()}`,
        name,
        trigger,
        schedule,
        steps: steps.map((step: any, index: number) => ({
          id: `step_${index}`,
          ...step
        })),
        isActive: true,
        createdBy: user || 'system',
        runCount: 0
      };

      const workflows = await readWorkflows();
      workflows.push(workflow);
      await writeWorkflows(workflows);

      // Schedule if needed
      if (trigger === 'schedule' && schedule) {
        scheduleWorkflow(workflow);
      }

      res.json({ success: true, workflow });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create workflow' });
    }
  });

  // Get user workflows
  app.get('/api/automation/workflows', async (req, res) => {
    try {
      const workflows = await readWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch workflows' });
    }
  });

  // Execute workflow manually
  app.post('/api/automation/workflows/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const workflows = await readWorkflows();
      const workflow = workflows.find(w => w.id === id);
      
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      const result = await executeWorkflow(workflow, req.body.inputData);
      
      // Update run count
      workflow.runCount++;
      workflow.lastRun = new Date().toISOString();
      await writeWorkflows(workflows);

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  });

  // Advanced analytics endpoint
  app.get('/api/automation/analytics', async (req, res) => {
    try {
      const workflows = await readWorkflows();
      const tasks = await readTasks();
      
      const analytics = {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalExecutions: workflows.reduce((sum, w) => sum + w.runCount, 0),
        tasksCompleted: tasks.filter((t: any) => t.status === 'completed').length,
        averageExecutionTime: '2.3s', // This would be calculated from actual data
        topPerformingWorkflows: workflows
          .sort((a, b) => b.runCount - a.runCount)
          .slice(0, 5)
          .map(w => ({ name: w.name, executions: w.runCount })),
        recentActivity: tasks
          .slice(-10)
          .map((t: any) => ({
            task: t.task,
            status: t.status,
            timestamp: t.timestamp,
            user: t.user
          }))
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });
}

// Helper functions
async function readWorkflows(): Promise<AutomationWorkflow[]> {
  try {
    const data = await fs.readFile(WORKFLOWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeWorkflows(workflows: AutomationWorkflow[]): Promise<void> {
  await fs.writeFile(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2));
}

async function readTasks(): Promise<any[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'tasks.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function scheduleWorkflow(workflow: AutomationWorkflow) {
  if (workflow.schedule) {
    cron.schedule(workflow.schedule, async () => {
      console.log(`🔄 Executing scheduled workflow: ${workflow.name}`);
      try {
        await executeWorkflow(workflow);
        workflow.runCount++;
        workflow.lastRun = new Date().toISOString();
        
        const workflows = await readWorkflows();
        const index = workflows.findIndex(w => w.id === workflow.id);
        if (index !== -1) {
          workflows[index] = workflow;
          await writeWorkflows(workflows);
        }
      } catch (error) {
        console.error(`Error executing workflow ${workflow.name}:`, error);
      }
    });
  }
}

async function executeWorkflow(workflow: AutomationWorkflow, inputData?: any): Promise<any> {
  const results = [];
  
  for (const step of workflow.steps) {
    let stepResult;
    
    switch (step.type) {
      case 'ai-process':
        stepResult = await processWithAI(step, inputData);
        break;
      case 'email-send':
        stepResult = await sendEmail(step, inputData);
        break;
      case 'data-transform':
        stepResult = await transformData(step, inputData);
        break;
      case 'webhook-call':
        stepResult = await callWebhook(step, inputData);
        break;
      case 'condition':
        stepResult = await evaluateCondition(step, inputData);
        break;
      default:
        stepResult = { success: false, error: 'Unknown step type' };
    }
    
    results.push({ stepId: step.id, result: stepResult });
    
    // Pass result to next step
    inputData = { ...inputData, previousResult: stepResult };
  }
  
  return {
    workflowId: workflow.id,
    executedAt: new Date().toISOString(),
    steps: results,
    success: results.every(r => r.result.success !== false)
  };
}

// Step execution functions (you can enhance these with real integrations)
async function processWithAI(step: any, data: any): Promise<any> {
  // This would integrate with your OpenAI processing
  return {
    success: true,
    output: `AI processed: ${JSON.stringify(data)}`,
    processingTime: '1.2s'
  };
}

async function sendEmail(step: any, data: any): Promise<any> {
  // This would integrate with your email service
  return {
    success: true,
    emailsSent: 1,
    recipients: ['user@example.com']
  };
}

async function transformData(step: any, data: any): Promise<any> {
  // Data transformation logic
  return {
    success: true,
    transformedRecords: 1,
    output: data
  };
}

async function callWebhook(step: any, data: any): Promise<any> {
  // Webhook call logic
  return {
    success: true,
    response: 'Webhook called successfully'
  };
}

async function evaluateCondition(step: any, data: any): Promise<any> {
  // Condition evaluation logic
  return {
    success: true,
    conditionMet: true,
    nextAction: 'continue'
  };
}