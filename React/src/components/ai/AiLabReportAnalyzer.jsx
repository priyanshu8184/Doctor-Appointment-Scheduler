import React from 'react';
import { 
  FileText, 
  History as HistoryIcon, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import './AiLabReportAnalyzer.css';
import { useLabReportAnalyzer } from '../../hooks/useLabReportAnalyzer';
import LabReportUploadSection from './lab-report/LabReportUploadSection';
import LabReportAnalysisView from './lab-report/LabReportAnalysisView';
import LabReportHistoryTab from './lab-report/LabReportHistoryTab';
import LabReportTrendsTab from './lab-report/LabReportTrendsTab';
import LabReportBookingModal from './lab-report/LabReportBookingModal';

const AiLabReportAnalyzer = ({ patientId, onAppointmentBooked }) => {
  const {
    activeSubTab,
    setActiveSubTab,
    selectedFile,
    setSelectedFile,
    dragActive,
    setDragActive,
    rawTextInput,
    setRawTextInput,
    showTextInput,
    setShowTextInput,
    selectedSampleId,
    setSelectedSampleId,
    sampleList,
    isAnalyzing,
    analysisStep,
    analysisResult,
    recommendedDoctors,
    currentReportId,
    currentFileName,
    isDemoReport,
    errorMsg,
    reportHistory,
    trendData,
    loadingHistory,
    bookingDoctor,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime,
    bookingType,
    setBookingType,
    bookingReason,
    setBookingReason,
    bookingSuccess,
    isSubmittingBooking,
    handleStartAnalysis,
    handleSelectHistoryReport,
    handleResetAnalysis,
    openBookingModal,
    closeBookingModal,
    handleConfirmBooking
  } = useLabReportAnalyzer(patientId, onAppointmentBooked);

  return (
    <div className="ai-lab-analyzer-wrapper">
      {/* Top Navigation Tabs */}
      <div className="lab-analyzer-tabs-header">
        <div className="lab-analyzer-tabs-list">
          <button
            type="button"
            className={`lab-tab-btn ${activeSubTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('analyzer')}
          >
            <Sparkles size={16} />
            <span>AI Diagnostic Analyzer</span>
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('history')}
          >
            <HistoryIcon size={16} />
            <span>Report Vault & History ({reportHistory.length})</span>
          </button>
          <button
            type="button"
            className={`lab-tab-btn ${activeSubTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('trends')}
          >
            <TrendingUp size={16} />
            <span>Biomarker Health Trends ({trendData.length})</span>
          </button>
        </div>
      </div>

      {/* 1. Tab: Analyzer / Upload / Results */}
      {activeSubTab === 'analyzer' && (
        <div className="lab-tab-content">
          {!analysisResult ? (
            <LabReportUploadSection
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              dragActive={dragActive}
              setDragActive={setDragActive}
              selectedSampleId={selectedSampleId}
              setSelectedSampleId={setSelectedSampleId}
              sampleList={sampleList}
              showTextInput={showTextInput}
              setShowTextInput={setShowTextInput}
              rawTextInput={rawTextInput}
              setRawTextInput={setRawTextInput}
              isAnalyzing={isAnalyzing}
              analysisStep={analysisStep}
              errorMsg={errorMsg}
              onStartAnalysis={handleStartAnalysis}
            />
          ) : (
            <LabReportAnalysisView
              analysisResult={analysisResult}
              recommendedDoctors={recommendedDoctors}
              currentFileName={currentFileName}
              isDemoReport={isDemoReport}
              onResetAnalysis={handleResetAnalysis}
              onBookDoctor={openBookingModal}
            />
          )}
        </div>
      )}

      {/* 2. Tab: History */}
      {activeSubTab === 'history' && (
        <LabReportHistoryTab
          reportHistory={reportHistory}
          loadingHistory={loadingHistory}
          onSelectReport={handleSelectHistoryReport}
          onNewAnalysis={() => {
            handleResetAnalysis();
            setActiveSubTab('analyzer');
          }}
        />
      )}

      {/* 3. Tab: Trends */}
      {activeSubTab === 'trends' && (
        <LabReportTrendsTab
          trendData={trendData}
          onSelectTrendDoc={() => {
            setActiveSubTab('analyzer');
          }}
        />
      )}

      {/* Consultation Booking Modal */}
      <LabReportBookingModal
        bookingDoctor={bookingDoctor}
        onClose={closeBookingModal}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingTime={bookingTime}
        setBookingTime={setBookingTime}
        bookingType={bookingType}
        setBookingType={setBookingType}
        bookingReason={bookingReason}
        setBookingReason={setBookingReason}
        bookingSuccess={bookingSuccess}
        isSubmittingBooking={isSubmittingBooking}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
};

export default AiLabReportAnalyzer;
