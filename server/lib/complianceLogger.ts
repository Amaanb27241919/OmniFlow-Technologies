// Compliance-Ready Logging System for OmniFlow Platform
interface ComplianceLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  service: 'advisory' | 'omnicore';
  dataProcessed: {
    type: 'business_data' | 'personal_data' | 'financial_data' | 'communication';
    sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
    fields: string[];
  };
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation';
  retention: {
    period: string;
    reason: string;
    deleteAfter: Date;
  };
  aiModelUsed?: string;
  costTracking: {
    tokens: number;
    cost: number;
    model: string;
  };
  version: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DataProcessingAgreement {
  userId: string;
  consentGiven: Date;
  purposes: string[];
  dataTypes: string[];
  retentionPeriod: string;
  withdrawalRight: boolean;
  thirdPartySharing: boolean;
  version: string;
}

export class ComplianceLogger {
  private logs: ComplianceLog[] = [];
  private agreements: Map<string, DataProcessingAgreement> = new Map();
  private retentionPolicies = {
    'business_data': '7 years', // Standard business records retention
    'personal_data': '2 years', // GDPR compliance
    'financial_data': '7 years', // Financial regulations
    'communication': '3 years' // Communication records
  };

  async logDataProcessing(params: {
    userId: string;
    action: string;
    service: 'advisory' | 'omnicore';
    dataType: ComplianceLog['dataProcessed']['type'];
    sensitivity: ComplianceLog['dataProcessed']['sensitivity'];
    fields: string[];
    purpose: string;
    legalBasis: ComplianceLog['legalBasis'];
    aiModel?: string;
    tokens?: number;
    cost?: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<string> {
    
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const retentionPeriod = this.retentionPolicies[params.dataType];
    const deleteAfter = this.calculateDeleteDate(retentionPeriod);

    const log: ComplianceLog = {
      id: logId,
      timestamp: new Date(),
      userId: params.userId,
      action: params.action,
      service: params.service,
      dataProcessed: {
        type: params.dataType,
        sensitivity: params.sensitivity,
        fields: params.fields
      },
      purpose: params.purpose,
      legalBasis: params.legalBasis,
      retention: {
        period: retentionPeriod,
        reason: `${params.service} service delivery and legal compliance`,
        deleteAfter
      },
      aiModelUsed: params.aiModel,
      costTracking: {
        tokens: params.tokens || 0,
        cost: params.cost || 0,
        model: params.aiModel || 'none'
      },
      version: '1.0',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    };

    this.logs.push(log);
    
    // In production, this would also save to secure database
    await this.persistLog(log);
    
    return logId;
  }

  async recordConsent(userId: string, consentData: {
    purposes: string[];
    dataTypes: string[];
    retentionPeriod: string;
    thirdPartySharing: boolean;
  }): Promise<void> {
    const agreement: DataProcessingAgreement = {
      userId,
      consentGiven: new Date(),
      purposes: consentData.purposes,
      dataTypes: consentData.dataTypes,
      retentionPeriod: consentData.retentionPeriod,
      withdrawalRight: true,
      thirdPartySharing: consentData.thirdPartySharing,
      version: '1.0'
    };

    this.agreements.set(userId, agreement);
    
    await this.logDataProcessing({
      userId,
      action: 'consent_recorded',
      service: 'advisory',
      dataType: 'personal_data',
      sensitivity: 'confidential',
      fields: ['consent_preferences'],
      purpose: 'Legal compliance and service delivery',
      legalBasis: 'consent'
    });
  }

  async validateConsent(userId: string, purpose: string, dataType: string): Promise<boolean> {
    const agreement = this.agreements.get(userId);
    if (!agreement) return false;

    return agreement.purposes.includes(purpose) && 
           agreement.dataTypes.includes(dataType);
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalLogs: number;
    dataProcessingBreakdown: any;
    costAnalysis: any;
    complianceScore: number;
    recommendations: string[];
  }> {
    const filteredLogs = this.logs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );

    const breakdown = this.analyzeDataProcessing(filteredLogs);
    const costAnalysis = this.analyzeCosts(filteredLogs);
    const complianceScore = this.calculateComplianceScore(filteredLogs);
    const recommendations = this.generateRecommendations(filteredLogs);

    return {
      totalLogs: filteredLogs.length,
      dataProcessingBreakdown: breakdown,
      costAnalysis,
      complianceScore,
      recommendations
    };
  }

  async requestDataDeletion(userId: string): Promise<{
    success: boolean;
    deletedRecords: number;
    retainedRecords: number;
    retentionReasons: string[];
  }> {
    const userLogs = this.logs.filter(log => log.userId === userId);
    let deletedCount = 0;
    let retainedCount = 0;
    const retentionReasons: string[] = [];

    for (const log of userLogs) {
      if (this.canDeleteLog(log)) {
        // Mark for deletion
        deletedCount++;
      } else {
        retainedCount++;
        retentionReasons.push(`${log.action}: ${log.retention.reason}`);
      }
    }

    // Remove user agreement
    this.agreements.delete(userId);

    return {
      success: true,
      deletedRecords: deletedCount,
      retainedRecords: retainedCount,
      retentionReasons: [...new Set(retentionReasons)]
    };
  }

  private calculateDeleteDate(retentionPeriod: string): Date {
    const now = new Date();
    const years = parseInt(retentionPeriod.split(' ')[0]);
    return new Date(now.getFullYear() + years, now.getMonth(), now.getDate());
  }

  private async persistLog(log: ComplianceLog): Promise<void> {
    // In production, this would save to encrypted database with proper access controls
    console.log(`Compliance log saved: ${log.id}`);
  }

  private analyzeDataProcessing(logs: ComplianceLog[]): any {
    const breakdown = {
      byDataType: {},
      bySensitivity: {},
      byService: {},
      byLegalBasis: {}
    };

    logs.forEach(log => {
      // Count by data type
      breakdown.byDataType[log.dataProcessed.type] = 
        (breakdown.byDataType[log.dataProcessed.type] || 0) + 1;
      
      // Count by sensitivity
      breakdown.bySensitivity[log.dataProcessed.sensitivity] = 
        (breakdown.bySensitivity[log.dataProcessed.sensitivity] || 0) + 1;
      
      // Count by service
      breakdown.byService[log.service] = 
        (breakdown.byService[log.service] || 0) + 1;
      
      // Count by legal basis
      breakdown.byLegalBasis[log.legalBasis] = 
        (breakdown.byLegalBasis[log.legalBasis] || 0) + 1;
    });

    return breakdown;
  }

  private analyzeCosts(logs: ComplianceLog[]): any {
    const totalCost = logs.reduce((sum, log) => sum + log.costTracking.cost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.costTracking.tokens, 0);
    
    const costByModel = {};
    logs.forEach(log => {
      if (log.aiModelUsed) {
        costByModel[log.aiModelUsed] = 
          (costByModel[log.aiModelUsed] || 0) + log.costTracking.cost;
      }
    });

    return {
      totalCost: totalCost.toFixed(4),
      totalTokens,
      averageCostPerLog: (totalCost / logs.length).toFixed(4),
      costByModel
    };
  }

  private calculateComplianceScore(logs: ComplianceLog[]): number {
    let score = 100;
    
    // Deduct points for missing consent validation
    const missingConsent = logs.filter(log => 
      log.legalBasis === 'consent' && !this.agreements.has(log.userId)
    ).length;
    score -= missingConsent * 2;
    
    // Deduct points for high-sensitivity data without proper legal basis
    const riskySensitiveData = logs.filter(log => 
      log.dataProcessed.sensitivity === 'restricted' && 
      log.legalBasis !== 'legal_obligation'
    ).length;
    score -= riskySensitiveData * 5;
    
    // Deduct points for missing retention policies
    const missingRetention = logs.filter(log => 
      !log.retention.deleteAfter
    ).length;
    score -= missingRetention * 3;

    return Math.max(score, 0);
  }

  private generateRecommendations(logs: ComplianceLog[]): string[] {
    const recommendations: string[] = [];
    
    // Check for high-cost models
    const highCostLogs = logs.filter(log => log.costTracking.cost > 0.10);
    if (highCostLogs.length > logs.length * 0.3) {
      recommendations.push('Consider optimizing AI model usage to reduce costs');
    }
    
    // Check for missing consent
    const consentRequired = logs.filter(log => log.legalBasis === 'consent');
    if (consentRequired.length > 0) {
      recommendations.push('Ensure proper consent collection for all data processing');
    }
    
    // Check data retention
    const oldLogs = logs.filter(log => 
      log.retention.deleteAfter && log.retention.deleteAfter < new Date()
    );
    if (oldLogs.length > 0) {
      recommendations.push(`${oldLogs.length} logs are past retention period and should be reviewed for deletion`);
    }

    return recommendations;
  }

  private canDeleteLog(log: ComplianceLog): boolean {
    // Cannot delete if within legal retention period
    if (log.retention.deleteAfter > new Date()) {
      return false;
    }
    
    // Cannot delete if legal hold applies
    if (log.dataProcessed.type === 'financial_data') {
      return false; // Financial data has stricter retention requirements
    }
    
    return true;
  }
}

export const complianceLogger = new ComplianceLogger();