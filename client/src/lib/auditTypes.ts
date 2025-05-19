export interface AuditQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'number';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  category?: string;
}

export interface AuditTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: string;
  questions: AuditQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditFormData {
  businessName: string;
  industry: string;
  subIndustry: string;
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
  // Metadata for tracking form submission type
  formType?: "standard" | "industry";  // Track what type of form was used
  templateId?: string;                 // Track which template was used (if any)
  [key: string]: any; // Using any to allow for dynamic fields from templates
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface WorkflowStepAction {
  description: string;
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resources?: string[];
}

export interface WorkflowImplementationStep {
  title: string;
  description: string;
  actions: WorkflowStepAction[];
  expectedOutcome: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WorkflowModule {
  name: string;
  description: string;
  integrationPoints: string[];
  benefits: string[];
  icon: string;
  businessArea: 'marketing' | 'operations' | 'finance' | 'customer_service' | 'sales' | 'general';
  estimatedTimeToImplement: string;
  estimatedCostSavings: string;
  estimatedRoi: string;
  implementationSteps?: WorkflowImplementationStep[];
}

export interface AuditResults extends AuditFormData {
  id: number;
  strengths: string[];
  opportunities: string[];
  recommendations: Recommendation[];
  aiRecommendation: string;
  workflowRecommendations?: WorkflowModule[];
  createdAt: string;
}
