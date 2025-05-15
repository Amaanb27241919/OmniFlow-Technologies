import { InsertAudit } from "@shared/schema";
import OpenAI from "openai";

// Initialize OpenAI client with API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates an AI recommendation based on business audit data
 * Uses OpenAI API to generate a tailored recommendation
 */
export async function generateAIRecommendation(formData: InsertAudit): Promise<string> {
  // Fallback recommendations in case API call fails
  const fallbackRecommendations: {[key: string]: string} = {
    'retail': 'Based on your retail business profile, your highest ROI opportunity is likely implementing an omnichannel strategy. Consider integrating your in-store and online experiences using a platform like Shopify POS, which would allow you to unify inventory, customer data, and sales channels.',
    'service': 'For your service business, the data suggests you should focus on productizing your core service offerings. Create tiered, fixed-price packages that are clearly defined. This will streamline your sales process, improve profit margins by 15-20%, and reduce the time spent on custom proposals.',
    'default': 'Based on your business profile, your highest-impact opportunity is developing a systematic customer success process. Implementing a structured follow-up system could increase your repeat business by 20-30% and generate more consistent referrals from satisfied clients.'
  };
  
  try {
    const prompt = `Based on the following business information, provide a strategic recommendation:
      Business Name: ${formData.businessName}
      Industry: ${formData.industry}
      Business Age: ${formData.businessAge}
      Employees: ${formData.employees}
      Monthly Revenue: ${formData.monthlyRevenue}
      Profit Margin: ${formData.profitMargin}
      Revenue Growing: ${formData.revenueIncreased}
      Primary Expense: ${formData.primaryExpense}
      Uses Automation: ${formData.usesAutomation}
      Automation Tools: ${formData.automationTools?.join(', ') || 'None'}
      Primary Lead Source: ${formData.leadSource}
      Tracks CAC: ${formData.tracksCAC}
      Business Goals: ${formData.businessGoals?.join(', ') || 'Not specified'}
      Biggest Challenges: ${formData.biggestChallenges?.join(', ') || 'Not specified'}
      Additional Information: ${formData.additionalInfo || 'None'}
    
    Provide one specific, high-impact strategic recommendation that this business should implement. 
    Focus on their primary challenge or goal, and include expected outcomes or benefits.
    Keep the recommendation under 150 words and make it very specific to this business.`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 250,
    });

    return response.choices[0].message.content || fallbackRecommendations['default'];
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    
    // Use a specific industry fallback if available, otherwise use default
    return fallbackRecommendations[formData.industry] || 
           fallbackRecommendations['default'];
  }
}
