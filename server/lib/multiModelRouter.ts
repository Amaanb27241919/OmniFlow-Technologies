import OpenAI from 'openai';

interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'perplexity';
  model: string;
  costPerToken: number;
  contextLimit: number;
  strengths: string[];
}

interface ModelResponse {
  response: string;
  model: string;
  tokensUsed: number;
  cost: number;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    costPerToken: 0.00001,
    contextLimit: 128000,
    strengths: ['general', 'analysis', 'creative', 'code']
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    costPerToken: 0.000001,
    contextLimit: 128000,
    strengths: ['cost-effective', 'general', 'fast']
  },
  'claude-3-sonnet': {
    name: 'Claude-3 Sonnet',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    costPerToken: 0.000015,
    contextLimit: 200000,
    strengths: ['analysis', 'reasoning', 'long-context', 'financial']
  },
  'perplexity-sonar': {
    name: 'Perplexity Sonar',
    provider: 'perplexity',
    model: 'llama-3.1-sonar-small-128k-online',
    costPerToken: 0.000005,
    contextLimit: 128000,
    strengths: ['research', 'current-events', 'citations', 'factual']
  }
};

export class MultiModelRouter {
  private openai: OpenAI;
  private anthropic: any;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Initialize Anthropic if available
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
      } catch (error) {
        console.log('Anthropic SDK not available');
      }
    }
  }

  /**
   * Route query to optimal model based on content analysis
   */
  async routeQuery(query: string, userTier: string = 'pro_bono'): Promise<ModelResponse> {
    const selectedModel = this.selectOptimalModel(query, userTier);
    
    try {
      return await this.executeQuery(query, selectedModel);
    } catch (error) {
      console.error(`Error with ${selectedModel}, falling back to GPT-4o Mini:`, error);
      return await this.executeQuery(query, 'gpt-4o-mini');
    }
  }

  /**
   * Select optimal model based on query analysis and user tier
   */
  private selectOptimalModel(query: string, userTier: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Cost-conscious routing for pro bono users
    if (userTier === 'pro_bono') {
      // Use most cost-effective model
      return 'gpt-4o-mini';
    }
    
    // Advanced routing for paid tiers
    if (userTier === 'professional' || userTier === 'enterprise') {
      // Financial analysis - use Claude for better reasoning
      if (lowerQuery.includes('financial') || lowerQuery.includes('budget') || 
          lowerQuery.includes('roi') || lowerQuery.includes('cost') ||
          lowerQuery.includes('revenue') || lowerQuery.includes('profit')) {
        return this.anthropic ? 'claude-3-sonnet' : 'gpt-4o';
      }
      
      // Research/factual queries - use Perplexity for current data
      if (lowerQuery.includes('research') || lowerQuery.includes('current') ||
          lowerQuery.includes('latest') || lowerQuery.includes('news') ||
          lowerQuery.includes('market trends')) {
        return process.env.PERPLEXITY_API_KEY ? 'perplexity-sonar' : 'gpt-4o';
      }
      
      // Long documents or complex analysis - use Claude
      if (query.length > 2000 || lowerQuery.includes('analyze') || 
          lowerQuery.includes('review') || lowerQuery.includes('strategy')) {
        return this.anthropic ? 'claude-3-sonnet' : 'gpt-4o';
      }
    }
    
    // Default to GPT-4o for starter tier and general queries
    return 'gpt-4o';
  }

  /**
   * Execute query with selected model
   */
  private async executeQuery(query: string, modelKey: string): Promise<ModelResponse> {
    const modelConfig = AVAILABLE_MODELS[modelKey];
    const systemPrompt = this.getSystemPrompt();
    
    switch (modelConfig.provider) {
      case 'openai':
        return await this.executeOpenAI(query, modelConfig, systemPrompt);
      case 'anthropic':
        return await this.executeAnthropic(query, modelConfig, systemPrompt);
      case 'perplexity':
        return await this.executePerplexity(query, modelConfig, systemPrompt);
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }
  }

  private async executeOpenAI(query: string, config: ModelConfig, systemPrompt: string): Promise<ModelResponse> {
    const completion = await this.openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    return {
      response,
      model: config.name,
      tokensUsed,
      cost: tokensUsed * config.costPerToken
    };
  }

  private async executeAnthropic(query: string, config: ModelConfig, systemPrompt: string): Promise<ModelResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic not configured');
    }

    const message = await this.anthropic.messages.create({
      model: config.model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }]
    });

    const response = message.content[0]?.text || 'No response generated';
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;
    
    return {
      response,
      model: config.name,
      tokensUsed,
      cost: tokensUsed * config.costPerToken
    };
  }

  private async executePerplexity(query: string, config: ModelConfig, systemPrompt: string): Promise<ModelResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        return_citations: true
      })
    });

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || 'No response generated';
    const tokensUsed = data.usage?.total_tokens || 0;
    
    return {
      response: responseText,
      model: config.name,
      tokensUsed,
      cost: tokensUsed * config.costPerToken
    };
  }

  private getSystemPrompt(): string {
    return `You are an expert AI business automation consultant for OmniCore. You help small businesses implement AI automation. Provide practical, actionable advice focused on:

- Business automation strategy and implementation
- AI tool recommendations and integration  
- Workflow optimization and process improvement
- ROI calculation and business growth strategies
- Content creation and marketing automation
- Customer relationship management automation
- Data analysis and business insights

Keep responses helpful, professional, and focused on business value. When suggesting automation tools or strategies, explain the benefits and potential ROI.`;
  }

  /**
   * Get available models for user tier
   */
  getAvailableModels(userTier: string): string[] {
    if (userTier === 'pro_bono') {
      return ['gpt-4o-mini'];
    }
    if (userTier === 'starter') {
      return ['gpt-4o-mini', 'gpt-4o'];
    }
    return Object.keys(AVAILABLE_MODELS);
  }

  /**
   * Get cost optimization suggestions
   */
  getCostAnalysis(usage: { model: string; tokensUsed: number; cost: number }[]): {
    totalCost: number;
    suggestions: string[];
  } {
    const totalCost = usage.reduce((sum, u) => sum + u.cost, 0);
    const suggestions: string[] = [];
    
    if (totalCost > 10) {
      suggestions.push('Consider using GPT-4o Mini for simpler queries to reduce costs');
    }
    
    const expensiveQueries = usage.filter(u => u.cost > 0.01);
    if (expensiveQueries.length > 0) {
      suggestions.push('Some queries used high-cost models - review query complexity');
    }
    
    return { totalCost, suggestions };
  }
}

export const multiModelRouter = new MultiModelRouter();