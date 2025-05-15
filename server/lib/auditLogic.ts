import { InsertAudit } from "@shared/schema";
import { generateAIRecommendation } from "./openai";
import { Recommendation } from "@/lib/auditTypes";
import { generateWorkflowRecommendations } from "./workflowRecommendations";

/**
 * Generates complete business audit results from the form data
 */
export async function generateAuditResults(formData: InsertAudit): Promise<any> {
  // Generate strengths based on form data
  const strengths = getBusinessStrengths(formData);
  
  // Generate opportunities based on form data
  const opportunities = getBusinessOpportunities(formData);
  
  // Generate recommendations based on form data
  const recommendations = getRecommendations(formData);
  
  // Generate AI recommendation using OpenAI integration
  const aiRecommendation = await generateAIRecommendation(formData);
  
  // Generate OmniFlow workflow recommendations
  const workflowRecommendations = generateWorkflowRecommendations(formData);
  
  // Return the complete audit results
  return {
    ...formData,
    strengths,
    opportunities,
    recommendations,
    aiRecommendation,
    workflowRecommendations
  };
}

/**
 * Identifies business strengths based on form data
 */
function getBusinessStrengths(formData: InsertAudit): string[] {
  const strengths: string[] = [];
  
  if (formData.revenueIncreased === 'yes') {
    strengths.push('Positive revenue growth trend');
  }
  
  if (formData.usesAutomation === 'yes' && 
      formData.automationTools && 
      formData.automationTools.length > 2) {
    strengths.push('Strong technology adoption with multiple automation tools');
  }
  
  if (formData.leadSource === 'Referrals') {
    strengths.push('Strong customer satisfaction driving referral business');
  }
  
  if (formData.tracksCAC === 'yes') {
    strengths.push('Data-driven marketing approach with CAC tracking');
  }
  
  if (formData.businessAge === '> 10 years') {
    strengths.push('Established business with proven staying power');
  }
  
  // Add default strengths if none were found
  if (strengths.length === 0) {
    if (formData.industry) {
      strengths.push(`Experience in the ${formData.industry} industry`);
    } else {
      strengths.push('Clear business goals and focus areas');
    }
    strengths.push('Taking proactive steps to improve business operations');
  }
  
  return strengths;
}

/**
 * Identifies business opportunities based on form data
 */
function getBusinessOpportunities(formData: InsertAudit): string[] {
  const opportunities: string[] = [];
  
  if (formData.usesAutomation === 'no') {
    opportunities.push('Implement business automation tools to improve efficiency');
  }
  
  if (formData.tracksCAC === 'no' || formData.tracksCAC === 'not sure') {
    opportunities.push('Start tracking customer acquisition costs to optimize marketing spend');
  }
  
  if (formData.biggestChallenges?.includes('TimeManagement')) {
    opportunities.push('Improve operational processes to reduce time spent on administrative tasks');
  }
  
  if (formData.biggestChallenges?.includes('CustomerAcquisition')) {
    opportunities.push('Develop a more robust lead generation strategy');
  }
  
  if (formData.biggestChallenges?.includes('Cashflow')) {
    opportunities.push('Implement better financial planning and forecasting tools');
  }
  
  // Add default opportunities if none were found
  if (opportunities.length === 0) {
    opportunities.push('Explore additional revenue streams or products');
    opportunities.push('Invest in employee training and development');
  }
  
  return opportunities;
}

/**
 * Generates strategic recommendations based on form data
 */
function getRecommendations(formData: InsertAudit): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Technology recommendations
  if (formData.usesAutomation === 'no') {
    recommendations.push({
      title: 'Implement Basic Automation Tools',
      description: 'Start with a CRM system like HubSpot (free tier) to track customer interactions and a tool like Zapier to connect your business apps.'
    });
  } else if (formData.automationTools && !formData.automationTools.includes('CRM')) {
    recommendations.push({
      title: 'Add CRM to Your Tech Stack',
      description: 'Implement a customer relationship management system to better track and nurture leads through your sales pipeline.'
    });
  }
  
  // Financial recommendations
  if (formData.tracksCAC === 'no' || formData.tracksCAC === 'not sure') {
    recommendations.push({
      title: 'Implement Financial Tracking',
      description: 'Set up systems to track key metrics like Customer Acquisition Cost (CAC) and Customer Lifetime Value (CLTV) to make data-driven decisions.'
    });
  }
  
  if (formData.profitMargin === '< 10%') {
    recommendations.push({
      title: 'Improve Profit Margins',
      description: 'Conduct a profitability analysis to identify low-margin products or services and either raise prices or reduce delivery costs.'
    });
  }
  
  // Marketing recommendations
  if (formData.leadSource === 'Referrals') {
    recommendations.push({
      title: 'Formalize Your Referral Program',
      description: 'Create a structured referral program that incentivizes and rewards clients for sending new business your way.'
    });
  }
  
  if (formData.biggestChallenges?.includes('CustomerAcquisition')) {
    recommendations.push({
      title: 'Enhance Lead Generation',
      description: 'Develop a content marketing strategy focused on addressing your target customers\' pain points to attract more qualified leads.'
    });
  }
  
  // Operations recommendations
  if (formData.biggestChallenges?.includes('TimeManagement')) {
    recommendations.push({
      title: 'Streamline Operations',
      description: 'Document your key business processes and identify opportunities for automation or delegation to free up your time for strategic activities.'
    });
  }
  
  // Add default recommendations if none were found
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Develop a Strategic Growth Plan',
      description: 'Create a 12-month strategic plan with specific, measurable objectives aligned with your business goals.'
    });
    recommendations.push({
      title: 'Optimize Your Digital Presence',
      description: 'Ensure your website and social profiles clearly communicate your value proposition and include strong calls to action.'
    });
  }
  
  return recommendations;
}
