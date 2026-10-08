import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HealPointAiChat.css';
import { processUserMessage } from '../../../../AI/index.js';

const HealPointAiChat = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: "Hello! I'm **HealPoint AI**, your intelligent healthcare assistant. How can I help you today?",
      intent: 'WELCOME',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '🩺 Find a doctor for symptoms', query: 'I have persistent headaches and dizziness' },
        { label: '📅 Book an appointment', query: 'Find me a dermatologist tomorrow evening' },
        { label: '🕒 Show my next appointment', query: 'When is my next appointment?' },
        { label: '📄 Summarize lab report', query: '/summarize CBC Report: Hemoglobin 10.2 g/dL, WBC 12500 /mcL, Platelets 220000 /mcL, Fasting Glucose 115 mg/dL' }
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState('HealPoint AI is thinking...');
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
        'HealPoint AI is analyzing your request...',
        'Matching medical specialties & symptoms...',
        'Checking real-time doctor availability...',
        'Preparing recommendations...'
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
        console.warn('Backend endpoint unavailable, executing client-side AI processing fallback:', networkErr.message);
        data = await processUserMessage({
          message: query,
          conversationId,
          user
        });
      }

      const aiMsgObj = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.message || "I'm here to assist you with your appointment.",
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
      console.error('Fatal AI processing error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "I can help you find specialists, book appointments, or check your schedule. What would you like to do?",
          intent: 'GENERAL_HEALTH_INFORMATION',
          suggestedActions: [
            { label: '🩺 Find a Doctor', action: 'find_doctor' },
            { label: '📅 Available Slots', action: 'find_slots' }
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionClick = (action) => {
    if (typeof action === 'string') {
      if (action === 'browse_doctors' || action === 'find_doctor') {
        if (navigate) navigate('/doctors');
        else window.location.href = '/doctors';
      } else if (action === 'view_dashboard') {
        if (navigate) navigate('/patient-dashboard');
        else window.location.href = '/patient-dashboard';
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
        text: "Conversation refreshed. How can **HealPoint AI** help you right now?",
        intent: 'WELCOME',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: '🩺 Find a doctor', query: 'Find me a cardiologist' },
          { label: '📅 Book slots', query: 'Show available appointments this Friday' }
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
          aria-label="Open HealPoint AI Assistant"
        >
          <div className="ai-launcher-pulse" />
          <div className="ai-launcher-icon">✨</div>
          <span className="ai-launcher-text">Ask HealPoint AI</span>
        </button>
      )}

      {/* Main AI Chat Interface Modal */}
      {isOpen && (
        <div className={`ai-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-left">
              <div className="ai-header-avatar">✨</div>
              <div className="ai-header-details">
                <div className="ai-header-title">
                  HealPoint AI
                  <span className="ai-status-badge">Online</span>
                </div>
                <div className="ai-header-subtitle">Your Intelligent Healthcare Assistant</div>
              </div>
            </div>
            <div className="ai-header-controls">
              <button 
                className="ai-ctrl-btn" 
                title="Clear Conversation" 
                onClick={clearChat}
              >
                🔄
              </button>
              <button 
                className="ai-ctrl-btn" 
                title={isMinimized ? "Maximize" : "Minimize"} 
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? '▢' : '—'}
              </button>
              <button 
                className="ai-ctrl-btn close-btn" 
                title="Close AI Assistant" 
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="ai-chat-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
                    {msg.sender === 'ai' && <div className="ai-msg-avatar">✨</div>}
                    
                    <div className={`ai-message-bubble ${msg.isEmergency ? 'emergency-bubble' : ''}`}>
                      <div className="ai-msg-text">
                        {msg.text.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>

                      {/* Render Quick Starter Chips */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="ai-quick-actions">
                          {msg.quickActions.map((qa, idx) => (
                            <button 
                              key={idx} 
                              className="ai-chip-btn"
                              onClick={() => handleSendMessage(qa.query)}
                            >
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Render Structured Doctor Cards */}
                      {msg.doctors && msg.doctors.length > 0 && (
                        <div className="ai-doctors-grid">
                          {msg.doctors.map((doc) => (
                            <div key={doc.doctor_id} className="ai-doctor-card">
                              <div className="ai-doc-header">
                                <div className="ai-doc-avatar">👨‍⚕️</div>
                                <div className="ai-doc-info">
                                  <h4 className="ai-doc-name">{doc.name}</h4>
                                  <span className="ai-doc-spec">{doc.specialty}</span>
                                </div>
                                <div className="ai-doc-rating">
                                  ⭐ {doc.rating}
                                </div>
                              </div>
                              <p className="ai-doc-bio">{doc.bio}</p>
                              <div className="ai-doc-meta">
                                <span className="ai-meta-fee">Fee: ${doc.consultation_fee}</span>
                                <span className="ai-meta-loc">📍 {doc.location}</span>
                              </div>
                              <div className="ai-doc-actions">
                                <button 
                                  className="ai-btn-book"
                                  onClick={() => handleSendMessage(`Book appointment with ${doc.name}`)}
                                >
                                  Book Appointment
                                </button>
                                <button 
                                  className="ai-btn-profile"
                                  onClick={() => {
                                    if (navigate) navigate(`/doctors?search=${encodeURIComponent(doc.first_name)}`);
                                    else window.location.href = `/doctors?search=${encodeURIComponent(doc.first_name)}`;
                                  }}
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Available Appointment Slots */}
                      {msg.availableSlots && msg.availableSlots.length > 0 && (
                        <div className="ai-slots-container">
                          <div className="ai-slots-title">Available Slots:</div>
                          <div className="ai-slots-grid">
                            {msg.availableSlots.map((slot, idx) => (
                              <button 
                                key={idx} 
                                className="ai-slot-badge"
                                onClick={() => handleBookSlot(slot)}
                              >
                                <span className="slot-day">{slot.dayOfWeek}</span>
                                <span className="slot-time">{slot.time}</span>
                                <span className="slot-doc">{slot.doctorName}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Render Confirmation Options */}
                      {msg.requiresConfirmation && msg.confirmationOptions && (
                        <div className="ai-confirm-dialog">
                          {msg.confirmationOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              className={`ai-confirm-btn ${opt.variant || 'primary'}`}
                              onClick={() => handleConfirmAction(opt.value)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Render Medical Report Summary */}
                      {msg.reportSummary && (
                        <div className="ai-report-card">
                          <div className="ai-report-badge">📋 {msg.reportSummary.reportType}</div>
                          {msg.reportSummary.abnormalFindings && msg.reportSummary.abnormalFindings.length > 0 && (
                            <div className="ai-report-abnormal">
                              <strong>Flags for Discussion:</strong>
                              <ul>
                                {msg.reportSummary.abnormalFindings.map((item, idx) => (
                                  <li key={idx}>
                                    <strong>{item.name}</strong>: {item.value} ({item.status}) — <em>{item.explanation}</em>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="ai-report-disclaimer">
                            ⚠️ {msg.reportSummary.safetyDisclaimer}
                          </div>
                        </div>
                      )}

                      {/* Render Interactive Action Pills */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="ai-suggested-pills">
                          {msg.suggestedActions.map((sa, idx) => (
                            <button 
                              key={idx} 
                              className="ai-action-pill"
                              onClick={() => handleActionClick(sa.action)}
                            >
                              {sa.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.safetyNotice && (
                        <div className="ai-safety-footer">
                          ℹ️ {msg.safetyNotice}
                        </div>
                      )}

                      <span className="ai-msg-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="ai-message-row ai">
                    <div className="ai-msg-avatar">✨</div>
                    <div className="ai-message-bubble thinking-bubble">
                      <div className="ai-thinking-text">{thinkingPhase}</div>
                      <div className="ai-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form 
                className="ai-chat-input-area"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="ai-chat-input"
                  placeholder="Ask about symptoms, find doctors, book slots..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isThinking}
                />
                <button 
                  type="submit" 
                  className="ai-send-btn"
                  disabled={!inputMessage.trim() || isThinking}
                  aria-label="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
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
