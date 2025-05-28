interface UserTier {
  name: string;
  chatLimit: number;
  automationLimit: number;
  apiAccess: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  customIntegrations: boolean;
  exportData: boolean;
}

interface FeatureFlags {
  [key: string]: UserTier;
}

export const USER_TIERS: FeatureFlags = {
  'pro_bono': {
    name: 'Pro Bono',
    chatLimit: 10,
    automationLimit: 3,
    apiAccess: false,
    advancedAnalytics: false,
    prioritySupport: false,
    whiteLabel: false,
    customIntegrations: false,
    exportData: false
  },
  'starter': {
    name: 'Starter',
    chatLimit: 100,
    automationLimit: 10,
    apiAccess: true,
    advancedAnalytics: true,
    prioritySupport: false,
    whiteLabel: false,
    customIntegrations: false,
    exportData: true
  },
  'professional': {
    name: 'Professional',
    chatLimit: 500,
    automationLimit: 50,
    apiAccess: true,
    advancedAnalytics: true,
    prioritySupport: true,
    whiteLabel: true,
    customIntegrations: true,
    exportData: true
  },
  'enterprise': {
    name: 'Enterprise',
    chatLimit: -1, // Unlimited
    automationLimit: -1, // Unlimited
    apiAccess: true,
    advancedAnalytics: true,
    prioritySupport: true,
    whiteLabel: true,
    customIntegrations: true,
    exportData: true
  }
};

export interface UserUsage {
  userId: string;
  tier: string;
  chatCount: number;
  automationCount: number;
  monthlyResetDate: Date;
}

export class FeatureFlagManager {
  private userUsage: Map<string, UserUsage> = new Map();

  constructor() {
    this.loadUsageData();
  }

  /**
   * Check if user can access a specific feature
   */
  canAccessFeature(userId: string, feature: keyof UserTier): boolean {
    const usage = this.getUserUsage(userId);
    const tier = USER_TIERS[usage.tier];
    
    if (!tier) return false;
    
    return tier[feature] as boolean;
  }

  /**
   * Check if user has reached their usage limit
   */
  canUseFeature(userId: string, featureType: 'chat' | 'automation'): {
    allowed: boolean;
    remaining: number;
    limit: number;
  } {
    const usage = this.getUserUsage(userId);
    const tier = USER_TIERS[usage.tier];
    
    if (!tier) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    let limit: number;
    let current: number;

    if (featureType === 'chat') {
      limit = tier.chatLimit;
      current = usage.chatCount;
    } else {
      limit = tier.automationLimit;
      current = usage.automationCount;
    }

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, remaining: -1, limit: -1 };
    }

    const remaining = Math.max(0, limit - current);
    return {
      allowed: remaining > 0,
      remaining,
      limit
    };
  }

  /**
   * Increment usage counter
   */
  incrementUsage(userId: string, featureType: 'chat' | 'automation'): boolean {
    const canUse = this.canUseFeature(userId, featureType);
    
    if (!canUse.allowed) {
      return false;
    }

    const usage = this.getUserUsage(userId);
    
    if (featureType === 'chat') {
      usage.chatCount++;
    } else {
      usage.automationCount++;
    }

    this.userUsage.set(userId, usage);
    this.saveUsageData();
    return true;
  }

  /**
   * Get user's current usage and limits
   */
  getUserUsage(userId: string): UserUsage {
    let usage = this.userUsage.get(userId);
    
    if (!usage) {
      // Default to pro_bono tier for new users
      usage = {
        userId,
        tier: 'pro_bono',
        chatCount: 0,
        automationCount: 0,
        monthlyResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
      this.userUsage.set(userId, usage);
    }

    // Check if monthly reset is needed
    if (new Date() > usage.monthlyResetDate) {
      usage.chatCount = 0;
      usage.automationCount = 0;
      usage.monthlyResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      this.userUsage.set(userId, usage);
    }

    return usage;
  }

  /**
   * Upgrade user tier
   */
  upgradeUserTier(userId: string, newTier: string): boolean {
    if (!USER_TIERS[newTier]) {
      return false;
    }

    const usage = this.getUserUsage(userId);
    usage.tier = newTier;
    this.userUsage.set(userId, usage);
    this.saveUsageData();
    return true;
  }

  /**
   * Get tier information for display
   */
  getTierInfo(tierName: string): UserTier | null {
    return USER_TIERS[tierName] || null;
  }

  /**
   * Get upgrade suggestions based on usage
   */
  getUpgradeSuggestions(userId: string): {
    shouldUpgrade: boolean;
    reason: string;
    suggestedTier: string;
  } {
    const usage = this.getUserUsage(userId);
    const tier = USER_TIERS[usage.tier];
    
    // Check if approaching limits
    if (tier.chatLimit !== -1 && usage.chatCount >= tier.chatLimit * 0.8) {
      return {
        shouldUpgrade: true,
        reason: 'You\'re approaching your monthly chat limit',
        suggestedTier: 'starter'
      };
    }

    if (tier.automationLimit !== -1 && usage.automationCount >= tier.automationLimit * 0.8) {
      return {
        shouldUpgrade: true,
        reason: 'You\'re approaching your automation limit',
        suggestedTier: 'starter'
      };
    }

    return {
      shouldUpgrade: false,
      reason: '',
      suggestedTier: ''
    };
  }

  private loadUsageData(): void {
    // In production, this would load from database
    // For now, we'll use a simple file-based approach
    try {
      const fs = require('fs');
      const data = fs.readFileSync('user-usage.json', 'utf8');
      const usageArray = JSON.parse(data);
      
      usageArray.forEach((usage: UserUsage) => {
        usage.monthlyResetDate = new Date(usage.monthlyResetDate);
        this.userUsage.set(usage.userId, usage);
      });
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('Starting with fresh usage data');
    }
  }

  private saveUsageData(): void {
    try {
      const fs = require('fs');
      const usageArray = Array.from(this.userUsage.values());
      fs.writeFileSync('user-usage.json', JSON.stringify(usageArray, null, 2));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }
}

export const featureFlagManager = new FeatureFlagManager();