import React from 'react';
import { 
  Bot, 
  Calendar, 
  Video, 
  MapPin, 
  Star, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { renderFormattedMessage, formatSlotDate } from '../../../utils/aiFormatting';

const ChatMessageItem = ({
  msg,
  onSendMessage,
  onBookSlot,
  onConfirmAction,
  onActionClick
}) => {
  return (
    <div className={`ai-message-row ${msg.sender}`}>
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
                onClick={() => onSendMessage(qa.query)}
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
                    onClick={() => onSendMessage(`Book appointment with ${doc.name} for tomorrow`)}
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
                  onClick={() => onBookSlot(slot)}
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
                onClick={() => onConfirmAction(opt.value)}
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
          <div className="ai-actions-row">
            {msg.suggestedActions.map((action, idx) => (
              <button
                key={idx}
                className="ai-action-btn"
                onClick={() => onActionClick(action.action || action)}
              >
                <span>{action.label || action}</span>
                <ChevronRight size={12} />
              </button>
            ))}
          </div>
        )}

        {/* Safety Note & Timestamp */}
        {msg.safetyNotice && (
          <div className="ai-safety-footer">
            <AlertTriangle size={11} />
            <span>{msg.safetyNotice}</span>
          </div>
        )}

        <div className="ai-msg-time">{msg.timestamp}</div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
