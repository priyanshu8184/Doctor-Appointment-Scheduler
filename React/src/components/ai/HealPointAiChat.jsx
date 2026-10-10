import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  Minus, 
  Square, 
  X, 
  Sparkles 
} from 'lucide-react';
import './HealPointAiChat.css';
import { processUserMessage } from '../../../../AI/index.js';
import ChatMessageItem from './chat/ChatMessageItem';

const HealPointAiChat = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "Hello! I'm Ghasitaram, your HealPoint AI assistant. How can I help you today? You can search for specialists, check your schedule, book appointment slots, or summarize lab reports.",
      intent: 'WELCOME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: 'Find a doctor by symptoms', query: 'I have persistent headaches and dizziness' },
        { label: 'Book an appointment', query: 'Find me a dermatologist tomorrow evening' },
        { label: 'Show my next appointment', query: 'When is my next appointment?' },
        { label: 'Summarize lab report', query: '/summarize CBC Report: Hemoglobin 10.2 g/dL, WBC 12500 /mcL, Platelets 220000 /mcL, Fasting Glucose 115 mg/dL' }
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState('Ghasitaram is thinking...');
  const [conversationId, setConversationId] = useState(`conv_${Date.now()}`);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!isMinimized) inputRef.current?.focus();
    }
  }, [messages, isOpen, isThinking, isMinimized]);

  // Cycle thinking phrases for intelligent feel
  useEffect(() => {
    let timer;
    if (isThinking) {
      const phases = [
        'Analyzing symptoms & clinical intent...',
        'Matching specialties & doctor schedules...',
        'Checking real-time doctor availability...',
        'Preparing clinical response...'
      ];
      let i = 0;
      timer = setInterval(() => {
        i = (i + 1) % phases.length;
        setThinkingPhase(phases[i]);
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isThinking]);

  useEffect(() => {
    const handleTrigger = (e) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail && e.detail.query) {
        handleSendMessage(e.detail.query);
      }
    };
    window.addEventListener('openHealPointAi', handleTrigger);
    return () => window.removeEventListener('openHealPointAi', handleTrigger);
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isThinking) return;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const userMsgObj = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setIsThinking(true);

    try {
      let data;
      try {
        const res = await axios.post(`${API_BASE_URL}/ai/chat`, {
          message: query,
          conversationId,
          user
        }, { timeout: 3500 });
        data = res.data;
      } catch (networkErr) {
        console.warn('Backend endpoint unreachable, executing client-side AI processing fallback:', networkErr.message);
        data = await processUserMessage({
          message: query,
          conversationId,
          user
        });
      }

      const aiMsgObj = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.message || "I'm here to assist you with your healthcare inquiry.",
        intent: data.intent,
        doctors: data.doctors || [],
        availableSlots: data.availableSlots || [],
        appointments: data.appointments || [],
        reportSummary: data.reportSummary || null,
        bookingDetails: data.bookingDetails || null,
        requiresConfirmation: data.requiresConfirmation || false,
        confirmationOptions: data.confirmationOptions || [],
        suggestedActions: data.suggestedActions || [],
        safetyNotice: data.safetyNotice || null,
        isEmergency: data.isEmergency || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      console.error('AI processing error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "I can help you find specialists, book appointments, or check your schedule. How would you like to proceed?",
          intent: 'GENERAL_HEALTH_INFORMATION',
          suggestedActions: [
            { label: 'Find a Doctor', action: 'find_doctor' },
            { label: 'Available Slots', action: 'find_slots' }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionClick = (action) => {
    let role = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        role = (JSON.parse(userStr)?.role || '').toUpperCase();
      }
    } catch (e) {}

    if (typeof action === 'string') {
      if (action === 'browse_doctors' || action === 'find_doctor') {
        const target = role === 'DOCTOR' ? '/doctor-dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/doctors';
        if (navigate) navigate(target);
        else window.location.href = target;
      } else if (action === 'view_dashboard') {
        const target = role === 'DOCTOR' ? '/doctor-dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/patient-dashboard';
        if (navigate) navigate(target);
        else window.location.href = target;
      } else if (action === 'view_appointments') {
        handleSendMessage('Show my upcoming appointments');
      } else if (action === 'find_slots') {
        handleSendMessage('Find available slots');
      } else if (action === 'new_query') {
        handleSendMessage('What else can you help me with?');
      } else if (action.startsWith('book_doc_')) {
        handleSendMessage('Book this appointment for tomorrow evening');
      } else if (action.startsWith('cancel_')) {
        handleSendMessage('Cancel my appointment');
      } else {
        handleSendMessage(action);
      }
    }
  };

  const handleConfirmAction = (val) => {
    if (val === 'yes') {
      handleSendMessage('Yes, confirm cancellation');
    } else {
      handleSendMessage('No, keep appointment');
    }
  };

  const handleBookSlot = (slot) => {
    handleSendMessage(`Book appointment with ${slot.doctorName} on ${slot.date} at ${slot.time}`);
  };

  const clearChat = () => {
    setConversationId(`conv_${Date.now()}`);
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: "Conversation refreshed. I'm **Ghasitaram**, your HealPoint healthcare assistant. How can I assist you right now?",
        intent: 'WELCOME',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: 'Find a doctor', query: 'Find me a cardiologist' },
          { label: 'Book slots', query: 'Show available appointments this Friday' }
        ]
      }
    ]);
  };

  return (
    <div className="healpoint-ai-wrapper">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button 
          className="ai-launcher-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Ghasitaram AI Assistant"
        >
          <div className="ai-launcher-icon-wrap">
            <Bot size={18} aria-hidden="true" />
            <span className="ai-launcher-online-dot" />
          </div>
          <div className="ai-launcher-content">
            <span className="ai-launcher-label">Ask Ghasitaram</span>
            <span className="ai-launcher-sub">AI Health Assistant</span>
          </div>
        </button>
      )}

      {/* Main AI Chat Interface Modal */}
      {isOpen && (
        <div className={`ai-chat-window ${isMinimized ? 'minimized' : ''}`} role="dialog" aria-label="Ghasitaram Medical Assistant">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-header-avatar">
                <Bot size={18} aria-hidden="true" />
              </div>
              <div className="ai-header-details">
                <div className="ai-header-title">
                  <span>Ghasitaram</span>
                  <span className="ai-status-badge">
                    <span className="ai-status-dot" /> Online
                  </span>
                </div>
                <div className="ai-header-subtitle">HealPoint AI Care Assistant</div>
              </div>
            </div>
            <div className="ai-header-controls">
              <button 
                type="button" 
                className="ai-ctrl-btn" 
                title="Reset Conversation" 
                aria-label="Reset Conversation"
                onClick={clearChat}
              >
                <RotateCcw size={14} />
              </button>
              <button 
                type="button" 
                className="ai-ctrl-btn" 
                title={isMinimized ? "Maximize" : "Minimize"} 
                aria-label={isMinimized ? "Maximize" : "Minimize"}
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Square size={13} /> : <Minus size={13} />}
              </button>
              <button 
                type="button" 
                className="ai-ctrl-btn" 
                title="Close Chat" 
                aria-label="Close Chat"
                onClick={() => setIsOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="ai-chat-messages" role="log" aria-live="polite">
                {messages.map((msg) => (
                  <ChatMessageItem 
                    key={msg.id}
                    msg={msg}
                    onSendMessage={handleSendMessage}
                    onBookSlot={handleBookSlot}
                    onConfirmAction={handleConfirmAction}
                    onActionClick={handleActionClick}
                  />
                ))}

                {/* Thinking Animation */}
                {isThinking && (
                  <div className="ai-message-row ai">
                    <div className="ai-msg-avatar">
                      <Bot size={14} />
                    </div>
                    <div className="ai-message-bubble thinking-bubble">
                      <div className="thinking-dots">
                        <span /><span /><span />
                      </div>
                      <span className="thinking-text">{thinkingPhase}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form 
                className="ai-chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input 
                  ref={inputRef}
                  type="text"
                  className="ai-input-field"
                  placeholder="Describe symptoms, ask for specialists, or type a request..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isThinking}
                />
                <button 
                  type="submit" 
                  className="ai-send-btn"
                  disabled={!inputMessage.trim() || isThinking}
                  aria-label="Send message to Ghasitaram AI"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HealPointAiChat;
