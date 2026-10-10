import React from 'react';
import { Calendar, Clock, CheckCircle2, Award, AlertCircle } from 'lucide-react';

const DoctorStatCards = ({
  stats = {
    todayCount: 0,
    pendingCount: 0,
    upcomingConfirmedCount: 0,
    completedCount: 0
  },
  loading = false
}) => {
  const cards = [
    {
      id: 'today',
      title: "Today's Appointments",
      value: stats.todayCount,
      subtitle: 'Scheduled for today',
      icon: Calendar,
      color: '#087F72',
      bg: 'rgba(8, 127, 114, 0.08)'
    },
    {
      id: 'pending',
      title: 'Pending Requests',
      value: stats.pendingCount,
      subtitle: 'Awaiting your confirmation',
      icon: AlertCircle,
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.1)'
    },
    {
      id: 'upcoming',
      title: 'Upcoming Confirmed',
      value: stats.upcomingConfirmedCount,
      subtitle: 'Confirmed future consultations',
      icon: CheckCircle2,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)'
    },
    {
      id: 'completed',
      title: 'Completed Consultations',
      value: stats.completedCount,
      subtitle: 'Finished clinical visits',
      icon: Award,
      color: '#059669',
      bg: 'rgba(5, 150, 105, 0.08)'
    }
  ];

  return (
    <div className="doctor-stat-grid">
      {cards.map(card => {
        const IconComponent = card.icon;
        return (
          <div key={card.id} className="doctor-stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: card.bg, color: card.color }}>
              <IconComponent size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.title}</span>
              <div className="stat-value-row">
                <span className="stat-value">{loading ? '...' : card.value}</span>
                {card.id === 'pending' && stats.pendingCount > 0 && (
                  <span className="stat-badge pending-badge">Action Required</span>
                )}
              </div>
              <span className="stat-sub">{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DoctorStatCards;
