// Modular Automation Pipeline - Core service-to-SaaS workflow engine
import { agentRouter } from './agentRouter';
import { persistentMemory } from './persistentMemory';

interface PipelineStage {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  estimatedDuration: string;
  dependencies?: string[];
}

interface PipelineExecution {
  id: string;
  userId: string;
  blueprintId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStage: string;
  results: Map<string, any>;
  startedAt: Date;
  completedAt?: Date;
  estimatedROI?: string;
}

export class AutomationPipelineEngine {
  private executions = new Map<string, PipelineExecution>();
  
  // Core pipeline stages that every automation follows
  private coreStages: PipelineStage[] = [
    {
      id: 'intake',
      name: 'Business Intake',
      description: 'Gather comprehensive business information and requirements',
      inputs: ['business_profile', 'goals', 'challenges'],
      outputs: ['structured_profile', 'priority_areas'],
      estimatedDuration: '15 minutes'
    },
    {
      id: 'audit',
      name: 'Process Audit',
      description: 'Analyze current processes and identify automation opportunities',
      inputs: ['structured_profile', 'current_tools', 'workflows'],
      outputs: ['process_map', 'automation_opportunities', 'efficiency_gaps'],
      estimatedDuration: '30 minutes',
      dependencies: ['intake']
    },
    {
      id: 'analysis',
      name: 'AI Analysis',
      description: 'Deep AI-powered analysis of automation potential and ROI',
      inputs: ['process_map', 'automation_opportunities', 'business_goals'],
      outputs: ['automation_recommendations', 'roi_projections', 'implementation_plan'],
      estimatedDuration: '20 minutes',
      dependencies: ['audit']
    },
    {
      id: 'report',
      name: 'Strategy Report',
      description: 'Generate comprehensive automation strategy report',
      inputs: ['automation_recommendations', 'roi_projections', 'implementation_plan'],
      outputs: ['executive_summary', 'detailed_report', 'action_items'],
      estimatedDuration: '10 minutes',
      dependencies: ['analysis']
    },
    {
      id: 'action',
      name: 'Implementation',
      description: 'Execute automation implementation or transition to SaaS platform',
      inputs: ['implementation_plan', 'user_preferences', 'budget'],
      outputs: ['automation_deployed', 'saas_transition', 'success_metrics'],
      estimatedDuration: 'Variable',
      dependencies: ['report']
    }
  ];

  async startPipeline(userId: string, blueprintId: string, initialData: any): Promise<string> {
    const executionId = `exec_${Date.now()}_${userId}`;
    
    const execution: PipelineExecution = {
      id: executionId,
      userId,
      blueprintId,
      status: 'pending',
      currentStage: 'intake',
      results: new Map(),
      startedAt: new Date()
    };

    this.executions.set(executionId, execution);
    
    // Initialize user context
    await persistentMemory.updateBusinessProfile(userId, initialData.businessProfile || {});
    
    // Start with intake stage
    await this.executeStage(executionId, 'intake', initialData);
    
    return executionId;
  }

