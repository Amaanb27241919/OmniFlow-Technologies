import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a business insight tooltip based on a field and its context
 * @param field - The form field to generate insights for
 * @param industry - The industry context (optional)
 * @returns An object with title and content for the tooltip
 */
export async function generateInsightTooltip(field: string, industry?: string): Promise<{ title: string, content: string }> {
  try {
    // Create a context-aware prompt based on the field and industry
    const prompt = createPromptForField(field, industry);
    
    // Call OpenAI API to generate the tooltip content
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a business consultant providing brief, actionable insights on specific business metrics and data points. Keep responses concise (50-70 words) and focused on practical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    // Extract and format the response
    const responseText = response.choices[0].message.content?.trim() || "";
    
    // Parse the response to extract a title and content
    const lines = responseText.split("\n").filter(line => line.trim() !== "");
    let title = field.replace(/([A-Z])/g, ' $1').trim(); // Default title: format camelCase to "Camel Case"
    let content = responseText;
    
    // If the response has a title-like format (first line ending with : or first line is shorter)
    if (lines.length > 1) {
      const firstLine = lines[0];
      if (firstLine.endsWith(':') || firstLine.length < 50) {
        title = firstLine.replace(':', '').trim();
        content = lines.slice(1).join("\n").trim();
      }
    }
    
    return {
      title,
      content
    };
  } catch (error) {
    console.error("Error generating tooltip:", error);
    return {
      title: "Business Insight",
      content: "We're unable to generate an insight for this field right now. Please try again later."
    };
  }
}

/**
 * Create an appropriate prompt based on the field and industry context
 */
function createPromptForField(field: string, industry?: string): string {
  const industryContext = industry ? `for a ${industry} business` : "";
  
  // Field-specific prompts
  const prompts: Record<string, string> = {
    businessName: `Provide a brief tip about choosing an effective business name ${industryContext}. Why is it important for branding?`,
    
    industry: `What are key success factors in the ${industry || "chosen"} industry? Provide a brief insight on industry trends.`,
    
    businessAge: `How does business age affect strategy and decision-making ${industryContext}? Provide a brief insight on the different stages of business growth.`,
    
    employees: `How does team size impact operations ${industryContext}? Provide a brief insight on scaling teams effectively.`,
    
    monthlyRevenue: `What should businesses ${industryContext} consider when analyzing their monthly revenue? Provide a brief insight on revenue patterns.`,
    
    profitMargin: `Why is profit margin a key metric ${industryContext}? Provide a brief insight on improving margins.`,
    
    revenueIncreased: `What factors typically drive revenue growth ${industryContext}? Provide a brief insight on sustainable growth strategies.`,
    
    primaryExpense: `How can businesses optimize their primary expense categories ${industryContext}? Provide a brief insight on cost management.`,
    
    usesAutomation: `Why is automation important for businesses ${industryContext}? Provide a brief insight on effective automation strategies.`,
    
    automationTools: `What are effective automation tools ${industryContext}? Provide a brief insight on tool selection.`,
    
    leadSource: `How can businesses optimize their lead generation channels ${industryContext}? Provide a brief insight on diversifying lead sources.`,
    
    tracksCAC: `Why is tracking customer acquisition costs important ${industryContext}? Provide a brief insight on CAC optimization.`,
    
    businessGoals: `How should businesses prioritize their goals ${industryContext}? Provide a brief insight on goal setting.`,
    
    biggestChallenges: `How can businesses overcome common challenges ${industryContext}? Provide a brief insight on problem-solving approaches.`,
    
    additionalInfo: `What information is typically most valuable for business analysis ${industryContext}? Provide a brief insight on data-driven decision making.`
  };
  
  return prompts[field] || 
    `Provide a brief business insight related to ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} ${industryContext}.`;
}

/**
 * Pre-generate a set of commonly used tooltips to reduce API calls
 * @param industry - The industry to generate tooltips for
 * @returns An object mapping field names to tooltip objects
 */
export async function preGenerateTooltips(industry?: string): Promise<Record<string, { title: string, content: string }>> {
  const tooltips: Record<string, { title: string, content: string }> = {};
  const commonFields = [
    "businessName",
    "industry", 
    "businessAge", 
    "employees", 
    "monthlyRevenue",
    "profitMargin"
  ];
  
  try {
    // Generate tooltips for common fields concurrently
    const tooltipPromises = commonFields.map(field => 
      generateInsightTooltip(field, industry)
        .then(tooltip => ({ field, tooltip }))
    );
    
    // Wait for all tooltips to be generated
    const results = await Promise.all(tooltipPromises);
    
    // Organize results into the tooltips object
    results.forEach(({ field, tooltip }) => {
      tooltips[field] = tooltip;
    });
    
    return tooltips;
  } catch (error) {
    console.error("Error pre-generating tooltips:", error);
    return {};
  }
}