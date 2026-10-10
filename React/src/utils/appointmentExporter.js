import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Download a blob as a file in the browser
 */
export const triggerBrowserDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

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

  if (appointments.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 30, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.text('No appointments found matching the specified parameters.', pageWidth / 2, y + 18, { align: 'center' });
    y += 30;
  } else {
    appointments.forEach((apt, idx) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
        drawTableHeader(y);
        y += 18;
      }

      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 22, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(8, 127, 114);
      doc.text(`#${apt.appointment_id}`, col.id, y + 14);

      doc.setTextColor(23, 32, 51);
      doc.text(String(apt.patient_name || 'Patient').slice(0, 18), col.patient, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.text(`${String(apt.doctor_name || 'Doctor').slice(0, 16)} (${String(apt.specialization || 'Gen').slice(0, 10)})`, col.doctor, y + 14);

      const dStr = apt.appointment_datetime ? new Date(apt.appointment_datetime).toLocaleDateString() : '';
      doc.text(dStr, col.date, y + 14);

      doc.text(apt.appointment_type === 'VIDEO' ? 'Telemedicine' : 'In-Person', col.type, y + 14);

      const st = apt.status || 'SCHEDULED';
      if (st === 'COMPLETED') doc.setTextColor(5, 150, 105);
      else if (st === 'CANCELLED') doc.setTextColor(220, 38, 38);
      else doc.setTextColor(217, 119, 6);
      doc.setFont('helvetica', 'bold');
      doc.text(st, col.status, y + 14);

      doc.setTextColor(23, 32, 51);
      doc.text(`$${apt.payment_amount || 65.00}`, col.fee, y + 14);

      y += 22;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`HealPoint Clinical Systems • Confidential Report • Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 16, { align: 'center' });
  }

  const dateTag = new Date().toISOString().split('T')[0];
  doc.save(`healpoint_appointments_${dateTag}.pdf`);
};

/**
 * Generate and download single appointment summary PDF
 */
export const exportSingleAppointmentToPdf = async (apt) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Box
  doc.setFillColor(17, 28, 47);
  doc.rect(margin, margin, contentWidth, 60, 'F');
  doc.setFillColor(8, 127, 114);
  doc.rect(margin, margin + 60, contentWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('HEALPOINT CLINICAL SERVICES', margin + 16, margin + 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Official Appointment Confirmation & Consultation Slip', margin + 16, margin + 46);

  doc.setFontSize(8);
  doc.setTextColor(167, 243, 208);
  doc.text(`Document Ref: #${apt.appointment_id}`, pageWidth - margin - 16, margin + 30, { align: 'right' });
  doc.text(`Issued: ${new Date().toLocaleDateString()}`, pageWidth - margin - 16, margin + 44, { align: 'right' });

  // Status Badge Box
  let y = margin + 80;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.rect(margin, y, contentWidth, 32, 'FD');

  doc.setTextColor(8, 127, 114);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`APPOINTMENT #${apt.appointment_id} — ${apt.status || 'SCHEDULED'}`, margin + 14, y + 20);

  doc.setTextColor(23, 32, 51);
  doc.setFontSize(8.5);
  doc.text(`Mode: ${apt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Consultation'}`, pageWidth - margin - 14, y + 20, { align: 'right' });

  // Grid for Patient and Doctor details
  y += 46;
  const boxW = (contentWidth - 16) / 2;
  
  // Patient Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, boxW, 100, 'FD');

  doc.setTextColor(8, 127, 114);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT INFORMATION', margin + 12, y + 18);

  doc.setTextColor(23, 32, 51);
  doc.setFontSize(10);
  doc.text(apt.patient_name || 'Demo Patient', margin + 12, y + 36);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Email: ${apt.patient_email || 'demo.patient@healpoint.com'}`, margin + 12, y + 52);
  doc.text(`Patient ID: #${apt.patient_id || '1'}`, margin + 12, y + 66);
  doc.text(`Account Status: Verified Active`, margin + 12, y + 80);

  // Doctor Details
  const docX = margin + boxW + 16;
  doc.setFillColor(248, 250, 252);
  doc.rect(docX, y, boxW, 100, 'FD');

  doc.setTextColor(8, 127, 114);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRACTITIONER INFORMATION', docX + 12, y + 18);

  doc.setTextColor(23, 32, 51);
  doc.setFontSize(10);
  doc.text(apt.doctor_name || 'Dr. Priya Nair', docX + 12, y + 36);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 127, 114);
  doc.text(`Specialty: ${apt.specialization || 'General Medicine'}`, docX + 12, y + 52);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Location: ${apt.location || 'HealPoint Health Clinic'}`, docX + 12, y + 66);
  doc.text(`Doctor ID: #${apt.doctor_id || '101'}`, docX + 12, y + 80);

  // Schedule & Financials
  y += 114;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 100, 'FD');

  doc.setTextColor(17, 28, 47);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHEDULE & CONSULTATION DETAILS', margin + 14, y + 18);

  const formattedDate = apt.appointment_datetime 
    ? new Date(apt.appointment_datetime).toLocaleString()
    : 'Scheduled Date & Time';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(23, 32, 51);
  doc.text(`Scheduled Date & Time: `, margin + 14, y + 38);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, margin + 130, y + 38);

  doc.setFont('helvetica', 'normal');
  doc.text(`Consultation Mode: `, margin + 14, y + 54);
  doc.setFont('helvetica', 'bold');
  doc.text(apt.appointment_type === 'VIDEO' ? 'Encrypted Video Telemedicine' : 'In-Person Clinical Visit', margin + 130, y + 54);

  doc.setFont('helvetica', 'normal');
  doc.text(`Consultation Fee: `, margin + 14, y + 70);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${apt.payment_amount || '65.00'} (${apt.payment_status || 'PAID'})`, margin + 130, y + 70);

  if (apt.telemedicine_url) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Telemedicine URL: ${apt.telemedicine_url}`, margin + 14, y + 86);
  }

  // Administrative Notice
  y += 116;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 48, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Notice: This document is an administrative verification record generated by HealPoint Healthcare Systems. All medical data is processed in accordance with clinical privacy standards.', margin + 12, y + 16, { width: contentWidth - 24 });

  doc.text('HealPoint Healthcare Management System • Confidential Administration Document', pageWidth / 2, pageHeight - 16, { align: 'center' });

  doc.save(`healpoint_appointment_${apt.appointment_id}.pdf`);
};

