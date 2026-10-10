import React, { useRef, useEffect } from 'react';
import {
  Search,
  Calendar,
  Download,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  Loader2
} from 'lucide-react';

const AdminAppointmentFilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  specialtyFilter,
  setSpecialtyFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  exportDropdownOpen,
  setExportDropdownOpen,
  exporting,
  exportMessage,
  handleExportPdf,
  handleExportImage,
  scheduledCount,
  completedCount,
  cancelledCount,
  totalCount,
  filteredCount
}) => {
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [setExportDropdownOpen]);

  return (
    <>
      {/* Quick Summary Pill Bar */}
      <div className="admin-status-tabs" style={{ marginBottom: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`admin-status-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All Appointments ({totalCount})
        </button>
        <button
          type="button"
          className={`admin-status-tab-btn ${statusFilter === 'SCHEDULED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('SCHEDULED')}
        >
          Scheduled / Confirmed ({scheduledCount})
        </button>
        <button
          type="button"
          className={`admin-status-tab-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          Completed ({completedCount})
        </button>
        <button
          type="button"
          className={`admin-status-tab-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
          onClick={() => setStatusFilter('CANCELLED')}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div className="admin-search-wrap" style={{ minWidth: '240px', flex: 1 }}>
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search by ID, patient, doctor, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="admin-select"
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Specialties</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="General Medicine">General Medicine</option>
            </select>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Filter Start Date"
                className="admin-date-input"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8125rem' }}
              />
              <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Filter End Date"
                className="admin-date-input"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>

        {/* Export / Download Menu Dropdown */}
        <div style={{ position: 'relative' }} ref={exportMenuRef}>
          <button
            type="button"
            className="admin-btn primary"
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            disabled={exporting || filteredCount === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(8, 127, 114, 0.25)' }}
            title="Export filtered appointments to PDF or Image files"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="admin-spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Export ({filteredCount})</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>

          {exportDropdownOpen && !exporting && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              minWidth: '220px',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Export Filtered View
                </span>
              </div>

              <button
                type="button"
                onClick={handleExportPdf}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <FileText size={16} color="#DC2626" />
                <div>
                  <div style={{ fontWeight: 600 }}>Download PDF Report</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Printable vector summary</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExportImage('png')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <ImageIcon size={16} color="#2563EB" />
                <div>
                  <div style={{ fontWeight: 600 }}>Download PNG Image</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>High-resolution table graphic</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExportImage('jpg')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <ImageIcon size={16} color="#059669" />
                <div>
                  <div style={{ fontWeight: 600 }}>Download JPG Image</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Optimized size for sharing</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Export In-Progress Banner */}
      {exportMessage && (
        <div style={{
          marginTop: '10px',
          padding: '10px 14px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.875rem',
          color: '#1E40AF'
        }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>{exportMessage}</span>
        </div>
      )}
    </>
  );
};

export default AdminAppointmentFilterBar;
