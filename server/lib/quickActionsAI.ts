import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'content' | 'marketing' | 'operations' | 'analysis' | 'communication';
  priority: number;
  action: string;
  estimatedTime: string;
  businessImpact: 'high' | 'medium' | 'low';
}

export interface ContextData {
  currentPage?: string;
  userRole?: string;
  businessType?: string;
  selectedText?: string;
  timeOfDay?: string;
  recentActions?: string[];
  businessGoals?: string[];
}

/**
 * Generate contextual quick actions using AI
 */
export async function generateContextualActions(context: ContextData): Promise<QuickAction[]> {
  try {
    const prompt = buildContextualPrompt(context);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI business automation assistant specializing in small business operations. Generate practical, actionable quick actions based on the user's current context. Focus on high-impact activities that save time and drive growth."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.actions || getDefaultActions();
    
  } catch (error) {
    console.error('Error generating contextual actions:', error);
    return getDefaultActions();
  }
}

/**
 * Build AI prompt based on user context
 */
function buildContextualPrompt(context: ContextData): string {
  const timeOfDay = context.timeOfDay || new Date().getHours() < 12 ? 'morning' : 'afternoon';
  
  return `
    Generate 6-8 relevant quick actions for a small business owner based on this context:
    
    Current Context:
    - Page: ${context.currentPage || 'dashboard'}
    - Business Type: ${context.businessType || 'general small business'}
    - Time of Day: ${timeOfDay}
    - Selected Content: ${context.selectedText ? 'Yes - text selected' : 'No'}
    - Recent Actions: ${context.recentActions?.join(', ') || 'None'}
    - Business Goals: ${context.businessGoals?.join(', ') || 'Growth and efficiency'}
    
    Requirements:
    - Focus on actions that can be completed in 5-30 minutes
    - Prioritize high-impact business activities
    - Include mix of content, marketing, and operational tasks
    - Make suggestions specific and actionable
    - Consider the time of day for appropriate tasks
    
    Return JSON in this exact format:
    {
      "actions": [
        {
          "id": "unique_id",
          "title": "Action Title (under 40 chars)",
          "description": "Brief description of what this does (under 80 chars)",
          "icon": "single emoji",
          "category": "content|marketing|operations|analysis|communication",
          "priority": 1-10,
          "action": "automation_type",
          "estimatedTime": "5-15 min",
          "businessImpact": "high|medium|low"
        }
      ]
    }
  `;
}

/**
 * Get default actions when AI is unavailable
 */
function getDefaultActions(): QuickAction[] {
  return [
    {
      id: "content_summarize",
      title: "📝 Summarize Content",
      description: "Quickly summarize long documents or articles",
      icon: "📝",
      category: "content",
      priority: 8,
      action: "summarize",
      estimatedTime: "2-5 min",
      businessImpact: "medium"
    },
    {
      id: "marketing_copy",
      title: "💡 Generate Marketing Copy",
      description: "Create compelling marketing content for your business",
      icon: "💡",
      category: "marketing",
      priority: 9,
      action: "generate-copy",
      estimatedTime: "5-10 min",
      businessImpact: "high"
    },
    {
      id: "business_insights",
      title: "📊 Business Analysis",
      description: "Get insights from your business data and trends",
      icon: "📊",
      category: "analysis",
      priority: 7,
      action: "insights",
      estimatedTime: "10-15 min",
      businessImpact: "high"
    },
    {
      id: "content_rewrite",
      title: "✏️ Improve Content",
      description: "Enhance and optimize existing content",
      icon: "✏️",
      category: "content",
      priority: 6,
      action: "rewrite",
      estimatedTime: "5-10 min",
      businessImpact: "medium"
    },
    {
      id: "email_draft",
      title: "📧 Draft Email",
      description: "Create professional email templates",
      icon: "📧",
      category: "communication",
      priority: 5,
      action: "email-draft",
      estimatedTime: "3-8 min",
      businessImpact: "medium"
    },
    {
      id: "social_content",
      title: "📱 Social Media Post",
      description: "Generate engaging social media content",
      icon: "📱",
      category: "marketing",
      priority: 7,
      action: "social-media",
      estimatedTime: "5-10 min",
      businessImpact: "medium"
    }
  ];
}

/**
 * Analyze user behavior to improve recommendations
 */
export async function analyzeUserPatterns(userId: string, actions: string[]): Promise<string[]> {
  // This would analyze user patterns and return preferred categories
  // For now, return common patterns for SMB owners
  return ['content', 'marketing', 'analysis'];
}

/**
 * Get actions filtered by category
 */
export function filterActionsByCategory(actions: QuickAction[], category: string): QuickAction[] {
  return actions.filter(action => action.category === category);
}

/**
 * Get high-priority actions only
 */
export function getHighPriorityActions(actions: QuickAction[]): QuickAction[] {
  return actions.filter(action => action.priority >= 7).sort((a, b) => b.priority - a.priority);
}