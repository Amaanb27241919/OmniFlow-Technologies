import { Request, Response } from 'express';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Enhanced system prompt for business automation context
    const systemPrompt = `You are an expert AI business automation consultant for OmniCore, a platform that helps small businesses implement AI automation. You specialize in:

1. Business automation strategy and implementation
2. AI tool recommendations and integration
3. Workflow optimization and process improvement
4. ROI calculation and business growth strategies
5. Content creation and marketing automation
6. Customer relationship management automation
7. Data analysis and business insights

Provide practical, actionable advice that small business owners can implement. Be specific about tools, processes, and implementation steps. Focus on automation solutions that save time and increase efficiency.

Keep responses helpful, professional, and focused on business value. When suggesting automation tools or strategies, explain the benefits and potential ROI.`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
}