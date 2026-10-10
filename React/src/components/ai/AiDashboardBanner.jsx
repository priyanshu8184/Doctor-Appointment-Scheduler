import React from 'react';
import { Stethoscope, FileText, Calendar, HelpCircle, Bot } from 'lucide-react';
import './AiDashboardBanner.css';

const AiDashboardBanner = ({ onTriggerAiAction, onNavigateTab }) => {
  const primaryActions = [
    { 
      label: 'Find a Doctor', 
      icon: <Stethoscope size={15} aria-hidden="true" />, 
      onClick: () => onTriggerAiAction('I need to find a doctor for my symptoms'),
      isPrimary: true
    },
    { 
      label: 'Analyze Lab Report', 
      icon: <FileText size={15} aria-hidden="true" />, 
      onClick: () => {
        if (onNavigateTab) {
          onNavigateTab('lab-reports');
        } else {
          onTriggerAiAction('/summarize CBC Report: Hemoglobin 11.0 g/dL, WBC 9000, Fasting Glucose 95 mg/dL');
        }
      },
      isPrimary: true
    }
  ];

  const secondaryActions = [
    { 
      label: 'Check Appointments', 
      icon: <Calendar size={14} aria-hidden="true" />, 
      onClick: () => onTriggerAiAction('When is my next appointment?')
    },
    { 
      label: 'Ask a Question', 
      icon: <HelpCircle size={14} aria-hidden="true" />, 
      onClick: () => onTriggerAiAction('What medical specialties and services are available?')
    }
  ];

  return (
    <section className="ai-dashboard-banner" aria-label="Ghasitaram AI Assistant">
      <div className="ai-banner-main">
        <div className="ai-banner-header">
          <div className="ai-banner-badge">
            <Bot size={13} className="ai-badge-icon" aria-hidden="true" />
            <span>Ghasitaram AI • Clinical Care Assistant</span>
          </div>
          <h2 className="ai-banner-title">How can Ghasitaram help you today?</h2>
          <p className="ai-banner-subtitle">
            Search symptoms, connect with verified specialists, check appointment schedules, or upload diagnostic lab reports for AI-powered summaries.
          </p>
        </div>

        <div className="ai-banner-actions-group">
          <div className="ai-actions-row">
            {primaryActions.map((action, idx) => (
              <button
                key={`pri-${idx}`}
                type="button"
                className="ai-action-btn primary"
                onClick={action.onClick}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
            {secondaryActions.map((action, idx) => (
              <button
                key={`sec-${idx}`}
                type="button"
                className="ai-action-btn secondary"
                onClick={action.onClick}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDashboardBanner;
