import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LlmService } from '../services/llm.service';

const llmService = new LlmService();

export const chatHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { history, message, systemContext } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await llmService.chat(history || [], message, systemContext);
    res.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
};

export const hintHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { topic, specificContext } = req.body;
    
    if (!topic || !specificContext) {
      return res.status(400).json({ error: 'Topic and specificContext are required' });
    }

    const hint = await llmService.generateHint(topic, specificContext);
    res.json({ hint });
  } catch (error) {
    console.error('AI Hint Error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
};
