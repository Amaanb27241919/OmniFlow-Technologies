// Automation Blueprint Library - Enterprise-grade plug-and-play templates
class AutomationBlueprintLibrary {
  constructor() {
    this.blueprints = new Map();
    this.initializeBlueprints();
  }

  initializeBlueprints() {
    // Lead Generation & Qualification Blueprint
    this.blueprints.set('lead-qualification', {
      id: 'lead-qualification',
      name: 'Smart Lead Qualification',
      category: 'Sales & Marketing',
      description: 'Automatically qualify leads using AI analysis and route to appropriate team members',
      tier: 'starter',
      estimatedROI: '$5,000/month',
      timeToImplement: '15 minutes',
      complexity: 'beginner',
      icon: '🎯',
      steps: [
        {
          id: 'capture',
          name: 'Lead Capture',
          type: 'webhook',
          description: 'Capture lead from website form, LinkedIn, or CRM',
          config: {
            triggers: ['form_submission', 'linkedin_connect', 'crm_import'],
            fields: ['name', 'email', 'company', 'budget', 'timeline']
          }
        },
        {
          id: 'ai-analysis',
          name: 'AI Lead Scoring',
          type: 'ai-processing',
          description: 'Analyze lead quality using AI',
          config: {
            model: 'gpt-4o',
            prompt: 'Analyze this lead and score from 1-10 based on budget, timeline, and fit',
            outputFields: ['score', 'reasoning', 'priority']
          }
        },
        {
          id: 'route',
          name: 'Smart Routing',
          type: 'conditional',
          description: 'Route leads based on score and criteria',
          config: {
            conditions: [
              { if: 'score >= 8', then: 'assign_to_senior_sales' },
              { if: 'score >= 5', then: 'assign_to_junior_sales' },
              { if: 'score < 5', then: 'nurture_sequence' }
            ]
          }
        }
      ],
      integrations: ['Zapier', 'HubSpot', 'Salesforce', 'Slack'],
      metrics: ['lead_score', 'conversion_rate', 'response_time']
    });

    // Customer Onboarding Blueprint
    this.blueprints.set('customer-onboarding', {
      id: 'customer-onboarding',
      name: 'Intelligent Customer Onboarding',
      category: 'Customer Success',
      description: 'Automated onboarding sequence with personalized content and milestone tracking',
      tier: 'professional',
      estimatedROI: '$8,000/month',
      timeToImplement: '30 minutes',
      complexity: 'intermediate',
      icon: '👋',
      steps: [
        {
          id: 'welcome',
          name: 'Welcome Sequence',
          type: 'email-automation',
          description: 'Send personalized welcome email with next steps'
        },
        {
          id: 'setup-assistance',
          name: 'AI Setup Assistant',
          type: 'ai-chat',
          description: 'AI-powered setup assistant for initial configuration'
        },
        {
          id: 'milestone-tracking',
          name: 'Progress Tracking',
          type: 'progress-monitoring',
          description: 'Track user progress through onboarding milestones'
        }
      ],
      integrations: ['Intercom', 'Mixpanel', 'Customer.io'],
      metrics: ['onboarding_completion', 'time_to_value', 'feature_adoption']
    });

    // Content Marketing Automation
    this.blueprints.set('content-marketing', {
      id: 'content-marketing',
      name: 'AI Content Marketing Engine',
      category: 'Marketing',
      description: 'Generate, optimize, and distribute content across multiple channels',
      tier: 'professional',
      estimatedROI: '$12,000/month',
      timeToImplement: '45 minutes',
      complexity: 'advanced',
      icon: '📝',
      steps: [
        {
          id: 'research',
          name: 'Market Research',
          type: 'ai-research',
          description: 'AI-powered market and competitor research'
        },
        {
          id: 'generation',
          name: 'Content Generation',
          type: 'ai-content',
          description: 'Generate blog posts, social media content, and newsletters'
        },
        {
          id: 'distribution',
          name: 'Multi-Channel Distribution',
          type: 'publishing',
          description: 'Distribute content across all marketing channels'
        }
      ],
      integrations: ['Buffer', 'Hootsuite', 'Google Analytics'],
      metrics: ['content_engagement', 'lead_generation', 'brand_awareness']
    });

    // Financial Intelligence Blueprint
    this.blueprints.set('financial-intelligence', {
      id: 'financial-intelligence',
      name: 'AI Financial Intelligence',
      category: 'Finance & Operations',
      description: 'Automated financial analysis, forecasting, and executive reporting',
      tier: 'enterprise',
      estimatedROI: '$25,000/month',
      timeToImplement: '60 minutes',
      complexity: 'advanced',
      icon: '💰',
      steps: [
        {
          id: 'data-collection',
          name: 'Financial Data Aggregation',
          type: 'data-integration',
          description: 'Collect financial data from multiple sources'
        },
        {
          id: 'ai-analysis',
          name: 'AI Financial Analysis',
          type: 'ai-analysis',
          description: 'AI-powered financial analysis and trend identification'
        },
        {
          id: 'reporting',
          name: 'Executive Reporting',
          type: 'report-generation',
          description: 'Generate comprehensive executive financial reports'
        }
      ],
      integrations: ['QuickBooks', 'Xero', 'Stripe', 'Bank APIs'],
      metrics: ['forecast_accuracy', 'cost_savings', 'decision_speed']
    });

    // Customer Support Automation
    this.blueprints.set('support-automation', {
      id: 'support-automation',
      name: 'AI Customer Support Center',
      category: 'Customer Support',
      description: 'Intelligent customer support with AI triage and automated resolutions',
      tier: 'starter',
      estimatedROI: '$6,000/month',
      timeToImplement: '20 minutes',
      complexity: 'beginner',
      icon: '🎧',
      steps: [
        {
          id: 'ticket-intake',
          name: 'Ticket Classification',
          type: 'ai-classification',
          description: 'Automatically classify and prioritize support tickets'
        },
        {
          id: 'auto-resolution',
          name: 'Automated Resolution',
          type: 'ai-resolution',
          description: 'Attempt automatic resolution for common issues'
        },
        {
          id: 'human-handoff',
          name: 'Intelligent Handoff',
          type: 'routing',
          description: 'Smart routing to appropriate human agents'
        }
      ],
      integrations: ['Zendesk', 'Intercom', 'Freshdesk'],
      metrics: ['resolution_time', 'satisfaction_score', 'agent_efficiency']
    });
  }

