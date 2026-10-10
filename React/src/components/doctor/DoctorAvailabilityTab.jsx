import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CalendarOff,
  Sparkles,
  Info
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const DoctorAvailabilityTab = ({
  availabilitySlots = [],
  onAddAvailability,
  onDeleteAvailability
}) => {
  const [ruleType, setRuleType] = useState('RECURRING'); // 'RECURRING' or 'SPECIFIC_DATE'
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [specificDate, setSpecificDate] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE'); // 'AVAILABLE' or 'UNAVAILABLE'
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30'); // in minutes
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [hasBreak, setHasBreak] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAvailability({
      availFormType: ruleType,
      availFormDay: selectedDay,
      availFormDate: specificDate,
      availFormStatus: availabilityStatus,
      availFormStart: startTime,
      availFormEnd: endTime,
      slotDuration,
      breakStart: hasBreak ? breakStart : null,
      breakEnd: hasBreak ? breakEnd : null
    });
  };

  const recurringRules = availabilitySlots.filter(s => !s.specific_date);
  const exceptionRules = availabilitySlots.filter(s => s.specific_date);

  return (
    <div className="doctor-tab-container">
      {/* 1. Availability Overview & Configuration */}
      <div className="doc-content-card" style={{ marginBottom: '1.5rem' }}>
        <div className="doc-card-header">
          <div>
            <h2 className="doc-card-title">Clinical Availability & Working Hours</h2>
            <p className="doc-card-subtitle">
              Configure your consultation shifts, recurring clinical hours, and scheduled leaves.
            </p>
          </div>
          <div className="doc-badge-pill-teal">
            <Sparkles size={14} />
            <span>Instant Patient Booking Sync</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="doc-availability-form">
          <div className="doc-form-row">
            {/* Rule Type Selector */}
            <div className="doc-form-group">
              <label className="doc-form-label">Schedule Mode</label>
              <div className="doc-type-toggle-group">
                <button
                  type="button"
                  className={`doc-toggle-btn ${ruleType === 'RECURRING' ? 'active' : ''}`}
                  onClick={() => setRuleType('RECURRING')}
                >
                  <Calendar size={15} />
                  <span>Weekly Recurring</span>
                </button>
                <button
                  type="button"
                  className={`doc-toggle-btn ${ruleType === 'SPECIFIC_DATE' ? 'active' : ''}`}
                  onClick={() => setRuleType('SPECIFIC_DATE')}
                >
                  <CalendarOff size={15} />
                  <span>Specific Date / Leave</span>
                </button>
              </div>
            </div>

            {/* Target Day or Date */}
            {ruleType === 'RECURRING' ? (
              <div className="doc-form-group">
                <label className="doc-form-label">Day of the Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="doc-form-input"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="doc-form-group">
                <label className="doc-form-label">Select Exception Date</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  required
                  className="doc-form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* Status (Available vs Blocked) */}
            <div className="doc-form-group">
              <label className="doc-form-label">Shift Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="doc-form-input"
              >
                <option value="AVAILABLE">✅ Available for Bookings</option>
                <option value="UNAVAILABLE">🚫 Blocked / Doctor On Leave</option>
              </select>
            </div>
          </div>

          {/* Time & Slot Details (Only if Available) */}
          {availabilityStatus === 'AVAILABLE' && (
            <div className="doc-availability-time-section">
              <div className="doc-form-row">
                <div className="doc-form-group">
                  <label className="doc-form-label">Shift Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="doc-form-input"
                  />
                </div>

                <div className="doc-form-group">
                  <label className="doc-form-label">Shift End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="doc-form-input"
                  />
                </div>

                <div className="doc-form-group">
                  <label className="doc-form-label">Slot Duration</label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    className="doc-form-input"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Standard)</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (Comprehensive)</option>
                  </select>
                </div>
              </div>

              {/* Break Times Option */}
              <div className="doc-break-toggle-row">
                <label className="doc-checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasBreak}
                    onChange={(e) => setHasBreak(e.target.checked)}
                  />
                  <span>Add Midday Break / Lunch Interval</span>
                </label>

                {hasBreak && (
                  <div className="doc-break-inputs">
                    <div className="doc-break-group">
                      <span>Break From:</span>
                      <input
                        type="time"
                        value={breakStart}
                        onChange={(e) => setBreakStart(e.target.value)}
                        className="doc-form-input sm"
                      />
                    </div>
                    <div className="doc-break-group">
                      <span>Break To:</span>
                      <input
                        type="time"
                        value={breakEnd}
                        onChange={(e) => setBreakEnd(e.target.value)}
                        className="doc-form-input sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="doc-btn primary">
              <PlusCircle size={16} />
              <span>Save Schedule Rule</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Active Weekly Schedule Cards */}
      <div className="doc-content-card" style={{ marginBottom: '1.5rem' }}>
        <div className="doc-card-header">
          <div>
            <h2 className="doc-card-title">Weekly Recurring Schedule</h2>
            <p className="doc-card-subtitle">Regular consultation hours published to patients</p>
          </div>
        </div>

        <div className="doc-schedule-grid">
          {DAYS_OF_WEEK.map((day) => {
            const rules = recurringRules.filter(r => r.day_of_week === day);
            const isConfigured = rules.length > 0;
            const isAvailable = isConfigured && rules.some(r => r.is_available);

            return (
              <div
                key={day}
                className={`doc-schedule-card ${isAvailable ? 'active' : isConfigured ? 'blocked' : 'empty'}`}
              >
                <div className="schedule-card-header">
                  <span className="day-name">{day.slice(0, 3)}</span>
                  <span className="day-full">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                </div>

                <div className="schedule-card-body">
                  {rules.length > 0 ? (
                    rules.map((rule) => (
                      <div key={rule.id} className="schedule-slot-item">
                        <div className="slot-time-info">
                          {rule.is_available ? (
                            <>
                              <Clock size={13} color="#087F72" />
                              <span className="slot-hours">{rule.slots}</span>
                            </>
                          ) : (
                            <span className="slot-blocked">🚫 Off Duty</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteAvailability(rule.id)}
                          className="slot-delete-btn"
                          title="Remove rule"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="schedule-no-slots">
                      <span>No hours set</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Specific Date Exceptions / Leaves */}
      <div className="doc-content-card">
        <div className="doc-card-header">
          <div>
            <h2 className="doc-card-title">Scheduled Leaves & Date Exceptions</h2>
            <p className="doc-card-subtitle">Custom blocks or single-day shifts</p>
          </div>
        </div>

        {exceptionRules.length > 0 ? (
          <div className="doc-exception-list">
            {exceptionRules.map((rule) => (
              <div key={rule.id} className="doc-exception-item">
                <div className="exception-info">
                  <div className="exception-date-badge">
                    <Calendar size={16} color="#2563EB" />
                    <strong>{rule.specific_date}</strong>
                  </div>
                  <span className={`exception-status-pill ${rule.is_available ? 'available' : 'blocked'}`}>
                    {rule.is_available ? `Custom Hours: ${rule.slots}` : '🚫 Entire Day Blocked (Leave)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAvailability(rule.id)}
                  className="doc-btn danger sm"
                >
                  <Trash2 size={14} />
                  <span>Remove Exception</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="doc-empty-state" style={{ padding: '2rem 1rem' }}>
            <CalendarOff size={32} color="#94A3B8" />
            <h3 style={{ fontSize: '1rem', marginTop: '0.5rem' }}>No date-specific exceptions</h3>
            <p style={{ fontSize: '0.875rem' }}>You have not blocked any specific dates or holidays.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailabilityTab;
