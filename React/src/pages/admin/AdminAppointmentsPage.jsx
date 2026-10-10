import React, { useState } from 'react';
import {
  exportAppointmentsToPdf,
  exportSingleAppointmentToPdf,
  exportAppointmentsToImage,
  exportSingleAppointmentToImage
} from '../../utils/appointmentExporter';
import AdminAppointmentFilterBar from '../../components/admin/appointments/AdminAppointmentFilterBar';
import AdminAppointmentsTable from '../../components/admin/appointments/AdminAppointmentsTable';
import AdminAppointmentDetailsModal from '../../components/admin/appointments/AdminAppointmentDetailsModal';
import AdminRescheduleModal from '../../components/admin/appointments/AdminRescheduleModal';
import AdminCancelModal from '../../components/admin/appointments/AdminCancelModal';
import './AdminPages.css';

const AdminAppointmentsPage = ({ 
  appointments = [], 
  onUpdateStatus, 
  onReschedule, 
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Modals state
  const [viewApt, setViewApt] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [newDatetime, setNewDatetime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [cancelApt, setCancelApt] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [conflictError, setConflictError] = useState('');

  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'ACCEPTED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'ALL' && apt.status !== statusFilter) {
      return false;
    }
    if (specialtyFilter !== 'ALL' && apt.specialization?.toLowerCase() !== specialtyFilter.toLowerCase()) {
      return false;
    }
    if (startDate) {
      if (new Date(apt.appointment_datetime) < new Date(startDate)) return false;
    }
    if (endDate) {
      if (new Date(apt.appointment_datetime) > new Date(endDate + 'T23:59:59')) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = String(apt.appointment_id).includes(q);
      const matchPatient = apt.patient_name?.toLowerCase().includes(q);
      const matchDoctor = apt.doctor_name?.toLowerCase().includes(q);
      const matchSpec = apt.specialization?.toLowerCase().includes(q);
      return matchId || matchPatient || matchDoctor || matchSpec;
    }
    return true;
  });

  const activeFiltersObj = {
    status: statusFilter,
    specialty: specialtyFilter,
    startDate,
    endDate,
    search: searchTerm
  };

  // Bulk Export Handlers
  const handleExportPdf = async () => {
    setExporting(true);
    setExportMessage('Generating printable vector PDF report...');
    setExportDropdownOpen(false);
    try {
      await exportAppointmentsToPdf(filteredAppointments, activeFiltersObj);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF export.');
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleExportImage = async (format = 'png') => {
    setExporting(true);
    setExportMessage(`Rendering and downloading high-resolution ${format.toUpperCase()} image...`);
    setExportDropdownOpen(false);
    try {
      await exportAppointmentsToImage(filteredAppointments, format, activeFiltersObj);
    } catch (err) {
      console.error('Image export error:', err);
      alert(`Failed to generate ${format.toUpperCase()} export.`);
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  // Single Appointment Exports
  const handleSingleExportPdf = async (apt) => {
    setExporting(true);
    setExportMessage(`Generating appointment #${apt.appointment_id} PDF receipt...`);
    try {
      await exportSingleAppointmentToPdf(apt);
    } catch (err) {
      console.error('Single PDF export error:', err);
      alert('Failed to download appointment receipt.');
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  const handleSingleExportImage = async (apt, format = 'png') => {
    setExporting(true);
    setExportMessage(`Generating appointment #${apt.appointment_id} ${format.toUpperCase()} card...`);
    try {
      await exportSingleAppointmentToImage(apt, format);
    } catch (err) {
      console.error('Single Image export error:', err);
      alert('Failed to download appointment image card.');
    } finally {
      setExporting(false);
      setExportMessage('');
    }
  };

  // Reschedule handler
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!newDatetime) return;

    // Check conflict
    const reqTime = new Date(newDatetime).getTime();
    const hasConflict = appointments.some(a => {
      if (a.appointment_id === rescheduleApt.appointment_id) return false;
      if (a.doctor_id === rescheduleApt.doctor_id && a.status === 'SCHEDULED') {
        const aptTime = new Date(a.appointment_datetime).getTime();
        return Math.abs(aptTime - reqTime) < 30 * 60 * 1000;
      }
      return false;
    });

    if (hasConflict) {
      setConflictError('Selected doctor already has an appointment scheduled within 30 minutes of this slot.');
      return;
    }

    if (onReschedule) {
      await onReschedule(rescheduleApt.appointment_id, new Date(newDatetime).toISOString(), rescheduleReason);
    }
    setRescheduleApt(null);
  };

  // Cancel handler
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (onUpdateStatus && cancelApt) {
      await onUpdateStatus(cancelApt.appointment_id, 'CANCELLED', cancellationReason);
    }
    setCancelApt(null);
  };

  return (
    <div className="admin-page-container">
      <AdminAppointmentFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        specialtyFilter={specialtyFilter}
        setSpecialtyFilter={setSpecialtyFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        exportDropdownOpen={exportDropdownOpen}
        setExportDropdownOpen={setExportDropdownOpen}
        exporting={exporting}
        exportMessage={exportMessage}
        handleExportPdf={handleExportPdf}
        handleExportImage={handleExportImage}
        scheduledCount={scheduledCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
        totalCount={appointments.length}
        filteredCount={filteredAppointments.length}
      />

      <AdminAppointmentsTable
        appointments={filteredAppointments}
        loading={loading}
        onViewApt={(apt) => setViewApt(apt)}
        onSingleExportPdf={handleSingleExportPdf}
        onOpenReschedule={(apt) => {
          setRescheduleApt(apt);
          setNewDatetime(apt.appointment_datetime ? apt.appointment_datetime.slice(0, 16) : '');
          setRescheduleReason('');
          setConflictError('');
        }}
        onOpenCancel={(apt) => {
          setCancelApt(apt);
          setCancellationReason('');
        }}
      />

      {/* 1. Appointment Details & Export Modal */}
      <AdminAppointmentDetailsModal
        viewApt={viewApt}
        onClose={() => setViewApt(null)}
        onSingleExportPdf={handleSingleExportPdf}
        onSingleExportImage={handleSingleExportImage}
      />

      {/* 2. Reschedule Modal */}
      <AdminRescheduleModal
        rescheduleApt={rescheduleApt}
        onClose={() => setRescheduleApt(null)}
        newDatetime={newDatetime}
        setNewDatetime={setNewDatetime}
        rescheduleReason={rescheduleReason}
        setRescheduleReason={setRescheduleReason}
        conflictError={conflictError}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* 3. Cancel Appointment Modal */}
      <AdminCancelModal
        cancelApt={cancelApt}
        onClose={() => setCancelApt(null)}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default AdminAppointmentsPage;