  // Get blueprints available for user tier
  getBlueprintsForTier(userTier) {
    const tierHierarchy = {
      'pro_bono': [],
      'starter': ['starter'],
      'professional': ['starter', 'professional'],
      'enterprise': ['starter', 'professional', 'enterprise']
    };

    const allowedTiers = tierHierarchy[userTier] || [];
    const availableBlueprints = [];

    for (const [id, blueprint] of this.blueprints) {
      if (allowedTiers.includes(blueprint.tier)) {
        availableBlueprints.push(blueprint);
      } else {
        availableBlueprints.push({
          ...blueprint,
          locked: true,
          upgradeRequired: blueprint.tier
        });
      }
    }

    return availableBlueprints;
  }

  // Get blueprint by ID
  getBlueprint(id) {
    return this.blueprints.get(id);
  }

  // Clone blueprint for customization
  cloneBlueprint(id, userId, customizations = {}) {
    const original = this.blueprints.get(id);
    if (!original) return null;

    return {
      ...original,
      id: `${id}-${userId}-${Date.now()}`,
      name: customizations.name || `${original.name} (Custom)`,
      isCustom: true,
      originalId: id,
      customizations,
      createdBy: userId,
      createdAt: new Date().toISOString()
    };
  }

  // Search blueprints
  searchBlueprints(query, userTier) {
    const allBlueprints = this.getBlueprintsForTier(userTier);
    const searchTerms = query.toLowerCase().split(' ');

    return allBlueprints.filter(blueprint => {
      const searchText = `${blueprint.name} ${blueprint.description} ${blueprint.category}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });
  }

  // Get blueprints by category
  getBlueprintsByCategory(category, userTier) {
    const allBlueprints = this.getBlueprintsForTier(userTier);
    return allBlueprints.filter(blueprint => blueprint.category === category);
  }

  // Get featured blueprints
  getFeaturedBlueprints(userTier, limit = 3) {
    const allBlueprints = this.getBlueprintsForTier(userTier);
    return allBlueprints
      .filter(bp => !bp.locked)
      .sort((a, b) => parseFloat(b.estimatedROI.replace(/[^\d]/g, '')) - parseFloat(a.estimatedROI.replace(/[^\d]/g, '')))
      .slice(0, limit);
  }
}

module.exports = AutomationBlueprintLibrary;