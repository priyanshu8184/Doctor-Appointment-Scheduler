import React, { useState } from 'react';
import { 
  FileText, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Stethoscope, 
  User, 
  Star, 
  MapPin, 
  Clock 
} from 'lucide-react';

const LabReportAnalysisView = ({
  analysisResult,
  currentFileName,
  isDemoReport,
  recommendedDoctors = [],
  onOpenBooking
}) => {
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'abnormal' | 'normal'

  if (!analysisResult) return null;

  const filteredFindings = (analysisResult.findings || []).filter(f => {
    if (tableFilter === 'abnormal') return f.isAbnormal;
    if (tableFilter === 'normal') return !f.isAbnormal;
    return true;
  });

  return (
    <div className="analysis-results-section" id="ai-results-view">
      {/* Emergency Alert Banner (if critical) */}
      {analysisResult.isEmergency && analysisResult.emergencyNotice && (
        <div className="emergency-alert-card" role="alert">
          <AlertTriangle size={20} className="alert-icon" aria-hidden="true" />
          <div className="alert-body">
            <h4>Clinical Safety Notice</h4>
            <p>{analysisResult.emergencyNotice}</p>
          </div>
        </div>
      )}

      {/* Top Meta Bar */}
      <div className="results-top-bar">
        <div className="results-title-group">
          <div className="results-header-row">
            <h3 className="results-main-title">Lab Report Analysis Summary</h3>
            {isDemoReport && (
              <span className="sample-report-badge">
                Demo / Sample Report
              </span>
            )}
          </div>
          <div className="results-meta-tags">
            <span className="meta-tag">
              <FileText size={13} aria-hidden="true" />
              <span>{currentFileName || 'Diagnostic Report'}</span>
            </span>
            <span className="meta-tag">
              <Activity size={13} aria-hidden="true" />
              <span>{analysisResult.reportType}</span>
            </span>
            <span className="meta-tag">
              <Calendar size={13} aria-hidden="true" />
              <span>{new Date(analysisResult.analyzedAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </span>
          </div>
        </div>
        <div className="status-badge-container">
          <span className="completed-badge">
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>Analysis Complete</span>
          </span>
        </div>
      </div>

      {/* 1. Overall Summary Card */}
      <div className="summary-card">
        <div className="section-title-row">
          <Activity size={17} className="title-icon" aria-hidden="true" />
          <h4>Clinical Summary</h4>
        </div>
        <p className="summary-text">{analysisResult.summary}</p>
        <div className="summary-metrics-bar">
          <div className="metric-pill">
            <span className="metric-label">Parameters Extracted:</span>
            <span className="metric-val">{analysisResult.totalParametersDetected || analysisResult.findings?.length || 0}</span>
          </div>
          <div className={`metric-pill ${analysisResult.abnormalCount > 0 ? 'warning' : 'success'}`}>
            <span className="metric-label">Out of Reference Range:</span>
            <span className="metric-val">{analysisResult.abnormalCount || 0}</span>
          </div>
          <div className="metric-pill info">
            <span className="metric-label">Recommended Specialty:</span>
            <span className="metric-val">{analysisResult.primarySpecialty || 'General Medicine'}</span>
          </div>
        </div>
      </div>

      {/* 2. Abnormal Findings Cards */}
      {analysisResult.abnormalFindings && analysisResult.abnormalFindings.length > 0 && (
        <div className="abnormal-findings-section">
          <div className="section-title-row">
            <AlertTriangle size={17} className="title-icon warning" aria-hidden="true" />
            <h4>Abnormal Findings ({analysisResult.abnormalFindings.length})</h4>
          </div>
          <div className="abnormal-cards-grid">
            {analysisResult.abnormalFindings.map((abn, idx) => (
              <div key={idx} className={`abnormal-card status-${abn.status}`}>
                <div className="abn-card-header">
                  <h5 className="abn-test-name">{abn.test}</h5>
                  <span className={`abn-badge badge-${abn.status}`}>
                    {abn.statusLabel || (abn.status.includes('low') ? 'Low' : 'High')}
                  </span>
                </div>
                <div className="abn-values-row">
                  <div className="val-box current">
                    <span className="label">Result</span>
                    <span className="val">{abn.value} {abn.unit}</span>
                  </div>
                  <div className="val-box reference">
                    <span className="label">Reference Range</span>
                    <span className="val">{abn.referenceRange}</span>
                  </div>
                </div>
                <div className="abn-explanation">
                  <strong>Clinical context:</strong>
                  <p>{abn.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Possible Conditions Section */}
      {analysisResult.possibleConditions && analysisResult.possibleConditions.length > 0 && (
        <div className="possible-conditions-section">
          <div className="section-title-row">
            <Info size={17} className="title-icon" aria-hidden="true" />
            <h4>Conditions to Discuss With Your Doctor</h4>
          </div>
          <div className="disclaimer-safety-pill">
            <ShieldAlert size={14} aria-hidden="true" />
            <span><strong>Clinical Note:</strong> AI observations highlight topics for physician discussion, not a final medical diagnosis.</span>
          </div>
          <div className="conditions-list">
            {analysisResult.possibleConditions.map((cond, idx) => (
              <div key={idx} className="condition-card">
                <div className="condition-header">
                  <div className="cond-title">
                    <strong>{cond.name}</strong>
                  </div>
                  <span className="confidence-tag">{cond.confidence || 'Worth Discussing'}</span>
                </div>
                <p className="condition-reason">{cond.reason}</p>
                <div className="condition-action">
                  <strong>Suggested action:</strong> {cond.recommendedAction || 'Consult with a qualified healthcare physician.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Structured Lab Values Table */}
      <div className="lab-table-section">
        <div className="table-header-row">
          <div className="section-title-row">
            <FileText size={17} className="title-icon" aria-hidden="true" />
            <h4>Structured Lab Biomarkers</h4>
          </div>
          <div className="table-filters" role="group" aria-label="Biomarker Filters">
            <button
              type="button"
              className={`filter-btn ${tableFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTableFilter('all')}
            >
              All ({analysisResult.findings?.length || 0})
            </button>
            <button
              type="button"
              className={`filter-btn ${tableFilter === 'abnormal' ? 'active' : ''}`}
              onClick={() => setTableFilter('abnormal')}
            >
              Abnormal ({analysisResult.abnormalFindings?.length || 0})
            </button>
            <button
              type="button"
              className={`filter-btn ${tableFilter === 'normal' ? 'active' : ''}`}
              onClick={() => setTableFilter('normal')}
            >
              Normal ({(analysisResult.findings?.length || 0) - (analysisResult.abnormalFindings?.length || 0)})
            </button>
          </div>
        </div>

        <div className="table-responsive-container">
          <table className="lab-values-table">
            <thead>
              <tr>
                <th scope="col">Biomarker / Test</th>
                <th scope="col">Category</th>
                <th scope="col">Reported Result</th>
                <th scope="col">Reference Range</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((row, idx) => (
                <tr key={idx} className={row.isAbnormal ? 'row-abnormal' : 'row-normal'}>
                  <td className="col-test-name">
                    <strong>{row.test}</strong>
                  </td>
                  <td className="col-category">{row.category}</td>
                  <td className="col-result">
                    <span className={`result-value-badge ${row.status}`}>
                      {row.value} {row.unit}
                    </span>
                  </td>
                  <td className="col-ref-range">{row.referenceRange}</td>
                  <td className="col-status">
                    <span className={`table-status-pill status-${row.status}`}>
                      {row.statusLabel || (row.isAbnormal ? 'Out of Range' : 'Normal')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Recommended Specialists */}
      {analysisResult.recommendedSpecialties && analysisResult.recommendedSpecialties.length > 0 && (
        <div className="recommended-specialties-section">
          <div className="section-title-row">
            <Stethoscope size={17} className="title-icon" aria-hidden="true" />
            <h4>Recommended Medical Specialties</h4>
          </div>
          <div className="specialties-cards-grid">
            {analysisResult.recommendedSpecialties.map((spec, idx) => (
              <div key={idx} className={`specialty-recommendation-card ${spec.priority === 'Primary' ? 'primary-spec' : ''}`}>
                <div className="spec-badge-row">
                  <span className="spec-name">{spec.specialty}</span>
                  <span className="priority-tag">{spec.priority || 'Recommended'}</span>
                </div>
                <p className="spec-reason">{spec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Doctors You May Want to Consult */}
      <div className="recommended-doctors-section">
        <div className="section-title-row">
          <Stethoscope size={17} className="title-icon" aria-hidden="true" />
          <div>
            <h4>Specialists You May Want to Consult</h4>
            <p className="section-subtext">Connected with HealPoint Doctor Directory and live appointment schedules</p>
          </div>
        </div>

        <div className="doctors-cards-grid">
          {recommendedDoctors.length > 0 ? (
            recommendedDoctors.map((doc) => (
              <div key={doc.doctor_id || doc.id} className="ai-doctor-card">
                <div className="doc-card-top">
                  <div className="doc-avatar">
                    {doc.profile_picture ? (
                      <img src={doc.profile_picture} alt={doc.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div className="avatar-fallback-icon" style={{ display: doc.profile_picture ? 'none' : 'flex' }}>
                      <User size={20} />
                    </div>
                  </div>
                  <div className="doc-info">
                    <h5 className="doc-name">{doc.name}</h5>
                    <p className="doc-specialty">{doc.specialty}</p>
                    <div className="doc-rating-row">
                      <Star size={13} className="star-filled" aria-hidden="true" />
                      <span className="rating-val">{doc.rating || 4.8}</span>
                      <span className="review-count">({doc.reviews_count || 110} reviews)</span>
                    </div>
                  </div>
                  {doc.matchScore && (
                    <div className="doc-match-badge" title="AI Recommendation Match Score">
                      {doc.matchScore}% Match
                    </div>
                  )}
                </div>

                {doc.whyThisDoctor && (
                  <div className="why-this-doctor-pill">
                    <strong>Why this doctor:</strong> {doc.whyThisDoctor}
                  </div>
                )}

                <div className="doc-meta-details">
                  <div className="meta-item">
                    <MapPin size={13} aria-hidden="true" />
                    <span className="meta-val">{doc.location || 'HealPoint Health Clinic'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Fee:</span>
                    <span className="meta-val">${doc.consultation_fee || 60}.00</span>
                  </div>
                  <div className="meta-item next-slot">
                    <Clock size={13} aria-hidden="true" />
                    <span className="meta-val highlight">{doc.nextAvailableSlot || 'Today, 6:30 PM'}</span>
                  </div>
                </div>

                <div className="doc-actions-row">
                  <button
                    type="button"
                    className="book-appointment-btn"
                    onClick={() => onOpenBooking(doc)}
                  >
                    <Calendar size={14} aria-hidden="true" />
                    <span>Book Consultation</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-doctors-msg">No immediate specialists found in catalog. Please check back shortly.</p>
          )}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="ai-safety-footer">
        <ShieldAlert size={16} className="safety-icon" aria-hidden="true" />
        <p>
          <strong>Clinical Advisory:</strong> {analysisResult.safetyNotice || 'HealPoint AI provides educational lab report interpretations and specialist matching. Observations do not constitute a definitive medical diagnosis. Always consult a qualified physician for clinical decisions.'}
        </p>
      </div>
    </div>
  );
};

export default LabReportAnalysisView;
