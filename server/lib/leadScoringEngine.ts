// AI-Powered Lead Scoring Engine for OmniFlow Platform
import { agentRouter } from './agentRouter';
import { persistentMemory } from './persistentMemory';
import { complianceLogger } from './complianceLogger';

interface LeadScore {
  overall: number;
  breakdown: {
    engagement: number;
    businessFit: number;
    automationReadiness: number;
    budgetPotential: number;
    urgency: number;
  };
  confidence: number;
  predictedLTV: number;
  conversionProbability: number;
  recommendedActions: string[];
  nextBestAction: string;
}

interface LeadSignal {
  type: 'behavioral' | 'demographic' | 'firmographic' | 'engagement';
  signal: string;
  value: any;
  timestamp: Date;
  weight: number;
}

export class LeadScoringEngine {
  private scoringWeights = {
    engagement: 0.25,      // How actively they engage with platform
    businessFit: 0.20,     // How well they fit target market
    automationReadiness: 0.20, // Technical readiness for automation
    budgetPotential: 0.20, // Ability to invest in services
    urgency: 0.15          // How urgently they need solutions
  };

  async scoreProspect(userId: string, additionalData?: any): Promise<LeadScore> {
    // Log the scoring activity for compliance
    await complianceLogger.logDataProcessing({
      userId,
      action: 'lead_scoring_analysis',
      service: 'advisory',
      dataType: 'business_data',
      sensitivity: 'internal',
      fields: ['business_profile', 'engagement_metrics', 'conversation_history'],
      purpose: 'Sales qualification and personalized service delivery',
      legalBasis: 'legitimate_interest'
    });

    const context = await persistentMemory.getUserContext(userId);
    const insights = await persistentMemory.getContextualInsights(userId);
    const signals = await this.gatherLeadSignals(userId, context);
    
    // Calculate individual component scores
    const engagement = await this.scoreEngagement(signals, context);
    const businessFit = await this.scoreBusinessFit(context.businessProfile);
    const automationReadiness = insights.automationReadiness;
    const budgetPotential = await this.scoreBudgetPotential(context.businessProfile);
    const urgency = await this.scoreUrgency(signals, context);

    // Calculate weighted overall score
    const overall = Math.round(
      engagement * this.scoringWeights.engagement +
      businessFit * this.scoringWeights.businessFit +
      automationReadiness * this.scoringWeights.automationReadiness +
      budgetPotential * this.scoringWeights.budgetPotential +
      urgency * this.scoringWeights.urgency
    );

    const breakdown = {
      engagement,
      businessFit,
      automationReadiness,
      budgetPotential,
      urgency
    };

    const confidence = this.calculateConfidence(signals.length, context.conversationHistory.length);
    const predictedLTV = this.predictLifetimeValue(breakdown, context.businessProfile);
    const conversionProbability = this.calculateConversionProbability(overall, breakdown);
    const recommendedActions = await this.generateRecommendedActions(overall, breakdown, context);
    const nextBestAction = recommendedActions[0] || 'Schedule discovery call';

    return {
      overall,
      breakdown,
      confidence,
      predictedLTV,
      conversionProbability,
      recommendedActions,
      nextBestAction
    };
  }

  private async gatherLeadSignals(userId: string, context: any): Promise<LeadSignal[]> {
    const signals: LeadSignal[] = [];
    
    // Behavioral signals from engagement
    if (context.conversationHistory.length > 0) {
      signals.push({
        type: 'behavioral',
        signal: 'platform_engagement',
        value: context.conversationHistory.length,
        timestamp: new Date(),
        weight: context.conversationHistory.length > 5 ? 0.8 : 0.4
      });
    }

    // Demographic signals
    if (context.businessProfile.industry) {
      const highValueIndustries = ['technology', 'finance', 'consulting', 'healthcare'];
      signals.push({
        type: 'demographic',
        signal: 'industry_fit',
        value: context.businessProfile.industry,
        timestamp: new Date(),
        weight: highValueIndustries.includes(context.businessProfile.industry) ? 0.8 : 0.5
      });
    }

    // Firmographic signals
    if (context.businessProfile.size) {
      const sizeValue = {
        'startup': 0.6,
        'small': 0.8,
        'medium': 0.9,
        'large': 0.7
      }[context.businessProfile.size] || 0.5;
      
      signals.push({
        type: 'firmographic',
        signal: 'company_size',
        value: context.businessProfile.size,
        timestamp: new Date(),
        weight: sizeValue
      });
    }

    // Pain point urgency signals
    const urgentChallenges = ['manual_processes', 'scaling', 'lead_management'];
    const hasUrgentChallenges = context.businessProfile.challenges?.some(
      challenge => urgentChallenges.includes(challenge)
    );
    
    if (hasUrgentChallenges) {
      signals.push({
        type: 'engagement',
        signal: 'urgent_pain_points',
        value: true,
        timestamp: new Date(),
        weight: 0.9
      });
    }

    return signals;
  }

