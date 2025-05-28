interface ReferralCode {
  code: string;
  referrerId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
}

interface ReferralReward {
  id: string;
  referrerId: string;
  refereeId: string;
  rewardType: 'credit' | 'discount' | 'free_tier' | 'cash';
  rewardValue: number;
  status: 'pending' | 'earned' | 'redeemed';
  earnedAt: Date;
  redeemedAt?: Date;
  description: string;
}

interface ReferralStats {
  totalReferrals: number;
  successfulConversions: number;
  totalRewardsEarned: number;
  pendingRewards: number;
  conversionRate: number;
}

export class AutomatedReferralSystem {
  private referralCodes: Map<string, ReferralCode> = new Map();
  private rewards: ReferralReward[] = [];
  private referralHistory: Map<string, string[]> = new Map(); // referrerId -> refereeIds

  constructor() {
    this.loadReferralData();
  }

  /**
   * Generate unique referral code for user
   */
  generateReferralCode(userId: string): string {
    const code = this.createUniqueCode(userId);
    
    const referralCode: ReferralCode = {
      code,
      referrerId: userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      usageLimit: -1, // Unlimited
      usageCount: 0
    };

    this.referralCodes.set(code, referralCode);
    this.saveReferralData();
    
    return code;
  }

  /**
   * Process referral signup
   */
  processReferralSignup(referralCode: string, newUserId: string): {
    success: boolean;
    reward?: ReferralReward;
    message: string;
  } {
    const code = this.referralCodes.get(referralCode);
    
    if (!code || !code.isActive || code.expiresAt < new Date()) {
      return {
        success: false,
        message: 'Invalid or expired referral code'
      };
    }

    if (code.usageLimit > 0 && code.usageCount >= code.usageLimit) {
      return {
        success: false,
        message: 'Referral code usage limit reached'
      };
    }

    // Update referral code usage
    code.usageCount++;
    
    // Track referral relationship
    const referrals = this.referralHistory.get(code.referrerId) || [];
    referrals.push(newUserId);
    this.referralHistory.set(code.referrerId, referrals);

    // Create signup reward for referrer
    const signupReward = this.createReward(
      code.referrerId,
      newUserId,
      'credit',
      25,
      'New user signup bonus'
    );

    // Create welcome bonus for new user
    const welcomeReward = this.createReward(
      newUserId,
      newUserId,
      'free_tier',
      30,
      'Welcome bonus - 30 days free Starter tier'
    );

    this.rewards.push(signupReward, welcomeReward);
    
    // Track analytics event
    const { analyticsEngine } = require('./analyticsEngine');
    analyticsEngine.trackEvent(code.referrerId, 'referral_signup', {
      refereeId: newUserId,
      rewardValue: 25
    });

    this.saveReferralData();
    
    return {
      success: true,
      reward: signupReward,
      message: 'Referral processed successfully'
    };
  }

  /**
   * Process conversion reward when referred user upgrades
   */
  processConversionReward(userId: string, newTier: string): ReferralReward | null {
    // Find who referred this user
    const referrerId = this.findReferrer(userId);
    
    if (!referrerId) return null;

    // Calculate conversion reward based on tier
    const rewardValue = this.getConversionRewardValue(newTier);
    
    if (rewardValue === 0) return null;

    const conversionReward = this.createReward(
      referrerId,
      userId,
      'credit',
      rewardValue,
      `Conversion bonus - ${newTier} tier upgrade`
    );

    this.rewards.push(conversionReward);
    
    // Track analytics event
    const { analyticsEngine } = require('./analyticsEngine');
    analyticsEngine.trackEvent(referrerId, 'referral_conversion', {
      refereeId: userId,
      tier: newTier,
      rewardValue
    });

    this.saveReferralData();
    
    return conversionReward;
  }

  /**
   * Get referral statistics for user
   */
  getReferralStats(userId: string): ReferralStats {
    const userRewards = this.rewards.filter(r => r.referrerId === userId);
    const referrals = this.referralHistory.get(userId) || [];
    
    // Count successful conversions
    const { featureFlagManager } = require('./featureFlags');
    const successfulConversions = referrals.filter(refereeId => {
      const usage = featureFlagManager.getUserUsage(refereeId);
      return usage.tier !== 'pro_bono';
    }).length;

    const totalRewardsEarned = userRewards
      .filter(r => r.status === 'earned')
      .reduce((sum, r) => sum + r.rewardValue, 0);

    const pendingRewards = userRewards
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.rewardValue, 0);

