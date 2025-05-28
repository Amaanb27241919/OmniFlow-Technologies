// OmniFlow Core Engine - Unified platform for Advisory and OmniCore
import { agentRouter } from './agentRouter';
import { persistentMemory } from './persistentMemory';
import { automationPipeline } from './automationPipeline';

interface ClientProfile {
  id: string;
  businessType: 'startup' | 'smb' | 'solopreneur' | 'agency' | 'nonprofit';
  stage: 'prospect' | 'advisory_client' | 'transition_ready' | 'omnicore_user';
  advisoryPackage?: 'audit' | 'retainer' | 'pilot';
  omnicoreFeatures?: string[];
  lifetimeValue: number;
  conversionProbability: number;
}

interface OmniFlowService {
  type: 'advisory' | 'omnicore';
  name: string;
  description: string;
  pricing: {
    model: 'fixed' | 'retainer' | 'outcome' | 'subscription';
    amount: number;
    currency: string;
  };
  deliverables: string[];
  timeline: string;
}

export class OmniFlowPlatform {
  private clients = new Map<string, ClientProfile>();
  
  // Core service catalog aligned with business model
  private advisoryServices: OmniFlowService[] = [
    {
      type: 'advisory',
      name: 'Business Automation Audit',
      description: 'Comprehensive analysis of automation opportunities with ROI projections',
      pricing: { model: 'fixed', amount: 2500, currency: 'USD' },
      deliverables: ['Process analysis', 'ROI projections', 'Implementation roadmap', 'Tool recommendations'],
      timeline: '5-7 business days'
    },
    {
      type: 'advisory',
      name: 'AI Strategy Retainer',
      description: 'Ongoing strategic guidance for AI implementation and optimization',
      pricing: { model: 'retainer', amount: 5000, currency: 'USD' },
      deliverables: ['Monthly strategy sessions', 'Implementation support', 'Performance monitoring', 'Optimization recommendations'],
      timeline: 'Monthly engagement'
    },
    {
      type: 'advisory',
      name: 'Automation Pilot Project',
      description: 'Outcome-based pilot to prove automation value before full implementation',
      pricing: { model: 'outcome', amount: 10000, currency: 'USD' },
      deliverables: ['Pilot automation', 'Success metrics tracking', 'Scaling recommendations', 'Team training'],
      timeline: '4-6 weeks'
    }
  ];

  private omnicoreServices: OmniFlowService[] = [
    {
      type: 'omnicore',
      name: 'Starter Automation Suite',
      description: 'Essential automation tools for growing businesses',
      pricing: { model: 'subscription', amount: 97, currency: 'USD' },
      deliverables: ['5 automation templates', 'Basic analytics', 'Email support'],
      timeline: 'Immediate access'
    },
    {
      type: 'omnicore',
      name: 'Professional Platform',
      description: 'Advanced automation with custom workflows and priority support',
      pricing: { model: 'subscription', amount: 297, currency: 'USD' },
      deliverables: ['Unlimited automations', 'Custom workflows', 'Advanced analytics', 'Priority support'],
      timeline: 'Immediate access'
    },
    {
      type: 'omnicore',
      name: 'Enterprise Solution',
      description: 'White-label platform with API access and dedicated support',
      pricing: { model: 'subscription', amount: 997, currency: 'USD' },
      deliverables: ['White-label platform', 'API access', 'Dedicated support', 'Custom integrations'],
      timeline: 'Setup within 48 hours'
    }
  ];

  async assessClientReadiness(clientId: string): Promise<{
    currentStage: ClientProfile['stage'];
    recommendedService: OmniFlowService;
    transitionPath: string[];
    timeToValue: string;
  }> {
    const context = await persistentMemory.getUserContext(clientId);
    const insights = await persistentMemory.getContextualInsights(clientId);
    
    let currentStage: ClientProfile['stage'] = 'prospect';
    let recommendedService: OmniFlowService;
    let transitionPath: string[] = [];
    
    // Determine current stage based on engagement and automation readiness
    if (insights.automationReadiness < 30) {
      currentStage = 'prospect';
      recommendedService = this.advisoryServices[0]; // Business Audit
      transitionPath = ['audit', 'strategy_sessions', 'pilot_project', 'omnicore_transition'];
    } else if (insights.automationReadiness < 60) {
      currentStage = 'advisory_client';
      recommendedService = this.advisoryServices[1]; // AI Strategy Retainer
      transitionPath = ['retainer_engagement', 'pilot_project', 'omnicore_transition'];
    } else if (insights.automationReadiness < 85) {
      currentStage = 'transition_ready';
      recommendedService = this.advisoryServices[2]; // Pilot Project
      transitionPath = ['pilot_project', 'omnicore_onboarding'];
    } else {
      currentStage = 'omnicore_user';
      recommendedService = this.omnicoreServices[1]; // Professional Platform
      transitionPath = ['omnicore_onboarding', 'feature_expansion'];
    }

    return {
      currentStage,
      recommendedService,
      transitionPath,
      timeToValue: this.calculateTimeToValue(currentStage, recommendedService)
    };
  }

  async initiateServiceToSaaSTransition(clientId: string, advisoryResults: any): Promise<{
    readinessScore: number;
    recommendedTier: string;
    migrationPlan: any;
    incentives: string[];
  }> {
    const client = await this.getClientProfile(clientId);
    const readinessScore = await this.calculateSaaSReadiness(clientId, advisoryResults);
    
    let recommendedTier = 'starter';
    let incentives: string[] = [];
    
    if (readinessScore > 80) {
      recommendedTier = 'professional';
      incentives = ['50% off first 3 months', 'Priority migration support', 'Custom workflow setup'];
    } else if (readinessScore > 60) {
      recommendedTier = 'starter';
      incentives = ['30% off first month', 'Migration assistance', 'Training sessions'];
    }

    const migrationPlan = {
      phase1: 'Data migration and account setup',
      phase2: 'Automation template configuration',
      phase3: 'Team training and go-live',
      phase4: 'Optimization and scaling',
      timeline: readinessScore > 80 ? '1-2 weeks' : '2-4 weeks'
    };

    return {
      readinessScore,
      recommendedTier,
      migrationPlan,
      incentives
    };
  }

