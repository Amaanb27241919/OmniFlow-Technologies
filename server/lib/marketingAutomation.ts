// Marketing Automation and Lead Nurturing System
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

export interface Lead {
  id: string;
  email: string;
  businessName: string;
  contactName: string;
  phone?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large';
  challenge: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'closed_won' | 'closed_lost';
  score: number;
  tags: string[];
  createdAt: Date;
  lastInteraction: Date;
  interactions: Interaction[];
  nurturingStage: 'awareness' | 'consideration' | 'decision' | 'retention';
  automationTriggers: string[];
}

export interface Interaction {
  id: string;
  type: 'email_sent' | 'email_opened' | 'email_clicked' | 'website_visit' | 'demo_requested' | 'proposal_viewed';
  timestamp: Date;
  metadata: any;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  stage: string;
  triggerDelay: number; // hours after previous action
  conditions: string[];
}

export interface NurturingSequence {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  emails: EmailTemplate[];
  isActive: boolean;
}

export class MarketingAutomationEngine {
  private leads: Map<string, Lead> = new Map();
  private sequences: Map<string, NurturingSequence> = new Map();
  private leadsFile = './leads.json';
  private sequencesFile = './marketing_sequences.json';

  constructor() {
    this.initializeDefaultSequences();
    this.loadData();
  }

