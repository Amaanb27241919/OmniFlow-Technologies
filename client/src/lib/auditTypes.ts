export interface AuditFormData {
  businessName: string;
  industry: string;
  businessAge: string;
  employees: string;
  monthlyRevenue: string;
  profitMargin: string;
  revenueIncreased: string;
  primaryExpense: string;
  usesAutomation: string;
  automationTools: string[];
  leadSource: string;
  tracksCAC: string;
  businessGoals: string[];
  biggestChallenges: string[];
  additionalInfo: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface AuditResults extends AuditFormData {
  id: number;
  strengths: string[];
  opportunities: string[];
  recommendations: Recommendation[];
  aiRecommendation: string;
  createdAt: string;
}