/**
 * Generate high-resolution PNG/JPG image from an HTML element or canvas
 */
export const exportAppointmentsToImage = async (appointments = [], filters = {}, format = 'png') => {
  // Build offscreen container for pixel-perfect rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1000px';
  container.style.background = '#FFFFFF';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.color = '#172033';

  const rowsHtml = appointments.slice(0, 30).map((apt, idx) => {
    const bg = idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
    const statusColor = apt.status === 'COMPLETED' ? '#059669' : (apt.status === 'CANCELLED' ? '#DC2626' : '#D97706');
    const dateStr = apt.appointment_datetime ? new Date(apt.appointment_datetime).toLocaleString() : 'N/A';

    return `
      <tr style="background: ${bg}; border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 12px; font-weight: 700; color: #087F72;">#${apt.appointment_id}</td>
        <td style="padding: 10px 12px; font-weight: 600;">${apt.patient_name || 'Patient'}</td>
        <td style="padding: 10px 12px;">${apt.doctor_name || 'Dr. Specialist'} <span style="color: #087F72; font-size: 11px;">(${apt.specialization || 'General'})</span></td>
        <td style="padding: 10px 12px; font-size: 12px; color: #64748B;">${dateStr}</td>
        <td style="padding: 10px 12px; font-size: 12px;">${apt.appointment_type === 'VIDEO' ? 'Telemedicine' : 'In-Person'}</td>
        <td style="padding: 10px 12px; font-weight: 700; color: ${statusColor}; font-size: 12px;">${apt.status}</td>
        <td style="padding: 10px 12px; font-weight: 700;">$${apt.payment_amount || 65.00}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
      <div style="background: #111C2F; padding: 20px 24px; border-bottom: 4px solid #087F72; display: flex; justify-content: space-between; align-items: center; color: white;">
        <div>
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">HEALPOINT CLINICAL APPOINTMENTS REPORT</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Healthcare Platform Telemetry & Governance Snapshot</p>
        </div>
        <div style="text-align: right;">
          <span style="display: block; font-size: 11px; color: #A7F3D0;">Date: ${new Date().toLocaleDateString()}</span>
          <span style="font-size: 12px; font-weight: 700; color: #A7F3D0;">Total: ${appointments.length} Bookings</span>
        </div>
      </div>

      <div style="background: #F1F5F9; padding: 10px 24px; font-size: 11px; color: #475569; border-bottom: 1px solid #E2E8F0;">
        <strong>Active Filters:</strong> Status: ${filters.status || 'ALL'} | Specialty: ${filters.specialty || 'ALL'} | Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'Present'}
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="background: #087F72; color: white; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 10px 12px;">ID</th>
            <th style="padding: 10px 12px;">Patient</th>
            <th style="padding: 10px 12px;">Doctor & Specialty</th>
            <th style="padding: 10px 12px;">Scheduled Date</th>
            <th style="padding: 10px 12px;">Mode</th>
            <th style="padding: 10px 12px;">Status</th>
            <th style="padding: 10px 12px;">Fee</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #64748B;">No appointments found.</td></tr>'}
        </tbody>
      </table>

      <div style="background: #111C2F; color: white; padding: 12px 24px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700;">
        <span>HealPoint Healthcare Management System</span>
        <span>Confidential Administrative Record</span>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution (2x retina)
      useCORS: true,
      backgroundColor: '#FFFFFF'
    });

    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `healpoint_appointments_${new Date().toISOString().split('T')[0]}.${extension}`;
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * Generate and download single appointment summary image (PNG/JPG)
 */
export const exportSingleAppointmentToImage = async (apt, format = 'png') => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '750px';
  container.style.background = '#FFFFFF';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '30px';
  container.style.boxSizing = 'border-box';
  container.style.color = '#172033';

  const dateStr = apt.appointment_datetime ? new Date(apt.appointment_datetime).toLocaleString() : 'N/A';
  const statusColor = apt.status === 'COMPLETED' ? '#059669' : (apt.status === 'CANCELLED' ? '#DC2626' : '#D97706');

  container.innerHTML = `
    <div style="border: 2px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      <div style="background: #111C2F; padding: 22px 28px; border-bottom: 4px solid #087F72; display: flex; justify-content: space-between; align-items: center; color: white;">
        <div>
          <h2 style="margin: 0; font-size: 19px; font-weight: 800;">HEALPOINT CLINICAL APPOINTMENT SUMMARY</h2>
          <p style="margin: 3px 0 0 0; font-size: 12px; color: #94A3B8;">Official Digital Consultation Verification Slip</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 16px; font-weight: 800; color: #A7F3D0;">#${apt.appointment_id}</span>
        </div>
      </div>

      <div style="background: #ECFDF5; border-bottom: 1px solid #A7F3D0; padding: 12px 28px; display: flex; justify-content: space-between; font-size: 13px;">
        <span style="font-weight: 700; color: #087F72;">STATUS: <span style="color: ${statusColor}; text-transform: uppercase;">${apt.status || 'SCHEDULED'}</span></span>
        <span style="font-weight: 600; color: #172033;">Mode: ${apt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Consultation'}</span>
      </div>

      <div style="padding: 24px 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #087F72; text-transform: uppercase;">Patient Information</span>
          <h4 style="margin: 6px 0 2px 0; font-size: 15px; color: #172033;">${apt.patient_name || 'Demo Patient'}</h4>
          <p style="margin: 0; font-size: 12px; color: #64748B;">${apt.patient_email || 'demo.patient@healpoint.com'}</p>
          <span style="display: block; margin-top: 6px; font-size: 11px; color: #64748B;">Patient ID: #${apt.patient_id || '1'}</span>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #087F72; text-transform: uppercase;">Practitioner Information</span>
          <h4 style="margin: 6px 0 2px 0; font-size: 15px; color: #172033;">${apt.doctor_name || 'Dr. Priya Nair'}</h4>
          <p style="margin: 0; font-size: 12px; font-weight: 600; color: #087F72;">${apt.specialization || 'General Medicine'}</p>
          <span style="display: block; margin-top: 6px; font-size: 11px; color: #64748B;">${apt.location || 'HealPoint Health Clinic'}</span>
        </div>
      </div>

      <div style="padding: 0 28px 20px 28px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px;">
          <span style="font-size: 11px; font-weight: 700; color: #172033; text-transform: uppercase;">Schedule & Billing</span>
          <div style="margin-top: 6px; font-size: 13px; line-height: 1.6;">
            <div>Scheduled Time: <strong>${dateStr}</strong></div>
            <div>Fee & Status: <strong>$${apt.payment_amount || '65.00'} (${apt.payment_status || 'PAID'})</strong></div>
          </div>
        </div>
      </div>

      <div style="background: #111C2F; color: #94A3B8; padding: 12px 28px; text-align: center; font-size: 11px;">
        HealPoint Healthcare Management System • Official Verification Document
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF'
    });

    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpg' || format === 'jpeg' ? 'jpg' : 'png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `healpoint_appointment_${apt.appointment_id}.${extension}`;
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};