  private initializeDefaultSequences() {
    // Welcome sequence for new audit signups
    const auditWelcomeSequence: NurturingSequence = {
      id: 'audit_welcome',
      name: 'Free Audit Welcome Series',
      description: 'Nurture leads who signed up for free business audit',
      triggerConditions: ['source:free_audit', 'status:new'],
      isActive: true,
      emails: [
        {
          id: 'audit_welcome_1',
          name: 'Welcome & Next Steps',
          subject: 'Your Free Business Audit is Starting - What to Expect',
          content: `
            Hi {{contactName}},

            Thank you for requesting your free $2,500 business automation audit for {{businessName}}!

            Over the next 5-7 days, our AI will analyze your business processes and identify automation opportunities that could save you $25,000+ annually.

            Here's what happens next:
            1. Our system analyzes your business profile
            2. We identify top automation opportunities
            3. You receive a detailed report with ROI projections
            4. Optional: Schedule a consultation to discuss implementation

            In the meantime, here are 3 quick wins most {{companySize}} businesses can implement immediately:
            - Automate lead qualification (saves 10+ hours/week)
            - Set up intelligent email responses (reduces response time by 80%)
            - Implement workflow triggers (eliminates manual task switching)

            Questions? Simply reply to this email.

            Best regards,
            The OmniFlow Team
          `,
          stage: 'awareness',
          triggerDelay: 0,
          conditions: []
        },
        {
          id: 'audit_value_2',
          name: 'Case Study - Similar Business Success',
          subject: 'How {{companySize}} business saved $85K with automation',
          content: `
            Hi {{contactName}},

            Your audit is in progress! While we analyze {{businessName}}, thought you'd find this case study interesting.

            A {{companySize}} business similar to yours recently implemented our automation recommendations:

            Before:
            - 40 hours/week spent on manual tasks
            - 3-day average response time to leads
            - 15% lead conversion rate

            After (6 months):
            - $85,000 annual cost savings
            - 2-hour average response time
            - 42% lead conversion rate

            The key? They started with our business audit, then implemented our top 3 recommendations first.

            Your audit will be ready soon with specific recommendations for {{businessName}}.

            Best,
            OmniFlow Team
          `,
          stage: 'consideration',
          triggerDelay: 48,
          conditions: []
        },
        {
          id: 'audit_ready_3',
          name: 'Your Audit Results Are Ready',
          subject: 'Your $25K+ automation opportunities are ready to review',
          content: `
            Hi {{contactName}},

            Your free business automation audit for {{businessName}} is complete!

            We've identified specific opportunities that could save you $25,000+ annually.

            Your personalized report includes:
            ✓ Top 5 automation opportunities ranked by ROI
            ✓ Implementation roadmap with timelines
            ✓ Cost-benefit analysis for each recommendation
            ✓ Quick wins you can implement this week

            [View Your Audit Results] - Login to your dashboard

            Want to discuss your results? Book a free 30-minute consultation:
            [Schedule Consultation]

            This audit normally costs $2,500 - it's our gift to help you get started with automation.

            Best,
            The OmniFlow Team
          `,
          stage: 'decision',
          triggerDelay: 120,
          conditions: []
        }
      ]
    };

    // Consultation follow-up sequence
    const consultationSequence: NurturingSequence = {
      id: 'consultation_followup',
      name: 'Consultation Follow-up Series',
      description: 'Follow up with leads who requested consultation',
      triggerConditions: ['source:consultation_request'],
      isActive: true,
      emails: [
        {
          id: 'consultation_confirmation',
          name: 'Consultation Confirmation',
          subject: 'Your OmniFlow consultation is confirmed',
          content: `
            Hi {{contactName}},

            Thank you for requesting a consultation for {{businessName}}!

            We'll contact you within 24 hours to schedule your personalized strategy session.

            To make our call as valuable as possible, please consider:
            - Your biggest operational challenge right now
            - What tasks your team spends the most time on
            - Your growth goals for the next 12 months

            In the meantime, feel free to explore our platform and see how other businesses are automating similar processes.

            Looking forward to helping {{businessName}} achieve breakthrough efficiency!

            Best,
            The OmniFlow Advisory Team
          `,
          stage: 'consideration',
          triggerDelay: 0,
          conditions: []
        }
      ]
    };

    // Platform trial sequence
    const trialSequence: NurturingSequence = {
      id: 'platform_trial',
      name: 'Platform Trial Onboarding',
      description: 'Onboard users who started platform trial',
      triggerConditions: ['source:platform_trial'],
      isActive: true,
      emails: [
        {
          id: 'trial_welcome',
          name: 'Welcome to Your OmniCore Trial',
          subject: 'Your 30-day OmniCore trial is active - Quick start guide',
          content: `
            Hi {{contactName}},

            Welcome to your 30-day OmniCore trial! You now have access to our full automation platform.

            Quick start checklist:
            □ Complete your business profile (5 minutes)
            □ Try our AI business assistant
            □ Explore automation blueprints for {{companySize}} businesses
            □ Set up your first automated workflow

            Most successful users see results within their first week by:
            1. Starting with our pre-built templates
            2. Automating their highest-volume repetitive tasks first
            3. Using our ROI tracking to measure impact

            Need help? Our support team is standing by.

            [Access Your Dashboard]

            Best,
            The OmniCore Team
          `,
          stage: 'consideration',
          triggerDelay: 0,
          conditions: []
        },
        {
          id: 'trial_midpoint',
          name: 'Halfway Through Your Trial',
          subject: 'How is your automation going? (15 days left)',
          content: `
            Hi {{contactName}},

            You're halfway through your OmniCore trial! How is the automation journey going for {{businessName}}?

            Most successful customers have implemented 2-3 key automations by now:
            - Lead qualification workflows
            - Email response automation
            - Task assignment triggers

            If you haven't started yet, here are 3 quick wins you can set up today:
            1. Automate your lead capture form responses (10 minutes)
            2. Set up task reminders for your team (5 minutes)
            3. Create an automated welcome sequence (15 minutes)

            Questions? Book a free setup call with our automation experts.

            [Book Setup Call] [Access Dashboard]

            Best,
            The OmniCore Team
          `,
          stage: 'decision',
          triggerDelay: 360,
          conditions: []
        }
      ]
    };

    this.sequences.set('audit_welcome', auditWelcomeSequence);
    this.sequences.set('consultation_followup', consultationSequence);
    this.sequences.set('platform_trial', trialSequence);
  }

