import { Request, Response } from 'express';
import OpenAI from 'openai';
import { saveTask, getTasks } from '../services/taskService';
import { generateId } from '../utils/helpers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TaskType {
  id: string;
  query: string;
  type: 'summarize' | 'rewrite' | 'audit' | 'generate-copy' | 'insights';
  result: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'error';
}

/**
 * Process natural language queries using GPT-4
 */
export async function processNLPQuery(req: Request, res: Response) {
  try {
    const { query, type } = req.body;

    if (!query || !type) {
      return res.status(400).json({ error: 'Query and type are required' });
    }

    const taskId = generateId();
    
    // Save task as pending
    const task: TaskType = {
      id: taskId,
      query,
      type,
      result: '',
      timestamp: new Date(),
      status: 'pending'
    };
    
    await saveTask(task);

    // Generate AI response based on task type
    const prompt = buildPromptForType(type, query);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert AI assistant helping with business automation and optimization. Provide clear, actionable, and professional responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = completion.choices[0].message.content || 'No response generated';
    
    // Update task with result
    task.result = result;
    task.status = 'completed';
    await saveTask(task);

    res.json({
      taskId,
      result,
      type,
      timestamp: task.timestamp
    });

  } catch (error) {
    console.error('Error processing NLP query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
}

/**
 * Create and save a new automation task
 */
export async function createTask(req: Request, res: Response) {
  try {
    const { query, type, scheduledTime } = req.body;

    const task: TaskType = {
      id: generateId(),
      query,
      type,
      result: '',
      timestamp: scheduledTime ? new Date(scheduledTime) : new Date(),
      status: 'pending'
    };

    await saveTask(task);

    res.json({
      message: 'Task created successfully',
      taskId: task.id,
      task
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

/**
 * Run a comprehensive business audit using AI
 */
export async function runBusinessAudit(req: Request, res: Response) {
  try {
    const { businessData } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: 'Business data is required for audit' });
    }

    const taskId = generateId();
    
    const auditPrompt = `
    Conduct a comprehensive business audit based on the following data:
    
    ${JSON.stringify(businessData, null, 2)}
    
    Please provide:
    1. Key Strengths Analysis
    2. Areas for Improvement
    3. Automation Opportunities
    4. Growth Recommendations
    5. Risk Assessment
    6. Action Plan with Priorities
    
    Format your response as a structured business report with clear sections and actionable insights.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior business consultant and automation expert. Provide detailed, actionable business audits with specific recommendations for AI and automation implementation."
        },
        {
          role: "user",
          content: auditPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const auditResult = completion.choices[0].message.content || 'Audit could not be completed';
    
    // Save audit task
    const task: TaskType = {
      id: taskId,
      query: 'Business Audit',
      type: 'audit',
      result: auditResult,
      timestamp: new Date(),
      status: 'completed'
    };
    
    await saveTask(task);

    res.json({
      taskId,
      audit: auditResult,
      timestamp: task.timestamp
    });

  } catch (error) {
    console.error('Error running business audit:', error);
    res.status(500).json({ error: 'Failed to run business audit' });
  }
}

/**
 * Get all completed tasks and logs
 */
export async function getLogs(req: Request, res: Response) {
  try {
    const tasks = await getTasks();
    
    res.json({
      tasks: tasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      total: tasks.length
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

/**
 * Build appropriate prompt based on task type
 */
function buildPromptForType(type: string, query: string): string {
  const prompts = {
    summarize: `Please provide a clear, concise summary of the following content:\n\n${query}`,
    rewrite: `Please rewrite the following content to be more professional, clear, and engaging:\n\n${query}`,
    audit: `Please conduct a thorough analysis and audit of the following:\n\n${query}\n\nProvide specific recommendations and actionable insights.`,
    'generate-copy': `Please create compelling marketing copy based on the following brief:\n\n${query}`,
    insights: `Please analyze the following and provide strategic business insights:\n\n${query}`
  };

  return prompts[type as keyof typeof prompts] || `Please help with the following request:\n\n${query}`;
}