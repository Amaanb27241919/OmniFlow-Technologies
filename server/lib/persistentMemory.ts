// Persistent Memory Layer - Maintains context across user sessions and agent interactions
interface UserContext {
  userId: string;
  businessProfile: {
    industry: string;
    size: string;
    challenges: string[];
    goals: string[];
    currentTools: string[];
  };
  conversationHistory: ConversationEntry[];
  automationJourney: AutomationStage[];
  preferences: UserPreferences;
  lastUpdated: Date;
}

interface ConversationEntry {
  timestamp: Date;
  query: string;
  response: string;
  model: string;
  confidence: number;
  actionItems?: string[];
  automationOpportunities?: string[];
}

interface AutomationStage {
  stage: 'intake' | 'audit' | 'analysis' | 'report' | 'implementation';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  data: any;
  completedAt?: Date;
  nextSteps?: string[];
}

interface UserPreferences {
  communicationStyle: 'technical' | 'business' | 'simple';
  focusAreas: string[];
  timeZone: string;
  reportFormat: 'detailed' | 'summary' | 'executive';
}

export class PersistentMemoryManager {
  private userContexts = new Map<string, UserContext>();
  private conversationSummaries = new Map<string, string>();

  constructor() {
    // Initialize with any existing context from storage
    this.loadExistingContexts();
  }

