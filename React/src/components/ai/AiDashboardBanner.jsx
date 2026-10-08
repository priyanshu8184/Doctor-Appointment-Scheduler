import React from 'react';
import './AiDashboardBanner.css';

const AiDashboardBanner = ({ onTriggerAiAction }) => {
  const quickActions = [
    { label: '🔍 Find a Doctor by Symptoms', query: 'I need a doctor for my symptoms' },
    { label: '⚡ Book Earliest Available Slot', query: 'Find earliest available slot tomorrow' },
    { label: '🕒 Check My Next Appointment', query: 'When is my next appointment?' },
    { label: '📋 Summarize Medical Report', query: '/summarize CBC Report: Hemoglobin 11.0 g/dL, WBC 9000, Fasting Glucose 95 mg/dL' },
    { label: '🤖 Ask Ghasitaram Anything', query: 'What specialties are available?' }
  ];

  return (
    <div className="ai-dashboard-banner">
      <div className="ai-banner-content">
        <div className="ai-banner-badge">
          <span className="ai-sparkle">🤖</span> Ghasitaram AI • “Health ka jhatpat jawab.”
        </div>
        <h2 className="ai-banner-title">What can I help you with today?</h2>
        <p className="ai-banner-subtitle">
          Describe symptoms, find top specialists, check available slots, or summarize medical lab reports with 🤖Ghasitaram.
        </p>

        <div className="ai-banner-actions">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="ai-banner-btn"
              onClick={() => onTriggerAiAction(action.query)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiDashboardBanner;