  async generateProposal(clientId: string, serviceType: 'advisory' | 'omnicore'): Promise<{
    proposal: any;
    pricing: any;
    roi: any;
    nextSteps: string[];
  }> {
    const context = await persistentMemory.getUserContext(clientId);
    const insights = await persistentMemory.getContextualInsights(clientId);
    const assessment = await this.assessClientReadiness(clientId);
    
    const service = assessment.recommendedService;
    
    const proposal = {
      clientName: context.businessProfile.businessName || 'Your Business',
      serviceOffered: service.name,
      description: service.description,
      customizedValue: this.generateCustomizedValue(context, insights),
      deliverables: service.deliverables,
      timeline: service.timeline,
      investmentJustification: this.generateInvestmentJustification(insights)
    };

    const pricing = {
      model: service.pricing.model,
      amount: service.pricing.amount,
      paymentTerms: this.generatePaymentTerms(service.pricing.model),
      guarantees: this.generateGuarantees(serviceType)
    };

    const roi = {
      estimatedSavings: insights.potentialROI,
      paybackPeriod: this.calculatePaybackPeriod(service.pricing.amount, insights.potentialROI),
      confidence: '85%'
    };

    const nextSteps = [
      'Review proposal and ask questions',
      'Schedule implementation kickoff',
      'Sign service agreement',
      'Begin discovery process'
    ];

    return { proposal, pricing, roi, nextSteps };
  }

  private async getClientProfile(clientId: string): Promise<ClientProfile> {
    if (!this.clients.has(clientId)) {
      const context = await persistentMemory.getUserContext(clientId);
      const newProfile: ClientProfile = {
        id: clientId,
        businessType: this.inferBusinessType(context.businessProfile),
        stage: 'prospect',
        lifetimeValue: 0,
        conversionProbability: 0
      };
      this.clients.set(clientId, newProfile);
    }
    return this.clients.get(clientId)!;
  }

  private inferBusinessType(profile: any): ClientProfile['businessType'] {
    if (profile.size === 'startup' || profile.employees < 10) return 'startup';
    if (profile.industry === 'consulting' || profile.businessName?.includes('agency')) return 'agency';
    if (profile.size === 'small' || profile.employees < 50) return 'smb';
    return 'solopreneur';
  }

  private async calculateSaaSReadiness(clientId: string, advisoryResults: any): Promise<number> {
    const insights = await persistentMemory.getContextualInsights(clientId);
    let score = insights.automationReadiness;
    
    // Bonus points for advisory engagement
    if (advisoryResults?.pilot_success) score += 15;
    if (advisoryResults?.team_training_completed) score += 10;
    if (advisoryResults?.process_documentation) score += 5;
    
    return Math.min(score, 100);
  }

  private generateCustomizedValue(context: any, insights: any): string[] {
    const values = [];
    const profile = context.businessProfile;
    
    if (profile.challenges.includes('manual_processes')) {
      values.push(`Eliminate ${profile.size === 'startup' ? '15-20' : '25-35'} hours of manual work per week`);
    }
    
    if (profile.challenges.includes('lead_management')) {
      values.push('Increase lead conversion by 40% with automated qualification');
    }
    
    if (profile.goals.includes('scale_business')) {
      values.push(`Support ${profile.size === 'startup' ? '3x' : '5x'} growth without proportional staff increases`);
    }
    
    return values;
  }

  private generateInvestmentJustification(insights: any): string {
    const roi = insights.potentialROI.replace(/[^\d]/g, '');
    return `With projected savings of ${insights.potentialROI}, this investment typically pays for itself within 3-6 months while providing ongoing efficiency gains.`;
  }

  private generatePaymentTerms(model: string): string {
    switch (model) {
      case 'fixed':
        return '50% upfront, 50% on delivery';
      case 'retainer':
        return 'Monthly payment, 30-day payment terms';
      case 'outcome':
        return '25% upfront, 75% on achieving success metrics';
      case 'subscription':
        return 'Monthly subscription, cancel anytime';
      default:
        return 'Net 30 payment terms';
    }
  }

  private generateGuarantees(serviceType: string): string[] {
    if (serviceType === 'advisory') {
      return [
        'Satisfaction guarantee - full refund if not completely satisfied',
        'Deliverable guarantee - all promised deliverables or money back',
        'Timeline guarantee - on-time delivery or 10% discount'
      ];
    } else {
      return [
        '30-day money-back guarantee',
        '99.9% uptime SLA',
        'No setup fees or long-term contracts'
      ];
    }
  }

  private calculatePaybackPeriod(investment: number, annualSavings: string): string {
    const savings = parseInt(annualSavings.replace(/[^\d]/g, ''));
    const months = Math.ceil((investment / savings) * 12);
    return `${months} months`;
  }

  private calculateTimeToValue(stage: ClientProfile['stage'], service: OmniFlowService): string {
    const baseTimeframes = {
      'prospect': '2-3 weeks',
      'advisory_client': '1-2 weeks',
      'transition_ready': '3-5 days',
      'omnicore_user': 'Immediate'
    };
    
    return baseTimeframes[stage];
  }
}

export const omniflowPlatform = new OmniFlowPlatform();