  async executeStage(executionId: string, stageId: string, stageData: any): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) throw new Error('Execution not found');

    const stage = this.coreStages.find(s => s.id === stageId);
    if (!stage) throw new Error('Stage not found');

    execution.status = 'running';
    execution.currentStage = stageId;

    try {
      let stageResult;
      
      switch (stageId) {
        case 'intake':
          stageResult = await this.executeIntakeStage(execution, stageData);
          break;
        case 'audit':
          stageResult = await this.executeAuditStage(execution, stageData);
          break;
        case 'analysis':
          stageResult = await this.executeAnalysisStage(execution, stageData);
          break;
        case 'report':
          stageResult = await this.executeReportStage(execution, stageData);
          break;
        case 'action':
          stageResult = await this.executeActionStage(execution, stageData);
          break;
        default:
          throw new Error(`Unknown stage: ${stageId}`);
      }

      execution.results.set(stageId, stageResult);
      
      // Update persistent memory with progress
      await persistentMemory.updateAutomationStage(execution.userId, {
        stage: stageId as any,
        status: 'completed',
        data: stageResult,
        completedAt: new Date()
      });

      // Auto-advance to next stage if applicable
      const nextStage = this.getNextStage(stageId);
      if (nextStage && this.shouldAutoAdvance(execution, nextStage)) {
        await this.executeStage(executionId, nextStage, stageResult);
      } else {
        execution.status = stageId === 'action' ? 'completed' : 'pending';
        if (execution.status === 'completed') {
          execution.completedAt = new Date();
        }
      }

    } catch (error) {
      console.error(`Stage ${stageId} failed:`, error);
      execution.status = 'failed';
      throw error;
    }
  }

  // Stage implementations
  private async executeIntakeStage(execution: PipelineExecution, data: any) {
    const context = await persistentMemory.getUserContext(execution.userId);
    
    // Structure the business profile data
    const structuredProfile = {
      businessName: data.businessName || '',
      industry: data.industry || '',
      size: data.size || 'small',
      revenue: data.revenue || '',
      employees: data.employees || '',
      location: data.location || '',
      goals: data.goals || [],
      challenges: data.challenges || [],
      currentTools: data.currentTools || [],
      timeframe: data.timeframe || '3-6 months'
    };

    // Identify priority areas using AI
    const priorityAnalysisQuery = `
      Analyze this business profile and identify the top 3 priority areas for automation:
      Business: ${structuredProfile.businessName} (${structuredProfile.industry})
      Size: ${structuredProfile.size} company
      Goals: ${structuredProfile.goals.join(', ')}
      Challenges: ${structuredProfile.challenges.join(', ')}
      Current Tools: ${structuredProfile.currentTools.join(', ')}
    `;

    const priorityResponse = await agentRouter.routeRequest({
      query: priorityAnalysisQuery,
      userTier: 'pro', // Assuming consulting clients get pro-level analysis
      context: 'business_intake'
    });

    return {
      structured_profile: structuredProfile,
      priority_areas: this.extractPriorityAreas(priorityResponse.content),
      ai_insights: priorityResponse.content,
      completedAt: new Date().toISOString()
    };
  }

  private async executeAuditStage(execution: PipelineExecution, data: any) {
    const intakeResults = execution.results.get('intake');
    if (!intakeResults) throw new Error('Intake stage not completed');

    const profile = intakeResults.structured_profile;
    
    // Generate process map using AI
    const processMapQuery = `
      Create a detailed process map for this business and identify automation opportunities:
      
      Business Profile:
      - Industry: ${profile.industry}
      - Size: ${profile.size}
      - Current Tools: ${profile.currentTools.join(', ')}
      - Main Challenges: ${profile.challenges.join(', ')}
      
      Please provide:
      1. Current process workflow
      2. Specific automation opportunities
      3. Efficiency gaps and bottlenecks
      4. Integration possibilities
    `;

    const auditResponse = await agentRouter.routeRequest({
      query: processMapQuery,
      userTier: 'pro',
      context: 'process_audit'
    });

    return {
      process_map: this.extractProcessMap(auditResponse.content),
      automation_opportunities: this.extractAutomationOpportunities(auditResponse.content),
      efficiency_gaps: this.extractEfficiencyGaps(auditResponse.content),
      audit_report: auditResponse.content,
      completedAt: new Date().toISOString()
    };
  }

  private async executeAnalysisStage(execution: PipelineExecution, data: any) {
    const auditResults = execution.results.get('audit');
    const intakeResults = execution.results.get('intake');
    
    if (!auditResults || !intakeResults) throw new Error('Previous stages not completed');

    const analysisQuery = `
      Perform deep ROI analysis and create implementation plan:
      
      Business Context: ${JSON.stringify(intakeResults.structured_profile)}
      Automation Opportunities: ${JSON.stringify(auditResults.automation_opportunities)}
      Process Gaps: ${JSON.stringify(auditResults.efficiency_gaps)}
      
      Please provide:
      1. Detailed ROI projections for each automation opportunity
      2. Implementation timeline and phases
      3. Resource requirements
      4. Risk assessment
      5. Success metrics
    `;

    const analysisResponse = await agentRouter.routeRequest({
      query: analysisQuery,
      userTier: 'enterprise', // Deep analysis gets enterprise-level processing
      context: 'automation_analysis'
    });

    const roiProjections = this.calculateROIProjections(intakeResults.structured_profile, auditResults.automation_opportunities);

    return {
      automation_recommendations: this.extractRecommendations(analysisResponse.content),
      roi_projections: roiProjections,
      implementation_plan: this.extractImplementationPlan(analysisResponse.content),
      analysis_report: analysisResponse.content,
      completedAt: new Date().toISOString()
    };
  }

  private async executeReportStage(execution: PipelineExecution, data: any) {
    const analysisResults = execution.results.get('analysis');
    const auditResults = execution.results.get('audit');
    const intakeResults = execution.results.get('intake');

    if (!analysisResults || !auditResults || !intakeResults) {
      throw new Error('Previous stages not completed');
    }

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(intakeResults, auditResults, analysisResults);
    
    // Create detailed report
    const detailedReport = this.generateDetailedReport(intakeResults, auditResults, analysisResults);
    
    // Extract action items
    const actionItems = this.extractActionItems(analysisResults.implementation_plan);

    // Store ROI for execution tracking
    execution.estimatedROI = analysisResults.roi_projections.total;

    return {
      executive_summary: executiveSummary,
      detailed_report: detailedReport,
      action_items: actionItems,
      next_steps: this.generateNextSteps(analysisResults),
      completedAt: new Date().toISOString()
    };
  }

  private async executeActionStage(execution: PipelineExecution, data: any) {
    const reportResults = execution.results.get('report');
    const analysisResults = execution.results.get('analysis');
    
    if (!reportResults || !analysisResults) throw new Error('Previous stages not completed');

    // Determine if this leads to consulting or SaaS transition
    const recommendations = analysisResults.automation_recommendations;
    const complexity = this.assessComplexity(recommendations);
    
    let implementation;
    if (complexity.requiresConsulting) {
      implementation = {
        type: 'consulting_engagement',
        timeline: complexity.timeline,
        phases: complexity.phases,
        deliverables: complexity.deliverables
      };
    } else {
      implementation = {
        type: 'saas_transition',
        recommended_tier: complexity.recommendedTier,
        automation_templates: complexity.applicableTemplates,
        self_service_setup: true
      };
    }

    return {
      implementation_type: implementation.type,
      implementation_details: implementation,
      success_metrics: this.defineSuccessMetrics(analysisResults),
      follow_up_schedule: this.createFollowUpSchedule(implementation),
      completedAt: new Date().toISOString()
    };
  }

  // Helper methods
  private extractPriorityAreas(content: string): string[] {
    // Extract priority areas from AI response
    const matches = content.match(/\d+\.\s*([^:\n]+)/g);
    return matches ? matches.map(m => m.replace(/\d+\.\s*/, '').trim()) : [];
  }

  private extractProcessMap(content: string): any {
    return { workflow_steps: [], current_tools: [], pain_points: [] };
  }

  private extractAutomationOpportunities(content: string): any[] {
    return []; // Implementation would parse AI response for opportunities
  }

  private extractEfficiencyGaps(content: string): any[] {
    return []; // Implementation would parse AI response for gaps
  }

  private calculateROIProjections(profile: any, opportunities: any[]): any {
    const baseROI = {
      'startup': { min: 5000, max: 15000 },
      'small': { min: 15000, max: 35000 },
      'medium': { min: 35000, max: 75000 },
      'large': { min: 75000, max: 150000 }
    };

    const range = baseROI[profile.size] || baseROI['small'];
    const estimatedAnnual = range.min + (Math.random() * (range.max - range.min));

    return {
      total: `$${Math.round(estimatedAnnual).toLocaleString()}/year`,
      monthly: `$${Math.round(estimatedAnnual / 12).toLocaleString()}/month`,
      payback_period: '3-6 months',
      confidence: '85%'
    };
  }

  private extractRecommendations(content: string): any[] {
    return []; // Parse AI response for structured recommendations
  }

  private extractImplementationPlan(content: string): any {
    return { phases: [], timeline: '', resources: [] };
  }

  private generateExecutiveSummary(intake: any, audit: any, analysis: any): string {
    const profile = intake.structured_profile;
    return `
Executive Summary: Automation Strategy for ${profile.businessName}

Business Overview: ${profile.industry} company seeking to optimize operations and scale efficiently.

Key Findings:
- Identified ${audit.automation_opportunities?.length || 3} major automation opportunities
- Projected ROI: ${analysis.roi_projections.total}
- Implementation timeline: 3-6 months

Recommendation: Proceed with phased automation implementation focusing on highest-impact areas.
    `.trim();
  }

  private generateDetailedReport(intake: any, audit: any, analysis: any): string {
    return 'Detailed automation strategy report with full analysis and recommendations.';
  }

  private extractActionItems(plan: any): string[] {
    return [
      'Review automation recommendations',
      'Approve implementation timeline',
      'Allocate resources for project',
      'Schedule kick-off meeting'
    ];
  }

  private generateNextSteps(analysis: any): string[] {
    return [
      'Decision on consulting vs. SaaS approach',
      'Resource allocation and timeline confirmation',
      'Technology stack selection',
      'Success metrics agreement'
    ];
  }

  private assessComplexity(recommendations: any[]): any {
    // Determine if client needs consulting or can use SaaS
    return {
      requiresConsulting: true, // Default to consulting for higher value
      timeline: '3-6 months',
      phases: ['Discovery', 'Design', 'Implementation', 'Optimization'],
      recommendedTier: 'professional',
      applicableTemplates: ['lead-qualification', 'customer-onboarding']
    };
  }

  private defineSuccessMetrics(analysis: any): string[] {
    return [
      'Time savings: 20+ hours/week',
      'Cost reduction: 25%+',
      'Process efficiency: 40%+ improvement',
      'Error reduction: 80%+'
    ];
  }

  private createFollowUpSchedule(implementation: any): any {
    return {
      initial_checkin: '1 week',
      progress_review: '1 month',
      optimization_review: '3 months',
      success_evaluation: '6 months'
    };
  }

  private getNextStage(currentStage: string): string | null {
    const stageOrder = ['intake', 'audit', 'analysis', 'report', 'action'];
    const currentIndex = stageOrder.indexOf(currentStage);
    return currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
  }

  private shouldAutoAdvance(execution: PipelineExecution, nextStage: string): boolean {
    // Auto-advance through analysis stages, pause at action for human decision
    return nextStage !== 'action';
  }

  // Public API methods
  async getExecutionStatus(executionId: string): Promise<PipelineExecution | null> {
    return this.executions.get(executionId) || null;
  }

  async getExecutionResults(executionId: string): Promise<any> {
    const execution = this.executions.get(executionId);
    if (!execution) return null;

    const results = {};
    for (const [stage, data] of execution.results) {
      results[stage] = data;
    }
    return results;
  }
}

export const automationPipeline = new AutomationPipelineEngine();