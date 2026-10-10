import React, { useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCheck, 
  ChevronDown, 
  ChevronUp, 
  RotateCw, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';

const LabReportUploadSection = ({
  selectedFile,
  dragActive,
  onDrag,
  onDrop,
  onFileSelected,
  sampleList = [],
  selectedSampleId,
  onSelectSample,
  rawTextInput,
  setRawTextInput,
  showTextInput,
  setShowTextInput,
  errorMsg,
  isAnalyzing,
  analysisStep,
  onStartAnalysis
}) => {
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <>
      {/* Upload & Demo Selector Section */}
      <div className="upload-and-options-grid">
        {/* Left: Drag & Drop Zone */}
        <div
          className={`dropzone-container ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          aria-label="Upload Lab Report Document"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
          <div className="dropzone-icon-wrap">
            <UploadCloud size={32} className="dropzone-icon" aria-hidden="true" />
          </div>
          <h3 className="dropzone-title">
            {selectedFile ? selectedFile.name : 'Drop your lab report here, or browse'}
          </h3>
          <p className="dropzone-hint">
            Supported formats: <strong>PDF, JPG, PNG</strong> (Max 10MB)
          </p>
          <div className="dropzone-actions">
            <button 
              type="button" 
              className="browse-files-btn primary-action" 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <FileText size={14} aria-hidden="true" />
              <span>{selectedFile ? 'Change File' : 'Select File from Device'}</span>
            </button>
          </div>
        </div>

        {/* Right: Instant One-Click Demo Samples & Text Mode */}
        <div className="demo-samples-card">
          <div className="demo-header">
            <div className="demo-title-row">
              <FileCheck size={16} className="demo-title-icon" aria-hidden="true" />
              <h4>Try Demo Reports</h4>
            </div>
            <p>Instant evaluation with verified clinical sample datasets:</p>
          </div>

          <div className="sample-buttons-list">
            {sampleList.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className={`sample-select-btn ${selectedSampleId === sample.id ? 'selected' : ''}`}
                onClick={() => onSelectSample(sample.id)}
              >
                <div className="sample-btn-title">
                  <span>{sample.title}</span>
                </div>
                <div className="sample-btn-subtitle">{sample.subtitle}</div>
              </button>
            ))}
          </div>

          <div className="text-toggle-row">
            <button
              type="button"
              className="text-toggle-btn"
              onClick={() => setShowTextInput(!showTextInput)}
            >
              {showTextInput ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showTextInput ? 'Hide Text Input' : 'Or Paste Raw Lab Text / Values'}</span>
            </button>
          </div>

          {showTextInput && (
            <div className="direct-text-container">
              <textarea
                rows={4}
                placeholder="e.g. Hemoglobin 10.2 g/dL, Fasting Glucose 145 mg/dL, Vitamin D 14 ng/mL, Platelets 240000 /mcL..."
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="analyzer-error-banner" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="analysis-action-bar">
        <button
          type="button"
          className="start-analysis-btn"
          disabled={isAnalyzing || (!selectedFile && !selectedSampleId && !rawTextInput.trim())}
          onClick={onStartAnalysis}
        >
          {isAnalyzing ? (
            <>
              <RotateCw size={16} className="spin-icon" aria-hidden="true" />
              <span>Analyzing Report with Clinical AI...</span>
            </>
          ) : (
            <>
              <Activity size={16} aria-hidden="true" />
              <span>Analyze Lab Report</span>
            </>
          )}
        </button>
      </div>

      {/* Step-by-Step Progress Animation */}
      {isAnalyzing && (
        <div className="analysis-progress-card" role="status" aria-live="polite">
          <h4 className="progress-card-title">
            <RotateCw size={16} className="spin-icon" aria-hidden="true" />
            <span>Processing diagnostic report...</span>
          </h4>
          <div className="progress-steps-list">
            <div className={`step-item ${analysisStep >= 1 ? 'active' : ''}`}>
              <span className="step-circle">{analysisStep > 1 ? '✓' : '1'}</span>
              <span>Document & Image Parsing (OCR Extraction)</span>
            </div>
            <div className={`step-item ${analysisStep >= 2 ? 'active' : ''}`}>
              <span className="step-circle">{analysisStep > 2 ? '✓' : '2'}</span>
              <span>Extracting Biomarkers, Values & Reference Ranges</span>
            </div>
            <div className={`step-item ${analysisStep >= 3 ? 'active' : ''}`}>
              <span className="step-circle">{analysisStep > 3 ? '✓' : '3'}</span>
              <span>Clinical Reasoning & Flagging Abnormal Findings</span>
            </div>
            <div className={`step-item ${analysisStep >= 4 ? 'active' : ''}`}>
              <span className="step-circle">{analysisStep >= 4 ? '✓' : '4'}</span>
              <span>Matching Specialists & Checking Real-Time Schedules</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabReportUploadSection;
