import React from 'react';
import { TrendingUp } from 'lucide-react';

const LabReportTrendsTab = ({
  trendData = []
}) => {
  return (
    <div className="trends-tab-content">
      <div className="trends-header">
        <h3>Longitudinal Biomarker Trends</h3>
        <p>
          Track laboratory biomarkers across multiple reports over time to understand health trends with HealPoint AI.
        </p>
      </div>

      {trendData.length > 0 ? (
        <div className="trends-grid">
          {trendData.map((trend, idx) => (
            <div key={idx} className="trend-card">
              <div className="trend-card-header">
                <h4>{trend.testName}</h4>
                <span className="trend-unit">Unit: {trend.unit}</span>
              </div>
              <div className="trend-ref">Reference: {trend.referenceRange}</div>

              <div className="trend-points-timeline">
                {trend.dataPoints.map((dp, pIdx) => (
                  <div key={pIdx} className="trend-point-item">
                    <div className="point-date">{dp.date}</div>
                    <div className={`point-value-pill status-${dp.status}`}>
                      {dp.value} {trend.unit}
                    </div>
                    <div className="point-file" title={dp.fileName}>{dp.fileName}</div>
                  </div>
                ))}
              </div>

              <div className="trend-ai-interpretation">
                <strong>AI Clinical Note:</strong>{' '}
                {trend.dataPoints.length > 1
                  ? `Values tracked across ${trend.dataPoints.length} reports. Review this longitudinal progression with your physician for comprehensive clinical interpretation.`
                  : `Baseline value recorded. Upload future reports to track progression over time.`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-trends-state">
          <TrendingUp size={32} className="empty-icon" aria-hidden="true" />
          <h4>Biomarker Trends Require Multiple Reports</h4>
          <p>Upload reports over time to view progression charts for Hemoglobin, Blood Sugar, Cholesterol, and Vitamins.</p>
        </div>
      )}
    </div>
  );
};

export default LabReportTrendsTab;
