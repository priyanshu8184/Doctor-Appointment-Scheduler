import React from 'react';

const DoctorCard = ({
  doctor,
  isImageFailed,
  onImageError,
  onBookClick
}) => {
  const cleanInitial = doctor.name.replace('Dr. ', '').charAt(0) || 'D';

  return (
    <article className="doctor-card">
      <div className="doc-card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <span className="doc-avail-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#087F72', background: 'rgba(8, 127, 114, 0.08)', padding: '0.25rem 0.6rem', borderRadius: '100px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#087F72' }} />
          <span>{doctor.availability}</span>
        </span>
        <span className="doc-fee-badge" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111C2F', background: '#F5F8F6', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid #E1E8E5' }}>{doctor.fee}</span>
      </div>

      <div className="doctor-card-header" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '0.85rem', paddingBottom: '0.85rem', borderBottom: '1px solid #E1E8E5' }}>
        <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E1E8E5', background: '#F5F8F6' }}>
          {!isImageFailed ? (
            <img 
              src={doctor.portraitUrl} 
              alt={doctor.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={onImageError}
              loading="lazy"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #111C2F, #087F72)', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              {cleanInitial}
            </div>
          )}
          <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '15px', height: '15px', borderRadius: '50%', background: '#087F72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, border: '1.5px solid #fff' }}>✓</span>
        </div>

        <div className="doctor-info" style={{ flex: 1, minWidth: 0 }}>
          <h2 className="doctor-name" style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.name}</h2>
          <span className="doctor-specialty-badge" style={{ display: 'inline-block', background: 'rgba(8, 127, 114, 0.08)', color: '#087F72', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{doctor.specialization}</span>
        </div>

        <div className="doctor-rating-box" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
          <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★</span>
          <strong style={{ fontSize: '0.85rem', color: '#92400E' }}>{doctor.rating}</strong>
        </div>
      </div>

      <p className="doc-bio" style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.45', margin: '0 0 0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doctor.bio}</p>

      <div className="meta-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>📍 {doctor.location}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>💼 {doctor.experience}</span>
      </div>

      <div className="card-actions" style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
        <button 
          type="button" 
          className="primary-btn book-now-btn" 
          onClick={() => onBookClick(doctor)}
          style={{ flex: 1, padding: '0.65rem 0.85rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: '8px', background: '#087F72', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <span>Book Appointment</span>
        </button>
      </div>
    </article>
  );
};

export default DoctorCard;
