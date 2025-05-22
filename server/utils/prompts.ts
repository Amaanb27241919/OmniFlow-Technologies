/**
 * Prompt templates for different automation tasks
 */

export const PROMPT_TEMPLATES = {
  summarize: {
    system: "You are an expert at creating clear, concise summaries that capture the key points and actionable insights from any content.",
    user: (content: string) => `Please provide a comprehensive summary of the following content. Focus on the main points, key insights, and any actionable items:\n\n${content}`
  },

  rewrite: {
    system: "You are a professional content writer who excels at improving clarity, engagement, and professionalism in written communication.",
    user: (content: string) => `Please rewrite the following content to be more professional, clear, and engaging while maintaining the original meaning and intent:\n\n${content}`
  },

  audit: {
    system: "You are a senior business consultant with expertise in operational efficiency, automation, and strategic planning. Provide detailed, actionable business insights.",
    user: (content: string) => `Please conduct a thorough business audit of the following information. Analyze strengths, weaknesses, opportunities for improvement, and provide specific recommendations:\n\n${content}`
  },

  'generate-copy': {
    system: "You are a skilled marketing copywriter who creates compelling, persuasive content that drives engagement and conversions.",
    user: (brief: string) => `Please create compelling marketing copy based on the following brief. Make it engaging, persuasive, and targeted to the intended audience:\n\n${brief}`
  },

  insights: {
    system: "You are a strategic business analyst who extracts meaningful insights and trends from data and information to guide decision-making.",
    user: (data: string) => `Please analyze the following information and provide strategic business insights, trends, and recommendations for action:\n\n${data}`
  },

  businessAudit: {
    system: "You are a senior business consultant and automation expert specializing in helping small to medium businesses optimize their operations through AI and automation.",
    user: (businessData: any) => `
    Conduct a comprehensive business audit based on the following data:
    
    ${JSON.stringify(businessData, null, 2)}
    
    Please provide a detailed analysis including:
    
    ## 🎯 Executive Summary
    Brief overview of current state and key recommendations
    
    ## 💪 Key Strengths
    What the business is doing well
    
    ## 🔍 Areas for Improvement
    Specific areas that need attention
    
    ## 🤖 Automation Opportunities
    Concrete AI/automation solutions that could help
    
    ## 📈 Growth Recommendations
    Strategic recommendations for scaling
    
    ## ⚠️ Risk Assessment
    Potential challenges and how to mitigate them
    
    ## 📋 Priority Action Plan
    Top 5 actions to take in order of priority
    
    Format your response as a professional business report with clear sections and actionable insights tailored to their industry and business size.
    `
  }
};

/**
 * Get prompt template for a specific task type
 */
export function getPromptTemplate(type: string) {
  return PROMPT_TEMPLATES[type as keyof typeof PROMPT_TEMPLATES] || PROMPT_TEMPLATES.insights;
}