    return {
      totalReferrals: referrals.length,
      successfulConversions,
      totalRewardsEarned,
      pendingRewards,
      conversionRate: referrals.length > 0 ? (successfulConversions / referrals.length) * 100 : 0
    };
  }

  /**
   * Get user's active referral code
   */
  getUserReferralCode(userId: string): string | null {
    for (const [code, data] of this.referralCodes.entries()) {
      if (data.referrerId === userId && data.isActive) {
        return code;
      }
    }
    return null;
  }

  /**
   * Get pending rewards for user
   */
  getPendingRewards(userId: string): ReferralReward[] {
    return this.rewards.filter(r => 
      r.referrerId === userId && r.status === 'pending'
    );
  }

  /**
   * Redeem reward
   */
  redeemReward(rewardId: string): { success: boolean; message: string } {
    const reward = this.rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }

    if (reward.status !== 'earned') {
      return { success: false, message: 'Reward not available for redemption' };
    }

    reward.status = 'redeemed';
    reward.redeemedAt = new Date();
    
    this.saveReferralData();
    
    return { success: true, message: 'Reward redeemed successfully' };
  }

  /**
   * Get referral leaderboard
   */
  getLeaderboard(limit: number = 10): {
    userId: string;
    totalReferrals: number;
    successfulConversions: number;
    totalRewards: number;
  }[] {
    const leaderboard: any[] = [];
    
    for (const [userId, referrals] of this.referralHistory.entries()) {
      const stats = this.getReferralStats(userId);
      leaderboard.push({
        userId,
        totalReferrals: stats.totalReferrals,
        successfulConversions: stats.successfulConversions,
        totalRewards: stats.totalRewardsEarned
      });
    }
    
    return leaderboard
      .sort((a, b) => b.totalRewards - a.totalRewards)
      .slice(0, limit);
  }

  /**
   * Generate shareable referral links and content
   */
  generateReferralContent(userId: string): {
    referralCode: string;
    shareableLink: string;
    emailTemplate: string;
    socialContent: string;
  } {
    let referralCode = this.getUserReferralCode(userId);
    
    if (!referralCode) {
      referralCode = this.generateReferralCode(userId);
    }

    const baseUrl = process.env.BASE_URL || 'https://omnicore.app';
    const shareableLink = `${baseUrl}/signup?ref=${referralCode}`;

    const emailTemplate = `
Hey! 👋

I've been using OmniCore to automate my business operations and it's been a game-changer. They're offering:

✅ Free 30-day Starter tier trial (worth $97)
✅ AI-powered business automation
✅ Expert consultation and setup
✅ ROI tracking and analytics

Use my referral link to get started:
${shareableLink}

You'll get the trial, and I'll get some credits too - win-win!

Best,
[Your Name]
    `.trim();

    const socialContent = `🚀 Just discovered OmniCore - the AI automation platform that's transforming small businesses! 

Get 30 days free (worth $97) with my referral link: ${shareableLink}

#Automation #AI #SmallBusiness #Productivity`;

    return {
      referralCode,
      shareableLink,
      emailTemplate,
      socialContent
    };
  }

  private createUniqueCode(userId: string): string {
    const prefix = 'OMNI';
    const timestamp = Date.now().toString(36);
    const userHash = userId.slice(-4);
    const random = Math.random().toString(36).substring(2, 6);
    
    return `${prefix}${timestamp}${userHash}${random}`.toUpperCase();
  }

  private createReward(
    referrerId: string,
    refereeId: string,
    type: 'credit' | 'discount' | 'free_tier' | 'cash',
    value: number,
    description: string
  ): ReferralReward {
    return {
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      referrerId,
      refereeId,
      rewardType: type,
      rewardValue: value,
      status: type === 'free_tier' ? 'earned' : 'pending',
      earnedAt: new Date(),
      description
    };
  }

  private findReferrer(userId: string): string | null {
    for (const [referrerId, referrals] of this.referralHistory.entries()) {
      if (referrals.includes(userId)) {
        return referrerId;
      }
    }
    return null;
  }

  private getConversionRewardValue(tier: string): number {
    const rewardMap = {
      'starter': 50,
      'professional': 100,
      'enterprise': 200
    };
    return rewardMap[tier as keyof typeof rewardMap] || 0;
  }

  private loadReferralData(): void {
    try {
      const fs = require('fs');
      const data = fs.readFileSync('referral-data.json', 'utf8');
      const parsedData = JSON.parse(data);
      
      // Restore referral codes
      this.referralCodes = new Map(
        parsedData.referralCodes.map((item: any) => [
          item[0],
          {
            ...item[1],
            createdAt: new Date(item[1].createdAt),
            expiresAt: new Date(item[1].expiresAt)
          }
        ])
      );
      
      // Restore rewards
      this.rewards = parsedData.rewards.map((reward: any) => ({
        ...reward,
        earnedAt: new Date(reward.earnedAt),
        redeemedAt: reward.redeemedAt ? new Date(reward.redeemedAt) : undefined
      }));
      
      // Restore referral history
      this.referralHistory = new Map(parsedData.referralHistory);
    } catch (error) {
      console.log('Starting with fresh referral data');
    }
  }

  private saveReferralData(): void {
    try {
      const fs = require('fs');
      const data = {
        referralCodes: Array.from(this.referralCodes.entries()),
        rewards: this.rewards,
        referralHistory: Array.from(this.referralHistory.entries())
      };
      fs.writeFileSync('referral-data.json', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving referral data:', error);
    }
  }
}

export const referralSystem = new AutomatedReferralSystem();