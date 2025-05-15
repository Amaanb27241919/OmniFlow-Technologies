import { InsertAudit } from "@shared/schema";
import { WorkflowModule } from "@/lib/auditTypes";

/**
 * OmniFlow module details to recommend based on audit responses
 */
const omniFlowModules: Record<string, WorkflowModule> = {
  omniBot: {
    name: "OmniBot",
    description: "Automated lead nurturing and customer engagement solution",
    integrationPoints: [
      "Customer onboarding",
      "Lead qualification",
      "Follow-up sequences",
      "Appointment scheduling"
    ],
    benefits: [
      "Reduce manual follow-up by 80%",
      "Increase conversion rates by 25%",
      "Ensure consistent communication",
      "Scale outreach without additional staff"
    ],
    icon: "robot"
  },
  omniAgent: {
    name: "OmniAgent",
    description: "AI-powered virtual assistant for customer support and task automation",
    integrationPoints: [
      "Customer support",
      "Frequently asked questions",
      "Basic troubleshooting",
      "Information gathering"
    ],
    benefits: [
      "24/7 customer support coverage",
      "Reduce support ticket volume by 40%",
      "Faster response times",
      "Consistent customer experience"
    ],
    icon: "user-check"
  },
  omniAI: {
    name: "OmniAI",
    description: "Predictive analytics and decision support system",
    integrationPoints: [
      "Sales forecasting",
      "Customer behavior prediction",
      "Inventory optimization",
      "Risk assessment"
    ],
    benefits: [
      "Improve decision accuracy by 35%",
      "Identify trends before competitors",
      "Optimize resource allocation",
      "Reduce operational costs"
    ],
    icon: "brain"
  },
  omniForge: {
    name: "OmniForge",
    description: "Customizable workflow automation builder",
    integrationPoints: [
      "Document processing",
      "Approval workflows",
      "Data entry and validation",
      "Cross-platform integrations"
    ],
    benefits: [
      "Reduce process completion time by 60%",
      "Eliminate manual data entry errors",
      "Create consistent business processes",
      "Integrate with existing tools"
    ],
    icon: "layers"
  },
  omniConnect: {
    name: "OmniConnect",
    description: "Integration platform for connecting business systems",
    integrationPoints: [
      "CRM integration",
      "Accounting software",
      "Marketing platforms",
      "Project management tools"
    ],
    benefits: [
      "Centralize business data",
      "Eliminate data silos",
      "Reduce context switching",
      "Create a unified business ecosystem"
    ],
    icon: "git-branch"
  }
};

/**
 * Generate workflow recommendations based on audit responses
 */
export function generateWorkflowRecommendations(formData: InsertAudit): WorkflowModule[] {
  const recommendations: WorkflowModule[] = [];
  
  // Lead management and customer acquisition recommendations
  if (formData.biggestChallenges?.includes('CustomerAcquisition') || 
      formData.leadSource === 'Referrals' || 
      (formData.tracksCAC === 'no' && formData.businessGoals?.includes('IncreaseRevenue'))) {
    recommendations.push(omniFlowModules.omniBot);
  }
  
  // Customer support and operational efficiency
  if (formData.biggestChallenges?.includes('TimeManagement') || 
      formData.employees === '1' || 
      formData.employees === '2-5') {
    recommendations.push(omniFlowModules.omniAgent);
  }
  
  // Business intelligence and predictive analytics
  if (formData.businessGoals?.includes('EnterNewMarkets') || 
      formData.biggestChallenges?.includes('Competition') || 
      (formData.tracksCAC === 'yes' && 
       ['$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', '> $100,000'].includes(formData.monthlyRevenue))) {
    recommendations.push(omniFlowModules.omniAI);
  }
  
  // Process automation for administrative tasks
  if (formData.usesAutomation === 'no' || 
      formData.primaryExpense === 'Staff/Labor' || 
      formData.biggestChallenges?.includes('TimeManagement')) {
    recommendations.push(omniFlowModules.omniForge);
  }
  
  // Integration between systems
  if (formData.automationTools && formData.automationTools.length >= 2 ||
      formData.biggestChallenges?.includes('Technology')) {
    recommendations.push(omniFlowModules.omniConnect);
  }
  
  // If no specific recommendations, suggest the most applicable general solutions
  if (recommendations.length === 0) {
    // For small businesses with growth goals, suggest automation
    if (formData.businessGoals?.includes('IncreaseRevenue')) {
      recommendations.push(omniFlowModules.omniForge);
    }
    
    // For businesses with marketing challenges, suggest lead nurturing
    if (formData.leadSource || formData.tracksCAC === 'no') {
      recommendations.push(omniFlowModules.omniBot);
    }
  }
  
  // Limit to 3 most relevant recommendations
  return recommendations.slice(0, 3);
}