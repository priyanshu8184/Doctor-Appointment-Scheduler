import { Router } from 'express';
import { 
  handleAiChat, 
  handleAiRecommendations, 
  handleAiSummarizeReport,
  handleAiQuickSlots 
} from '../controllers/aiController.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', handleAiChat);

// GET /api/ai/recommendations
router.get('/recommendations', handleAiRecommendations);

// POST /api/ai/summarize-report
router.post('/summarize-report', handleAiSummarizeReport);

// GET /api/ai/quick-slots
router.get('/quick-slots', handleAiQuickSlots);

export default router;
