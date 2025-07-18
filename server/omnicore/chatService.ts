import OpenAI from "openai";
import { addToHistory } from './historyService';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the ChatInteraction type
export type ChatInteraction = {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
};

// Generate a unique ID for each interaction
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Process a prompt through OpenAI's chat completion
export async function processPrompt(prompt: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    // Create a system message to establish the AI as a business consultant
    const systemMessage = `You are OmniCore AI, an advanced business consultant specializing in helping small and medium businesses 
implement AI automation solutions without requiring extensive technical resources or expertise. 
Your knowledge includes business process optimization, workflow automation, AI implementation strategies, 
and ROI calculation for technology investments. Provide actionable, practical advice that considers 
the limited resources and technical capabilities of small businesses. Format your responses with 
markdown where appropriate for better readability.`;

    // Call the GPT-4o model
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract and return the response content
    const responseText = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    // Create a chat interaction
    const interaction: ChatInteraction = {
      id: generateId(),
      prompt,
      response: responseText,
      timestamp: Date.now()
    };
    
    // Add to history service
    addToHistory(interaction);
    
    return responseText;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error("Failed to process your request. Please try again later.");
  }
}