  async addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'lastInteraction' | 'interactions' | 'score' | 'tags' | 'nurturingStage' | 'automationTriggers'>): Promise<Lead> {
    const lead: Lead = {
      ...leadData,
      id: this.generateId(),
      createdAt: new Date(),
      lastInteraction: new Date(),
      interactions: [],
      score: this.calculateInitialScore(leadData),
      tags: this.generateInitialTags(leadData),
      nurturingStage: 'awareness',
      automationTriggers: []
    };

    this.leads.set(lead.id, lead);
    await this.saveLeads();
    
    // Trigger relevant nurturing sequences
    await this.triggerNurturingSequences(lead);
    
    return lead;
  }

  private calculateInitialScore(leadData: any): number {
    let score = 50; // Base score

    // Company size scoring
    const sizeScores = { startup: 60, small: 75, medium: 85, large: 95 };
    score += sizeScores[leadData.companySize] || 50;

    // Source scoring
    const sourceScores = {
      'free_audit': 80,
      'consultation_request': 90,
      'platform_trial': 85,
      'referral': 95,
      'organic_search': 70,
      'landing_page': 65
    };
    score += sourceScores[leadData.source] || 50;

    // Challenge complexity scoring
    if (leadData.challenge && leadData.challenge.length > 50) {
      score += 20; // Detailed challenges indicate serious interest
    }

    return Math.min(score, 100);
  }

  private generateInitialTags(leadData: any): string[] {
    const tags = [leadData.companySize, leadData.source];
    
    if (leadData.challenge) {
      const challenge = leadData.challenge.toLowerCase();
      if (challenge.includes('lead')) tags.push('lead_management');
      if (challenge.includes('email')) tags.push('email_automation');
      if (challenge.includes('workflow')) tags.push('workflow_automation');
      if (challenge.includes('report')) tags.push('reporting');
      if (challenge.includes('crm')) tags.push('crm_integration');
    }

    return tags;
  }

  private async triggerNurturingSequences(lead: Lead): Promise<void> {
    for (const [sequenceId, sequence] of this.sequences) {
      if (!sequence.isActive) continue;

      const shouldTrigger = sequence.triggerConditions.some(condition => {
        const [field, value] = condition.split(':');
        return (lead as any)[field] === value;
      });

      if (shouldTrigger) {
        await this.startNurturingSequence(lead.id, sequenceId);
      }
    }
  }

  private async startNurturingSequence(leadId: string, sequenceId: string): Promise<void> {
    const lead = this.leads.get(leadId);
    const sequence = this.sequences.get(sequenceId);
    
    if (!lead || !sequence) return;

    // Schedule emails in the sequence
    for (let i = 0; i < sequence.emails.length; i++) {
      const email = sequence.emails[i];
      const sendDate = new Date();
      sendDate.setHours(sendDate.getHours() + email.triggerDelay);

      // In a real implementation, this would integrate with your email service
      console.log(`Scheduling email "${email.name}" for lead ${leadId} at ${sendDate}`);
      
      // Store the scheduled email
      this.scheduleEmail(leadId, email, sendDate);
    }

    lead.automationTriggers.push(sequenceId);
    await this.saveLeads();
  }

  private scheduleEmail(leadId: string, email: EmailTemplate, sendDate: Date): void {
    // In production, this would integrate with services like SendGrid, Mailchimp, etc.
    // For now, we'll simulate by logging
    setTimeout(() => {
      this.sendEmail(leadId, email);
    }, Math.max(0, sendDate.getTime() - Date.now()));
  }

  private sendEmail(leadId: string, email: EmailTemplate): void {
    const lead = this.leads.get(leadId);
    if (!lead) return;

    // Personalize email content
    let content = email.content
      .replace(/\{\{contactName\}\}/g, lead.contactName)
      .replace(/\{\{businessName\}\}/g, lead.businessName)
      .replace(/\{\{companySize\}\}/g, lead.companySize);

    // Log email sending (in production, send actual email)
    console.log(`Sending email to ${lead.email}: ${email.subject}`);
    
    // Record interaction
    const interaction: Interaction = {
      id: this.generateId(),
      type: 'email_sent',
      timestamp: new Date(),
      metadata: { emailId: email.id, subject: email.subject }
    };

    lead.interactions.push(interaction);
    lead.lastInteraction = new Date();
    this.saveLeads();
  }

  async updateLeadStatus(leadId: string, status: Lead['status']): Promise<void> {
    const lead = this.leads.get(leadId);
    if (!lead) return;

    lead.status = status;
    lead.lastInteraction = new Date();

    // Trigger status-based automations
    if (status === 'qualified') {
      // Send proposal template or schedule demo
      console.log(`Lead ${leadId} qualified - triggering proposal automation`);
    } else if (status === 'closed_won') {
      // Start onboarding sequence
      console.log(`Lead ${leadId} closed won - starting onboarding`);
    }

    await this.saveLeads();
  }

  async recordInteraction(leadId: string, interaction: Omit<Interaction, 'id'>): Promise<void> {
    const lead = this.leads.get(leadId);
    if (!lead) return;

    const fullInteraction: Interaction = {
      ...interaction,
      id: this.generateId()
    };

    lead.interactions.push(fullInteraction);
    lead.lastInteraction = new Date();

    // Update lead score based on interaction
    if (interaction.type === 'email_opened') lead.score += 5;
    if (interaction.type === 'email_clicked') lead.score += 10;
    if (interaction.type === 'demo_requested') lead.score += 20;

    await this.saveLeads();
  }

  getLeadsByStatus(status: Lead['status']): Lead[] {
    return Array.from(this.leads.values()).filter(lead => lead.status === status);
  }

  getHighValueLeads(minScore: number = 80): Lead[] {
    return Array.from(this.leads.values())
      .filter(lead => lead.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }

  getLeadsNeedingFollowup(daysSinceLastInteraction: number = 3): Lead[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastInteraction);
    
    return Array.from(this.leads.values())
      .filter(lead => 
        lead.status !== 'closed_won' && 
        lead.status !== 'closed_lost' &&
        lead.lastInteraction < cutoffDate
      );
  }

  private async loadData(): Promise<void> {
    try {
      if (existsSync(this.leadsFile)) {
        const data = await readFile(this.leadsFile, 'utf-8');
        const leadsArray = JSON.parse(data);
        this.leads = new Map(leadsArray.map((lead: Lead) => [lead.id, {
          ...lead,
          createdAt: new Date(lead.createdAt),
          lastInteraction: new Date(lead.lastInteraction),
          interactions: lead.interactions.map(i => ({
            ...i,
            timestamp: new Date(i.timestamp)
          }))
        }]));
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  }

  private async saveLeads(): Promise<void> {
    try {
      const leadsArray = Array.from(this.leads.values());
      await writeFile(this.leadsFile, JSON.stringify(leadsArray, null, 2));
    } catch (error) {
      console.error('Error saving leads:', error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Analytics and Reporting
  getConversionAnalytics() {
    const leads = Array.from(this.leads.values());
    const total = leads.length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const won = leads.filter(l => l.status === 'closed_won').length;
    
    return {
      totalLeads: total,
      qualificationRate: total > 0 ? (qualified / total * 100).toFixed(1) : 0,
      conversionRate: total > 0 ? (won / total * 100).toFixed(1) : 0,
      averageScore: total > 0 ? (leads.reduce((sum, l) => sum + l.score, 0) / total).toFixed(1) : 0,
      sourceBreakdown: this.getSourceBreakdown(leads),
      stageDistribution: this.getStageDistribution(leads)
    };
  }

  private getSourceBreakdown(leads: Lead[]) {
    const sources: Record<string, number> = {};
    leads.forEach(lead => {
      sources[lead.source] = (sources[lead.source] || 0) + 1;
    });
    return sources;
  }

  private getStageDistribution(leads: Lead[]) {
    const stages: Record<string, number> = {};
    leads.forEach(lead => {
      stages[lead.status] = (stages[lead.status] || 0) + 1;
    });
    return stages;
  }
}

export const marketingEngine = new MarketingAutomationEngine();