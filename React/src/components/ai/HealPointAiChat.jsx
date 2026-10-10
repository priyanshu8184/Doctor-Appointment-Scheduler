import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  Minus, 
  Square, 
  X, 
  Calendar, 
  Video, 
  MapPin, 
  Star, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Stethoscope,
  Clock,
  ChevronRight
} from 'lucide-react';
import './HealPointAiChat.css';
import { processUserMessage, SAMPLE_DOCTORS } from '../../../../AI/index.js';

// Parse inline formatting tokens like **bold text**
const parseInlineFormatting = (text) => {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      const matchIndex = boldMatch.index;
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="ai-bold-text">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(matchIndex + boldMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
};

// Render multi-line AI messages cleanly with styled bullet points and paragraphs
const renderFormattedMessage = (rawText) => {
  if (!rawText) return null;
  const lines = rawText.split('\n');
  const elements = [];
  let currentBullets = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="ai-bullet-list">
          {currentBullets.map((bText, idx) => (
            <li key={idx} className="ai-bullet-item">
              <span className="ai-bullet-dot">•</span>
              <span className="ai-bullet-content">{parseInlineFormatting(bText)}</span>
            </li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      return;
    }

    // Identify bullet items: starts with •, -, or * followed by a space
    if (trimmed.startsWith('•') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
      const cleaned = trimmed.replace(/^[•\-\*]\s*/, '');
      currentBullets.push(cleaned);
    } else {
      flushBullets();
      elements.push(
        <p key={`p-${lineIdx}`} className="ai-msg-paragraph">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushBullets();
  return elements;
};

const formatSlotDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

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
                  <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
                    {msg.sender === 'ai' && (
                      <div className="ai-msg-avatar">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className="ai-message-bubble">
                      {/* Emergency Notice */}
                      {msg.isEmergency && (
                        <div className="ai-emergency-badge">
                          <AlertTriangle size={14} />
                          <span>Immediate Medical Attention Recommended</span>
                        </div>
                      )}

                      {/* Main Message Text */}
                      <div className="ai-msg-content">
                        {renderFormattedMessage(msg.text)}
                      </div>

                      {/* Render Structured Booking Confirmation */}
                      {msg.bookingDetails && (
                        <div className="ai-booking-confirmation-card">
                          <div className="ai-booking-header">
                            <span className="ai-booking-tag">
                              <CheckCircle2 size={13} /> Appointment Reserved
                            </span>
                            <span className="ai-booking-id">ID: {msg.bookingDetails.appointmentId || '#HP-8891'}</span>
                          </div>

                          <div className="ai-booking-doc-info">
                            <div className="ai-booking-avatar">
                              <User size={18} />
                            </div>
                            <div>
                              <h4 className="ai-booking-doc-name">{msg.bookingDetails.doctor?.name || 'Dr. Priya Nair'}</h4>
                              <span className="ai-booking-doc-spec">{msg.bookingDetails.doctor?.specialty || 'General Medicine'}</span>
                            </div>
                          </div>

                          <ul className="ai-booking-bullet-details">
                            <li>
                              <Calendar size={13} className="ai-bullet-icon" />
                              <div className="ai-bullet-text">
                                <strong>Date & Time:</strong> {msg.bookingDetails.date || 'Tomorrow'} at {msg.bookingDetails.time || '5:30 PM'}
                              </div>
                            </li>
                            <li>
                              <Video size={13} className="ai-bullet-icon" />
                              <div className="ai-bullet-text">
                                <strong>Consultation Type:</strong> {msg.bookingDetails.type || 'Video Consultation (WebRTC)'}
                              </div>
                            </li>
                            <li>
                              <MapPin size={13} className="ai-bullet-icon" />
                              <div className="ai-bullet-text">
                                <strong>Location / Link:</strong> {msg.bookingDetails.location || msg.bookingDetails.doctor?.location || 'HealPoint Patient Dashboard'}
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}

                      {/* Render Quick Starter Chips */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="ai-quick-actions">
                          {msg.quickActions.map((qa, idx) => (
                            <button 
                              key={idx} 
                              className="ai-chip-btn"
                              onClick={() => handleSendMessage(qa.query)}
                            >
                              <Sparkles size={12} className="chip-icon" />
                              <span>{qa.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Render Structured Doctor Cards */}
                      {msg.doctors && msg.doctors.length > 0 && (
                        <div className="ai-doctors-grid">
                          {msg.doctors.map((doc) => (
                            <div key={doc.doctor_id} className="ai-chat-doctor-card">
                              <div className="ai-doc-header">
                                <div className="ai-doc-avatar">
                                  <User size={15} />
                                </div>
                                <div className="ai-doc-info">
                                  <h4 className="ai-doc-name">{doc.name}</h4>
                                  <span className="ai-doc-spec">{doc.specialty}</span>
                                </div>
                                <div className="ai-doc-rating">
                                  <Star size={11} className="star-filled" />
                                  <span>{doc.rating}</span>
                                </div>
                              </div>
                              <p className="ai-doc-bio">{doc.bio}</p>
                              <div className="ai-doc-meta">
                                <div className="ai-meta-fee-wrap">
                                  <span className="fee-label">Consultation Fee:</span>
                                  <span className="fee-amount">${doc.consultation_fee}</span>
                                </div>
                                <button 
                                  className="ai-book-slot-btn"
                                  onClick={() => handleSendMessage(`Book appointment with ${doc.name} for tomorrow`)}
                                >
                                  <Calendar size={13} />
                                  <span>Book Slot</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render Available Appointment Slots */}
                      {msg.availableSlots && msg.availableSlots.length > 0 && (
                        <div className="ai-slots-container">
                          <div className="ai-slots-title">
                            <Clock size={13} className="slots-clock-icon" />
                            <span>Select an available time slot:</span>
                          </div>
                          <div className="ai-slots-grid">
                            {msg.availableSlots.map((slot, idx) => (
                              <button 
                                key={idx} 
                                className="ai-slot-pill"
                                onClick={() => handleBookSlot(slot)}
                              >
                                <span className="slot-time">{slot.time}</span>
                                <span className="slot-divider">•</span>
                                <span className="slot-date">{formatSlotDate(slot.date)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Render User Appointments List */}
                      {msg.appointments && msg.appointments.length > 0 && (
                        <div className="ai-appointments-list">
                          <div className="ai-apts-header">
                            <Calendar size={13} />
                            <span>Your Upcoming Appointments:</span>
                          </div>
                          {msg.appointments.map((apt, idx) => (
                            <div key={idx} className="ai-apt-card">
                              <div className="ai-apt-top">
                                <strong>{apt.doctor_name || apt.doctorName || 'Doctor Consultation'}</strong>
                                <span className="ai-apt-status">{apt.status || 'SCHEDULED'}</span>
                              </div>
                              <div className="ai-apt-meta">
                                <span>📅 {apt.appointment_datetime || apt.date}</span>
                                <span>📍 {apt.location || 'Online Video'}</span>
                              </div>
                            </div>
                          ))}
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
                          <div className="ai-report-badge">
                            <FileText size={13} /> {msg.reportSummary.reportType}
                          </div>
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
                            <AlertTriangle size={13} /> {msg.reportSummary.safetyDisclaimer}
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
                              <span>{sa.label}</span>
                              <ChevronRight size={13} className="pill-chevron" />
                            </button>
                          ))}
                        </div>
                      )}

                      {msg.safetyNotice && (
                        <div className="ai-safety-footer">
                          <span>{msg.safetyNotice}</span>
                        </div>
                      )}

                      <span className="ai-msg-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="ai-message-row ai">
                    <div className="ai-msg-avatar">
                      <Bot size={14} />
                    </div>
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
