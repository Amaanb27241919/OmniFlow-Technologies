interface UserEvent {
  userId: string;
  event: string;
  timestamp: Date;
  metadata: Record<string, any>;
  sessionId: string;
}

interface ConversionMetrics {
  totalUsers: number;
  proBonoUsers: number;
  starterUsers: number;
  professionalUsers: number;
  enterpriseUsers: number;
  conversionRate: number;
  avgTimeToConversion: number;
  churnRate: number;
}

interface UsageMetrics {
  totalChats: number;
  totalAutomations: number;
  avgChatsPerUser: number;
  avgAutomationsPerUser: number;
  costPerUser: number;
  revenuePerUser: number;
}

interface ClientInsight {
  userId: string;
  tier: string;
  totalChats: number;
  totalAutomations: number;
  lastActive: Date;
  conversionProbability: number;
  recommendedActions: string[];
  lifetimeValue: number;
}

export class AdvancedAnalyticsEngine {
  private events: UserEvent[] = [];
  private conversions: Map<string, Date> = new Map();

  constructor() {
    this.loadAnalyticsData();
  }

  /**
   * Track user event for analytics
   */
  trackEvent(userId: string, event: string, metadata: Record<string, any> = {}): void {
    const userEvent: UserEvent = {
      userId,
      event,
      timestamp: new Date(),
      metadata,
      sessionId: this.getSessionId(userId)
    };

    this.events.push(userEvent);
    this.saveAnalyticsData();

    // Track conversions
    if (event === 'tier_upgrade') {
      this.conversions.set(userId, new Date());
    }
  }

  /**
   * Generate comprehensive conversion metrics
   */
  getConversionMetrics(): ConversionMetrics {
    const { featureFlagManager } = require('./featureFlags');
    const allUsers = this.getAllUniqueUsers();
    
    const tierCounts = {
      pro_bono: 0,
      starter: 0,
      professional: 0,
      enterprise: 0
    };

    const conversionTimes: number[] = [];

    allUsers.forEach(userId => {
      const userUsage = featureFlagManager.getUserUsage(userId);
      tierCounts[userUsage.tier as keyof typeof tierCounts]++;

      // Calculate time to conversion
      const firstEvent = this.events.find(e => e.userId === userId);
      const conversionDate = this.conversions.get(userId);
      
      if (firstEvent && conversionDate) {
        const timeToConversion = conversionDate.getTime() - firstEvent.timestamp.getTime();
        conversionTimes.push(timeToConversion / (1000 * 60 * 60 * 24)); // Convert to days
      }
    });

    const paidUsers = tierCounts.starter + tierCounts.professional + tierCounts.enterprise;
    const conversionRate = allUsers.length > 0 ? (paidUsers / allUsers.length) * 100 : 0;
    const avgTimeToConversion = conversionTimes.length > 0 
      ? conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length 
      : 0;

    return {
      totalUsers: allUsers.length,
      proBonoUsers: tierCounts.pro_bono,
      starterUsers: tierCounts.starter,
      professionalUsers: tierCounts.professional,
      enterpriseUsers: tierCounts.enterprise,
      conversionRate,
      avgTimeToConversion,
      churnRate: this.calculateChurnRate()
    };
  }

  /**
   * Generate detailed usage metrics
   */
  getUsageMetrics(): UsageMetrics {
    const { featureFlagManager } = require('./featureFlags');
    const { multiModelRouter } = require('./multiModelRouter');
    
    const allUsers = this.getAllUniqueUsers();
    let totalChats = 0;
    let totalAutomations = 0;
    let totalCost = 0;
    let totalRevenue = 0;

    allUsers.forEach(userId => {
      const userUsage = featureFlagManager.getUserUsage(userId);
      totalChats += userUsage.chatCount;
      
      // Get automation count from events
      const automationEvents = this.events.filter(e => 
        e.userId === userId && e.event === 'automation_created'
      );
      totalAutomations += automationEvents.length;

      // Calculate revenue based on tier
      const monthlyRevenue = this.getTierRevenue(userUsage.tier);
      totalRevenue += monthlyRevenue;

      // Estimate costs (this would be more accurate with actual API costs)
      const estimatedCost = userUsage.chatCount * 0.01; // $0.01 per chat estimate
      totalCost += estimatedCost;
    });

    return {
      totalChats,
      totalAutomations,
      avgChatsPerUser: allUsers.length > 0 ? totalChats / allUsers.length : 0,
      avgAutomationsPerUser: allUsers.length > 0 ? totalAutomations / allUsers.length : 0,
      costPerUser: allUsers.length > 0 ? totalCost / allUsers.length : 0,
      revenuePerUser: allUsers.length > 0 ? totalRevenue / allUsers.length : 0
    };
  }