  private async scoreEngagement(signals: LeadSignal[], context: any): Promise<number> {
    let score = 0;
    
    // Base engagement from conversation history
    const conversationCount = context.conversationHistory.length;
    if (conversationCount > 10) score += 40;
    else if (conversationCount > 5) score += 30;
    else if (conversationCount > 2) score += 20;
    else if (conversationCount > 0) score += 10;

    // Recent engagement (last 7 days)
    const recentEngagement = context.conversationHistory.filter(conv => 
      new Date(conv.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (recentEngagement > 3) score += 30;
    else if (recentEngagement > 1) score += 20;
    else if (recentEngagement > 0) score += 10;

    // Quality of engagement (automation-focused questions)
    const automationQueries = context.conversationHistory.filter(conv =>
      conv.query?.toLowerCase().includes('automat') ||
      conv.query?.toLowerCase().includes('process') ||
      conv.query?.toLowerCase().includes('efficiency')
    ).length;
    
    score += Math.min(automationQueries * 5, 30);

    return Math.min(score, 100);
  }

  private async scoreBusinessFit(businessProfile: any): Promise<number> {
    let score = 0;
    
    // Industry fit scoring
    const industryScores = {
      'technology': 90,
      'consulting': 85,
      'finance': 80,
      'healthcare': 75,
      'ecommerce': 70,
      'manufacturing': 65,
      'other': 50
    };
    score += industryScores[businessProfile.industry] || 50;

    // Size fit scoring - SMBs are sweet spot
    const sizeScores = {
      'startup': 70,
      'small': 90,
      'medium': 85,
      'large': 60
    };
    score += (sizeScores[businessProfile.size] || 50) * 0.3;

    // Goals alignment
    const alignedGoals = ['save_time', 'reduce_costs', 'scale_business', 'improve_accuracy'];
    const goalAlignment = businessProfile.goals?.filter(goal => 
      alignedGoals.includes(goal)
    ).length || 0;
    
    score += goalAlignment * 5;

    return Math.min(score, 100);
  }

  private async scoreBudgetPotential(businessProfile: any): Promise<number> {
    let score = 50; // Default moderate budget
    
    // Industry-based budget potential
    const highBudgetIndustries = ['technology', 'finance', 'consulting'];
    if (highBudgetIndustries.includes(businessProfile.industry)) {
      score += 30;
    }

    // Size-based budget scoring
    const sizeMultipliers = {
      'startup': 0.7,
      'small': 1.0,
      'medium': 1.3,
      'large': 1.1
    };
    score *= sizeMultipliers[businessProfile.size] || 1.0;

    // Challenge complexity indicates budget capacity
    const complexChallenges = ['scaling', 'reporting', 'communication'];
    const hasComplexChallenges = businessProfile.challenges?.some(challenge => 
      complexChallenges.includes(challenge)
    );
    
    if (hasComplexChallenges) score += 20;

    return Math.min(Math.round(score), 100);
  }

  private async scoreUrgency(signals: LeadSignal[], context: any): Promise<number> {
    let score = 0;
    
    // Recent engagement indicates urgency
    const recentSignals = signals.filter(signal => 
      new Date(signal.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    score += recentSignals.length * 10;

    // Urgent pain points
    const urgentSignal = signals.find(s => s.signal === 'urgent_pain_points');
    if (urgentSignal) score += 40;

    // Multiple conversations in short timeframe
    const recentConversations = context.conversationHistory.filter(conv =>
      new Date(conv.timestamp) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (recentConversations > 3) score += 30;
    else if (recentConversations > 1) score += 15;

    // Time-sensitive language analysis using AI
    if (context.conversationHistory.length > 0) {
      const urgencyScore = await this.analyzeUrgencyLanguage(context.conversationHistory);
      score += urgencyScore;
    }

    return Math.min(score, 100);
  }

  private async analyzeUrgencyLanguage(conversations: any[]): Promise<number> {
    const recentConversations = conversations.slice(-3);
    const conversationText = recentConversations.map(conv => conv.query).join(' ');
    
    try {
      const response = await agentRouter.routeRequest({
        query: `Analyze this text for urgency indicators and score from 0-30 based on how urgent their business needs seem: "${conversationText}"`,
        userTier: 'pro',
        context: 'urgency_analysis'
      });
      
      // Extract numerical score from response
      const match = response.content.match(/(\d+)/);
      return match ? Math.min(parseInt(match[1]), 30) : 10;
    } catch (error) {
      return 10; // Default moderate urgency if analysis fails
    }
  }

  private calculateConfidence(signalCount: number, conversationCount: number): number {
    let confidence = 50; // Base confidence
    
    // More signals = higher confidence
    confidence += Math.min(signalCount * 5, 30);
    
    // More conversations = higher confidence
    confidence += Math.min(conversationCount * 2, 20);
    
    return Math.min(confidence, 100);
  }

  private predictLifetimeValue(breakdown: any, businessProfile: any): number {
    let baseLTV = 5000; // Conservative base
    
    // Size multiplier
    const sizeMultipliers = {
      'startup': 0.6,
      'small': 1.0,
      'medium': 2.0,
      'large': 3.5
    };
    baseLTV *= sizeMultipliers[businessProfile.size] || 1.0;
    
    // Industry multiplier
    const industryMultipliers = {
      'technology': 1.5,
      'finance': 1.4,
      'consulting': 1.3,
      'healthcare': 1.2,
      'ecommerce': 1.0,
      'other': 0.8
    };
    baseLTV *= industryMultipliers[businessProfile.industry] || 1.0;
    
    // Automation readiness bonus
    if (breakdown.automationReadiness > 80) baseLTV *= 1.3;
    else if (breakdown.automationReadiness > 60) baseLTV *= 1.1;
    
    return Math.round(baseLTV);
  }

  private calculateConversionProbability(overall: number, breakdown: any): number {
    let probability = overall * 0.6; // Base from overall score
    
    // High engagement boosts conversion
    if (breakdown.engagement > 80) probability += 15;
    else if (breakdown.engagement > 60) probability += 10;
    
    // High urgency boosts conversion
    if (breakdown.urgency > 80) probability += 15;
    else if (breakdown.urgency > 60) probability += 10;
    
    // Budget concerns reduce conversion
    if (breakdown.budgetPotential < 40) probability -= 20;
    
    return Math.min(Math.max(probability, 5), 95);
  }

  private async generateRecommendedActions(overall: number, breakdown: any, context: any): Promise<string[]> {
    const actions: string[] = [];
    
    if (overall > 80) {
      actions.push('Schedule immediate consultation call');
      actions.push('Send customized proposal');
      actions.push('Offer pilot project assessment');
    } else if (overall > 60) {
      actions.push('Send case study relevant to their industry');
      actions.push('Schedule discovery call');
      actions.push('Provide ROI calculator');
    } else if (overall > 40) {
      actions.push('Send educational content about automation');
      actions.push('Invite to webinar or demo');
      actions.push('Follow up in 1 week');
    } else {
      actions.push('Add to nurture sequence');
      actions.push('Send industry insights newsletter');
      actions.push('Follow up in 2 weeks');
    }
    
    // Specific recommendations based on breakdown
    if (breakdown.engagement < 50) {
      actions.push('Send personalized video introduction');
    }
    
    if (breakdown.automationReadiness < 50) {
      actions.push('Provide automation readiness assessment');
    }
    
    if (breakdown.urgency > 80) {
      actions.unshift('Contact within 24 hours');
    }
    
    return actions.slice(0, 4); // Return top 4 recommendations
  }

  async batchScoreLeads(userIds: string[]): Promise<Map<string, LeadScore>> {
    const scores = new Map<string, LeadScore>();
    
    for (const userId of userIds) {
      try {
        const score = await this.scoreProspect(userId);
        scores.set(userId, score);
      } catch (error) {
        console.error(`Failed to score lead ${userId}:`, error);
      }
    }
    
    return scores;
  }

  async getTopProspects(limit: number = 10): Promise<Array<{userId: string, score: LeadScore}>> {
    // In production, this would query all active prospects
    // For now, return sample implementation
    return [];
  }
}

export const leadScoringEngine = new LeadScoringEngine();