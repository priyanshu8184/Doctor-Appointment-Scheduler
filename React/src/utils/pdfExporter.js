import jsPDF from 'jspdf';
import { triggerBrowserDownload } from './downloadUtils';

/**
 * Generate and download a high-quality printable PDF for filtered appointments
 */
export const exportAppointmentsToPdf = async (appointments = [], filters = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner (Navy)
  doc.setFillColor(17, 28, 47);
  doc.rect(margin, margin, contentWidth, 54, 'F');

  // Teal Line
  doc.setFillColor(8, 127, 114);
  doc.rect(margin, margin + 54, contentWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HEALPOINT HEALTHCARE SYSTEMS', margin + 14, margin + 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Clinical Appointment Administration & Governance Report', margin + 14, margin + 44);

  doc.setFontSize(7.5);
  doc.setTextColor(167, 243, 208);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 14, margin + 28, { align: 'right' });
  doc.text(`Total Records: ${appointments.length} Bookings`, pageWidth - margin - 14, margin + 42, { align: 'right' });

  // Filter Parameters Box
  let y = margin + 70;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 32, 51);
  doc.text('REPORT FILTERS:', margin + 10, y + 14);

  const statusStr = filters.status || 'ALL';
  const specStr = filters.specialty || 'ALL';
  const searchStr = filters.search ? `"${filters.search}"` : 'NONE';
  const dateStr = (filters.startDate || filters.endDate) ? `${filters.startDate || 'Start'} to ${filters.endDate || 'Now'}` : 'ALL DATES';

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Status: ${statusStr}   |   Specialty: ${specStr}   |   Date Range: ${dateStr}   |   Search: ${searchStr}`, margin + 95, y + 14);

  // Table Columns
  y += 46;
  const col = {
    id: margin + 8,
    patient: margin + 40,
    doctor: margin + 140,
    date: margin + 270,
    type: margin + 355,
    status: margin + 420,
    fee: margin + 480
  };

  const drawTableHeader = (posY) => {
    doc.setFillColor(8, 127, 114);
    doc.rect(margin, posY, contentWidth, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ID', col.id, posY + 12);
    doc.text('PATIENT', col.patient, posY + 12);
    doc.text('DOCTOR & SPECIALTY', col.doctor, posY + 12);
    doc.text('DATE & TIME', col.date, posY + 12);
    doc.text('MODE', col.type, posY + 12);
    doc.text('STATUS', col.status, posY + 12);
    doc.text('FEE', col.fee, posY + 12);
  };

  drawTableHeader(y);
  y += 18;

  // Table Rows
  appointments.forEach((apt, idx) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
      drawTableHeader(y);
      y += 18;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 22, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 22, 'S');

    const aptDate = new Date(apt.appointment_datetime);
    const dateStr = !isNaN(aptDate) ? aptDate.toLocaleDateString() : 'N/A';
    const timeStr = !isNaN(aptDate) ? aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 127, 114);
    doc.text(`#${apt.appointment_id}`, col.id, y + 14);

    doc.setTextColor(23, 32, 51);
    doc.text(truncate(apt.patient_name || 'Anonymous', 16), col.patient, y + 14);

    doc.text(truncate(apt.doctor_name || 'Assigned Doctor', 18), col.doctor, y + 10);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(8, 127, 114);
    doc.text(truncate(apt.specialization || 'General', 18), col.doctor, y + 18);

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${dateStr} ${timeStr}`, col.date, y + 14);

    doc.text(apt.appointment_type === 'VIDEO' ? 'Video' : 'Clinic', col.type, y + 14);

    let statusColor = [37, 99, 235];
    if (apt.status === 'COMPLETED') statusColor = [5, 150, 105];
    if (apt.status === 'CANCELLED') statusColor = [220, 38, 38];

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(apt.status || 'SCHEDULED', col.status, y + 14);

    doc.setTextColor(23, 32, 51);
    doc.text(`$${apt.payment_amount || '65.00'}`, col.fee, y + 14);

    y += 22;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`HealPoint Healthcare Management System • Page ${i} of ${totalPages}`, margin, pageHeight - 15);
  }

  doc.save(`HealPoint_Appointments_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Generate and download an individual appointment slip PDF
 */
export const exportSingleAppointmentToPdf = async (apt) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(17, 28, 47);
  doc.rect(margin, margin, contentWidth, 54, 'F');
  doc.setFillColor(8, 127, 114);
  doc.rect(margin, margin + 54, contentWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HEALPOINT HEALTHCARE SYSTEMS', margin + 14, margin + 26);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Official Appointment Confirmation & Verification Slip', margin + 14, margin + 44);

  doc.setFontSize(8);
  doc.setTextColor(167, 243, 208);
  doc.text(`Slip ID: HP-${apt.appointment_id}`, pageWidth - margin - 14, margin + 34, { align: 'right' });

  // Status Bar
  let y = margin + 70;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 32, 51);
  doc.text(`APPOINTMENT REFERENCE: #${apt.appointment_id}`, margin + 14, y + 21);

  let statusColor = [5, 150, 105];
  if (apt.status === 'CANCELLED') statusColor = [220, 38, 38];
  if (apt.status === 'SCHEDULED') statusColor = [37, 99, 235];

  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`STATUS: ${apt.status}`, pageWidth - margin - 14, y + 21, { align: 'right' });

  // Grid fields
  y += 46;
  const drawBox = (label, val, x, posY, width) => {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(226, 232, 240);
    doc.rect(x, posY, width, 44, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x + 10, posY + 14);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 32, 51);
    doc.text(truncate(String(val || 'N/A'), 28), x + 10, posY + 32);
  };

  const colW = (contentWidth - 14) / 2;
  const aptDate = new Date(apt.appointment_datetime);
  const formattedDate = !isNaN(aptDate) ? aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const formattedTime = !isNaN(aptDate) ? aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  drawBox('Patient Name', apt.patient_name, margin, y, colW);
  drawBox('Patient Contact', apt.patient_email, margin + colW + 14, y, colW);

  y += 54;
  drawBox('Attending Doctor', apt.doctor_name, margin, y, colW);
  drawBox('Specialty', apt.specialization, margin + colW + 14, y, colW);

  y += 54;
  drawBox('Scheduled Date', formattedDate, margin, y, colW);
  drawBox('Scheduled Time', formattedTime, margin + colW + 14, y, colW);

  y += 54;
  drawBox('Consultation Mode', apt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic', margin, y, colW);
  drawBox('Location', apt.location || 'HealPoint Medical Center', margin + colW + 14, y, colW);

  y += 54;
  drawBox('Consultation Fee', `$${apt.payment_amount || '65.00'}`, margin, y, colW);
  drawBox('Payment Status', apt.payment_status || 'COMPLETED', margin + colW + 14, y, colW);

  if (apt.cancellation_reason) {
    y += 54;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(248, 113, 113);
    doc.rect(margin, y, contentWidth, 40, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('CANCELLATION REASON', margin + 10, y + 14);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 27, 27);
    doc.text(truncate(apt.cancellation_reason, 70), margin + 10, y + 28);
  }

  // Footer Verification
  y = 480;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 70, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 127, 114);
  doc.text('OFFICIAL VERIFICATION NOTICE', margin + 12, y + 18);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('This digital slip is an authentic appointment record generated by HealPoint Healthcare Systems. Please present this slip or your reference number upon arrival.', margin + 12, y + 34, { width: contentWidth - 24 });

  doc.save(`Appointment_Slip_${apt.appointment_id}.pdf`);
};

const truncate = (str, len) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};
