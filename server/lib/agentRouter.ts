// Intelligent Agent Middleware - Routes requests to optimal LLM based on complexity and cost
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface AgentRequest {
  query: string;
  context?: string;
  userTier: 'pro_bono' | 'pro' | 'enterprise';
  complexity?: 'simple' | 'medium' | 'complex';
  expectedTokens?: number;
}

interface AgentResponse {
  content: string;
  model: string;
  tokens: number;
  cost: number;
  confidence: number;
}

export class AgentRouter {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private costThresholds = {
    pro_bono: 0.01,    // 1 cent max per query
    pro: 0.05,         // 5 cents max per query  
    enterprise: 0.25   // 25 cents max per query
  };

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async routeRequest(request: AgentRequest): Promise<AgentResponse> {
    const optimalModel = this.selectOptimalModel(request);
    
    try {
      switch (optimalModel.provider) {
        case 'openai':
          return await this.queryOpenAI(request, optimalModel.model);
        case 'anthropic':
          return await this.queryAnthropic(request, optimalModel.model);
        case 'perplexity':
          return await this.queryPerplexity(request);
        default:
          throw new Error('No suitable model available');
      }
    } catch (error) {
      console.error('Agent routing error:', error);
      // Fallback to most cost-effective option
      return await this.queryOpenAI(request, 'gpt-3.5-turbo');
    }
  }

  private selectOptimalModel(request: AgentRequest) {
    const complexity = this.analyzeComplexity(request.query);
    const maxCost = this.costThresholds[request.userTier];
    
    // Enterprise users get best models for complex queries
    if (request.userTier === 'enterprise' && complexity === 'complex') {
      return { provider: 'anthropic', model: 'claude-3-7-sonnet-20250219' };
    }
    
    // Pro users get GPT-4o for medium/complex queries
    if (request.userTier === 'pro' && complexity !== 'simple') {
      return { provider: 'openai', model: 'gpt-4o' };
    }
    
    // Cost-optimized routing for pro bono users
    if (request.userTier === 'pro_bono') {
      return complexity === 'simple' 
        ? { provider: 'openai', model: 'gpt-3.5-turbo' }
        : { provider: 'perplexity', model: 'llama-3.1-sonar-small-128k-online' };
    }
    
    return { provider: 'openai', model: 'gpt-4o' };
  }

  private analyzeComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const complexityIndicators = {
      simple: ['what', 'how much', 'when', 'where', 'yes', 'no'],
      complex: ['analyze', 'strategy', 'optimize', 'design', 'architecture', 'implement']
    };
    
    const lowerQuery = query.toLowerCase();
    
    if (complexityIndicators.complex.some(word => lowerQuery.includes(word))) {
      return 'complex';
    }
    
    if (complexityIndicators.simple.some(word => lowerQuery.includes(word))) {
      return 'simple';
    }
    
    return query.length > 100 ? 'medium' : 'simple';
  }

  private async queryOpenAI(request: AgentRequest, model: string): Promise<AgentResponse> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert business automation consultant for OmniFlow Advisory. Provide actionable, specific advice that leads to automation opportunities.'
        },
        {
          role: 'user', 
          content: request.context ? `Context: ${request.context}\n\nQuery: ${request.query}` : request.query
        }
      ],
      max_tokens: request.expectedTokens || 500
    });

    const tokens = completion.usage?.total_tokens || 0;
    return {
      content: completion.choices[0].message.content || '',
      model,
      tokens,
      cost: this.calculateOpenAICost(model, tokens),
      confidence: 0.9
    };
  }

  private async queryAnthropic(request: AgentRequest, model: string): Promise<AgentResponse> {
    const completion = await this.anthropic.messages.create({
      model,
      system: 'You are an expert business automation consultant for OmniFlow Advisory. Provide actionable, specific advice that leads to automation opportunities.',
      messages: [
        {
          role: 'user',
          content: request.context ? `Context: ${request.context}\n\nQuery: ${request.query}` : request.query
        }
      ],
      max_tokens: request.expectedTokens || 500
    });

    const tokens = completion.usage.input_tokens + completion.usage.output_tokens;
    return {
      content: completion.content[0].type === 'text' ? completion.content[0].text : '',
      model,
      tokens,
      cost: this.calculateAnthropicCost(model, tokens),
      confidence: 0.95
    };
  }

  private async queryPerplexity(request: AgentRequest): Promise<AgentResponse> {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business automation consultant for OmniFlow Advisory with access to current market data.'
          },
          {
            role: 'user',
            content: request.query
          }
        ],
        max_tokens: request.expectedTokens || 500
      })
    });

    const data = await response.json();
    const tokens = data.usage?.total_tokens || 0;
    
    return {
      content: data.choices[0].message.content,
      model: 'llama-3.1-sonar-small-128k-online',
      tokens,
      cost: this.calculatePerplexityCost(tokens),
      confidence: 0.8
    };
  }

  private calculateOpenAICost(model: string, tokens: number): number {
    const rates = {
      'gpt-4o': 0.005 / 1000,           // $5 per 1M tokens
      'gpt-3.5-turbo': 0.0005 / 1000    // $0.5 per 1M tokens
    };
    return (rates[model] || 0.005 / 1000) * tokens;
  }

  private calculateAnthropicCost(model: string, tokens: number): number {
    // Claude pricing - roughly $3 per 1M tokens
    return 0.003 / 1000 * tokens;
  }

  private calculatePerplexityCost(tokens: number): number {
    // Perplexity pricing - roughly $1 per 1M tokens
    return 0.001 / 1000 * tokens;
  }
}

export const agentRouter = new AgentRouter();