import { Router, Request, Response } from 'express';
import { processPrompt } from './chatService';
import { getAllHistory, clearHistory } from './historyService';

const router = Router();

// POST /api/chat - Process a chat prompt
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid prompt is required' });
    }
    
    const response = await processPrompt(prompt);
    
    return res.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({ 
      error: 'Failed to process your request. Please try again later.' 
    });
  }
});

// GET /api/history - Get chat history
router.get('/history', (req: Request, res: Response) => {
  try {
    const history = getAllHistory();
    return res.json({ history });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve chat history. Please try again later.' 
    });
  }
});

// DELETE /api/history - Clear chat history
router.delete('/history', (req: Request, res: Response) => {
  try {
    clearHistory();
    return res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ 
      error: 'Failed to clear chat history. Please try again later.' 
    });
  }
});

export default router;