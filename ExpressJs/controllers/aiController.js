import { 
  processUserMessage, 
  getPersonalizedRecommendations, 
  summarizeMedicalReport,
  findAvailableSlotsTool,
  searchDoctorsTool
} from '../../AI/index.js';
import dbPool from '../config/db.js';

export const handleAiChat = async (req, res) => {
  try {
    const { message, conversationId, user } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const aiResponse = await processUserMessage({
      message,
      conversationId: conversationId || `session_${req.ip}`,
      user: user || req.user || null,
      dbPool
    });

    res.json(aiResponse);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      message: 'I apologize, but I encountered an issue processing your request. Please try again or browse available doctors directly.',
      intent: 'ERROR',
      error: error.message
    });
  }
};

export const handleAiRecommendations = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user?.user_id;
    const recommendations = await getPersonalizedRecommendations({ patientId, dbPool });
    res.json(recommendations);
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleAiSummarizeReport = async (req, res) => {
  try {
    const { reportText } = req.body;
    if (!reportText) {
      return res.status(400).json({ error: 'Please provide the text content of the medical report.' });
    }

    const summaryResult = summarizeMedicalReport(reportText);
    res.json(summaryResult);
  } catch (error) {
    console.error('AI Summarize Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleAiQuickSlots = async (req, res) => {
  try {
    const { specialty, doctorId, date, timePreference } = req.query;
    const slots = await findAvailableSlotsTool({
      specialty,
      doctorId,
      targetDate: date,
      timePreference,
      dbPool
    });
    res.json({ slots });
  } catch (error) {
    console.error('AI Quick Slots Error:', error);
    res.status(500).json({ error: error.message });
  }
};
