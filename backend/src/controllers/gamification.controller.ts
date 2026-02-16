import { Request, Response } from 'express';
import { processSessionCompletion } from '../services/gamification.service';


export const completeSession = async (req: Request, res: Response) => {
  try {
    const { userId, durationSeconds } = req.body;

    const result = await processSessionCompletion(
      userId,
      durationSeconds
    );

    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(500).json({
      message: "Gamification failed",
      error: error.message
    });
  }
};