  /**
   * Generate client insights for individual users
   */
  generateClientInsights(): ClientInsight[] {
    const { featureFlagManager } = require('./featureFlags');
    const allUsers = this.getAllUniqueUsers();
    
    return allUsers.map(userId => {
      const userUsage = featureFlagManager.getUserUsage(userId);
      const userEvents = this.events.filter(e => e.userId === userId);
      
      const lastEvent = userEvents[userEvents.length - 1];
      const lastActive = lastEvent ? lastEvent.timestamp : new Date();
      
      const conversionProbability = this.calculateConversionProbability(userId);
      const recommendedActions = this.generateRecommendedActions(userId, userUsage);
      const lifetimeValue = this.calculateLifetimeValue(userId);

      return {
        userId,
        tier: userUsage.tier,
        totalChats: userUsage.chatCount,
        totalAutomations: userEvents.filter(e => e.event === 'automation_created').length,
        lastActive,
        conversionProbability,
        recommendedActions,
        lifetimeValue
      };
    });
  }

  /**
   * Get trend analysis over time
   */
  getTrendAnalysis(days: number = 30): {
    dailySignups: number[];
    dailyConversions: number[];
    dailyChats: number[];
    labels: string[];
  } {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const dailySignups: number[] = [];
    const dailyConversions: number[] = [];
    const dailyChats: number[] = [];
    const labels: string[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateStr = currentDate.toISOString().split('T')[0];
      labels.push(dateStr);

      // Count events for this day
      const dayEvents = this.events.filter(e => 
        e.timestamp.toISOString().split('T')[0] === dateStr
      );

      dailySignups.push(dayEvents.filter(e => e.event === 'user_signup').length);
      dailyConversions.push(dayEvents.filter(e => e.event === 'tier_upgrade').length);
      dailyChats.push(dayEvents.filter(e => e.event === 'chat_message').length);
    }

    return { dailySignups, dailyConversions, dailyChats, labels };
  }

  /**
   * Generate automated insights and recommendations
   */
  generateBusinessInsights(): {
    insights: string[];
    alerts: string[];
    opportunities: string[];
  } {
    const metrics = this.getConversionMetrics();
    const usage = this.getUsageMetrics();
    
    const insights: string[] = [];
    const alerts: string[] = [];
    const opportunities: string[] = [];

    // Conversion insights
    if (metrics.conversionRate < 5) {
      alerts.push(`Low conversion rate (${metrics.conversionRate.toFixed(1)}%) - consider improving onboarding`);
    } else if (metrics.conversionRate > 15) {
      insights.push(`Excellent conversion rate (${metrics.conversionRate.toFixed(1)}%) - scaling opportunity`);
    }

    // Usage insights
    if (usage.avgChatsPerUser > 8) {
      insights.push('High user engagement - users are finding significant value');
      opportunities.push('Consider introducing premium features for power users');
    }

    // Churn insights
    if (metrics.churnRate > 20) {
      alerts.push(`High churn rate (${metrics.churnRate.toFixed(1)}%) - investigate user satisfaction`);
    }

    // Revenue insights
    if (usage.revenuePerUser > usage.costPerUser * 3) {
      insights.push('Healthy unit economics - profitable user acquisition possible');
      opportunities.push('Scale marketing to acquire more users');
    }

    return { insights, alerts, opportunities };
  }