  // Core context management
  async getUserContext(userId: string): Promise<UserContext> {
    if (!this.userContexts.has(userId)) {
      const newContext = await this.initializeUserContext(userId);
      this.userContexts.set(userId, newContext);
      return newContext;
    }
    return this.userContexts.get(userId)!;
  }

  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const context = await this.getUserContext(userId);
    const updatedContext = {
      ...context,
      ...updates,
      lastUpdated: new Date()
    };
    this.userContexts.set(userId, updatedContext);
    await this.persistContext(userId, updatedContext);
  }

  // Conversation tracking for contextual responses
  async addConversation(userId: string, entry: ConversationEntry): Promise<void> {
    const context = await this.getUserContext(userId);
    context.conversationHistory.push(entry);
    
    // Keep only last 50 conversations for performance
    if (context.conversationHistory.length > 50) {
      context.conversationHistory = context.conversationHistory.slice(-50);
    }
    
    // Update conversation summary for long-term context
    await this.updateConversationSummary(userId, entry);
    await this.updateUserContext(userId, { conversationHistory: context.conversationHistory });
  }

  // Business profile building for personalized recommendations
  async updateBusinessProfile(userId: string, profileData: Partial<UserContext['businessProfile']>): Promise<void> {
    const context = await this.getUserContext(userId);
    context.businessProfile = {
      ...context.businessProfile,
      ...profileData
    };
    await this.updateUserContext(userId, { businessProfile: context.businessProfile });
  }

  // Automation journey tracking for service-to-SaaS pipeline
  async updateAutomationStage(userId: string, stage: AutomationStage): Promise<void> {
    const context = await this.getUserContext(userId);
    const existingStageIndex = context.automationJourney.findIndex(s => s.stage === stage.stage);
    
    if (existingStageIndex >= 0) {
      context.automationJourney[existingStageIndex] = stage;
    } else {
      context.automationJourney.push(stage);
    }
    
    await this.updateUserContext(userId, { automationJourney: context.automationJourney });
  }

  // Get contextual insights for better responses
  async getContextualInsights(userId: string): Promise<{
    businessSummary: string;
    automationReadiness: number;
    recommendedNextSteps: string[];
    potentialROI: string;
  }> {
    const context = await this.getUserContext(userId);
    
    return {
      businessSummary: this.generateBusinessSummary(context),
      automationReadiness: this.calculateAutomationReadiness(context),
      recommendedNextSteps: this.getRecommendedNextSteps(context),
      potentialROI: this.estimatePotentialROI(context)
    };
  }

  // Context-aware query enhancement
  async enhanceQuery(userId: string, query: string): Promise<string> {
    const context = await this.getUserContext(userId);
    const summary = this.conversationSummaries.get(userId) || '';
    
    const enhancedQuery = `
Business Context: ${context.businessProfile.industry} company, ${context.businessProfile.size} size
Current Challenges: ${context.businessProfile.challenges.join(', ')}
Previous Conversation Summary: ${summary}
Current Tools: ${context.businessProfile.currentTools.join(', ')}

User Query: ${query}

Please provide advice that considers their specific business context and automation journey stage.
    `.trim();
    
    return enhancedQuery;
  }

  // Private helper methods
  private async initializeUserContext(userId: string): Promise<UserContext> {
    return {
      userId,
      businessProfile: {
        industry: '',
        size: '',
        challenges: [],
        goals: [],
        currentTools: []
      },
      conversationHistory: [],
      automationJourney: [],
      preferences: {
        communicationStyle: 'business',
        focusAreas: [],
        timeZone: 'UTC',
        reportFormat: 'summary'
      },
      lastUpdated: new Date()
    };
  }

  private async loadExistingContexts(): Promise<void> {
    // In production, this would load from database
    // For now, we'll start fresh each session
  }

  private async persistContext(userId: string, context: UserContext): Promise<void> {
    // In production, this would save to database
    // For now, we keep in memory
  }

  private async updateConversationSummary(userId: string, entry: ConversationEntry): Promise<void> {
    const currentSummary = this.conversationSummaries.get(userId) || '';
    
    // Create a running summary of key points
    const newSummary = this.summarizeConversation(currentSummary, entry);
    this.conversationSummaries.set(userId, newSummary);
  }

  private summarizeConversation(currentSummary: string, entry: ConversationEntry): string {
    // Extract key business insights and automation opportunities
    const keyPoints = [];
    
    if (entry.automationOpportunities?.length) {
      keyPoints.push(`Automation opportunities: ${entry.automationOpportunities.join(', ')}`);
    }
    
    if (entry.actionItems?.length) {
      keyPoints.push(`Action items: ${entry.actionItems.join(', ')}`);
    }
    
    const newSummaryPart = keyPoints.join('; ');
    return currentSummary ? `${currentSummary}; ${newSummaryPart}` : newSummaryPart;
  }

  private generateBusinessSummary(context: UserContext): string {
    const { businessProfile } = context;
    return `${businessProfile.industry} company (${businessProfile.size}) focused on ${businessProfile.goals.join(', ')}. Current challenges include ${businessProfile.challenges.join(', ')}.`;
  }

  private calculateAutomationReadiness(context: UserContext): number {
    let score = 0;
    
    // Business profile completeness
    if (context.businessProfile.industry) score += 20;
    if (context.businessProfile.challenges.length > 0) score += 20;
    if (context.businessProfile.goals.length > 0) score += 20;
    
    // Automation journey progress
    const completedStages = context.automationJourney.filter(s => s.status === 'completed').length;
    score += completedStages * 10;
    
    // Engagement level
    if (context.conversationHistory.length > 5) score += 20;
    if (context.conversationHistory.length > 10) score += 10;
    
    return Math.min(score, 100);
  }

  private getRecommendedNextSteps(context: UserContext): string[] {
    const steps = [];
    const readiness = this.calculateAutomationReadiness(context);
    
    if (readiness < 40) {
      steps.push('Complete business profile assessment');
      steps.push('Identify top 3 business challenges');
    } else if (readiness < 70) {
      steps.push('Schedule automation audit consultation');
      steps.push('Review automation blueprint options');
    } else {
      steps.push('Begin automation implementation');
      steps.push('Set up success metrics tracking');
    }
    
    return steps;
  }

  private estimatePotentialROI(context: UserContext): string {
    const { businessProfile } = context;
    
    // Simple ROI estimation based on business size and challenges
    const baseROI = {
      'startup': 5000,
      'small': 15000,
      'medium': 35000,
      'large': 75000
    };
    
    const sizeMultiplier = baseROI[businessProfile.size] || 15000;
    const challengeMultiplier = businessProfile.challenges.length * 0.2 + 1;
    
    const estimatedROI = Math.round(sizeMultiplier * challengeMultiplier);
    return `$${estimatedROI.toLocaleString()}/year`;
  }
}

export const persistentMemory = new PersistentMemoryManager();