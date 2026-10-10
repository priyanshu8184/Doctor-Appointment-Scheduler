import React from 'react';
import { FileText, RotateCw, Trash2 } from 'lucide-react';

const LabReportHistoryTab = ({
  reportHistory = [],
  loadingHistory,
  onViewReport,
  onDeleteReport,
  onGoToAnalyzer
}) => {
  return (
    <div className="history-tab-content">
      <div className="history-header">
        <h3>Diagnostic Report History</h3>
        <p>Access your past laboratory investigations and historical AI evaluations.</p>
      </div>

      {loadingHistory ? (
        <div className="loading-state">
          <RotateCw size={18} className="spin-icon" />
          <span>Loading report history...</span>
        </div>
      ) : reportHistory.length > 0 ? (
        <div className="history-grid">
          {reportHistory.map((rep) => (
            <div key={rep.id} className="history-report-card">
              <div className="rep-icon-wrap">
                <FileText size={22} className="rep-icon" aria-hidden="true" />
              </div>
              <div className="rep-info">
                <div className="rep-title-row">
                  <h4 className="rep-title">{rep.file_name}</h4>
                  {rep.is_sample && <span className="sample-badge-small">Sample</span>}
                </div>
                <p className="rep-type">{rep.report_type || 'Diagnostic Report'}</p>
                <span className="rep-date">
                  Uploaded on {new Date(rep.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="rep-status-tag">Status: {rep.analysis_status}</div>
              </div>
              <div className="rep-actions">
                <button
                  type="button"
                  className="view-analysis-btn"
                  onClick={() => onViewReport(rep)}
                >
                  <span>View Analysis</span>
                </button>
                <button
                  type="button"
                  className="delete-report-btn"
                  onClick={(e) => onDeleteReport(rep.id, e)}
                  title="Delete Report"
                  aria-label="Delete Report"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-history-state">
          <FileText size={32} className="empty-icon" aria-hidden="true" />
          <h4>No Lab Reports Uploaded Yet</h4>
          <p>Upload your first lab report in the Analyzer tab to begin tracking your laboratory history.</p>
          <button
            type="button"
            className="browse-files-btn primary-action"
            onClick={onGoToAnalyzer}
          >
            Go to Analyzer
          </button>
        </div>
      )}
    </div>
  );
};

export default LabReportHistoryTab;