  private getAllUniqueUsers(): string[] {
    const users = new Set(this.events.map(e => e.userId));
    return Array.from(users);
  }

  private getSessionId(userId: string): string {
    // Simple session ID based on user and hour
    const hour = new Date().getHours();
    return `${userId}-${hour}`;
  }

  private calculateChurnRate(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = this.events.filter(e => e.timestamp > thirtyDaysAgo);
    const allUsers = this.getAllUniqueUsers();
    
    if (allUsers.length === 0) return 0;
    
    const activeUserIds = new Set(activeUsers.map(e => e.userId));
    const churnedUsers = allUsers.length - activeUserIds.size;
    
    return (churnedUsers / allUsers.length) * 100;
  }

  private getTierRevenue(tier: string): number {
    const revenueMap = {
      'pro_bono': 0,
      'starter': 97,
      'professional': 197,
      'enterprise': 497
    };
    return revenueMap[tier as keyof typeof revenueMap] || 0;
  }

  private calculateConversionProbability(userId: string): number {
    const userEvents = this.events.filter(e => e.userId === userId);
    const { featureFlagManager } = require('./featureFlags');
    const userUsage = featureFlagManager.getUserUsage(userId);
    
    let probability = 0;
    
    // Base probability on tier
    if (userUsage.tier === 'pro_bono') {
      probability = 10; // 10% base for pro bono users
    } else {
      return 0; // Already converted
    }
    
    // Increase based on usage
    const usageRatio = userUsage.chatCount / 10; // Out of 10 allowed
    probability += usageRatio * 30; // Up to 30% more
    
    // Increase based on engagement
    const engagementEvents = userEvents.filter(e => 
      ['chat_message', 'automation_created', 'audit_completed'].includes(e.event)
    );
    probability += Math.min(engagementEvents.length * 5, 40); // Up to 40% more
    
    return Math.min(probability, 95); // Cap at 95%
  }

  private generateRecommendedActions(userId: string, userUsage: any): string[] {
    const actions: string[] = [];
    const userEvents = this.events.filter(e => e.userId === userId);
    
    if (userUsage.tier === 'pro_bono' && userUsage.chatCount >= 8) {
      actions.push('Send upgrade reminder - approaching chat limit');
    }
    
    if (userEvents.length > 10 && userUsage.tier === 'pro_bono') {
      actions.push('Offer personalized demo of premium features');
    }
    
    const lastEvent = userEvents[userEvents.length - 1];
    if (lastEvent && Date.now() - lastEvent.timestamp.getTime() > 7 * 24 * 60 * 60 * 1000) {
      actions.push('Re-engagement email - user inactive for 7+ days');
    }
    
    return actions;
  }

  private calculateLifetimeValue(userId: string): number {
    const { featureFlagManager } = require('./featureFlags');
    const userUsage = featureFlagManager.getUserUsage(userId);
    const monthlyRevenue = this.getTierRevenue(userUsage.tier);
    
    // Estimate LTV based on tier and engagement
    const userEvents = this.events.filter(e => e.userId === userId);
    const engagementScore = Math.min(userEvents.length / 10, 1); // 0-1 scale
    
    const averageLifespan = userUsage.tier === 'pro_bono' ? 3 : 12; // months
    const retentionMultiplier = 1 + engagementScore; // 1-2x based on engagement
    
    return monthlyRevenue * averageLifespan * retentionMultiplier;
  }

  private loadAnalyticsData(): void {
    try {
      const fs = require('fs');
      const data = fs.readFileSync('analytics-data.json', 'utf8');
      const parsedData = JSON.parse(data);
      
      this.events = parsedData.events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
      
      this.conversions = new Map(parsedData.conversions);
    } catch (error) {
      console.log('Starting with fresh analytics data');
    }
  }

  private saveAnalyticsData(): void {
    try {
      const fs = require('fs');
      const data = {
        events: this.events,
        conversions: Array.from(this.conversions.entries())
      };
      fs.writeFileSync('analytics-data.json', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }
}

export const analyticsEngine = new AdvancedAnalyticsEngine();