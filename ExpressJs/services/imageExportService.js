/**
 * Generate SVG Image representations for export
 */

export const generateAppointmentsSvg = (appointments = [], filters = {}) => {
  const width = 1000;
  const rowHeight = 36;
  const headerHeight = 180;
  const height = Math.max(500, headerHeight + appointments.length * rowHeight + 60);

  const statusLabel = filters.status || 'ALL';
  const specialtyLabel = filters.specialty || 'ALL';

  let rowsSvg = '';
  appointments.forEach((apt, idx) => {
    const y = headerHeight + idx * rowHeight;
    const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    const dateStr = new Date(apt.appointment_datetime).toLocaleDateString();
    const timeStr = new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let statusColor = '#2563EB';
    if (apt.status === 'COMPLETED') statusColor = '#059669';
    if (apt.status === 'CANCELLED') statusColor = '#DC2626';

    rowsSvg += `
      <rect x="30" y="${y}" width="940" height="${rowHeight}" fill="${bg}" stroke="#E2E8F0" stroke-width="1"/>
      <text x="45" y="${y + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#087F72">#${apt.appointment_id}</text>
      <text x="110" y="${y + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#172033">${escapeXml(apt.patient_name || 'Patient')}</text>
      <text x="290" y="${y + 22}" font-family="Arial, sans-serif" font-size="12" fill="#172033">${escapeXml(apt.doctor_name || 'Doctor')}</text>
      <text x="470" y="${y + 22}" font-family="Arial, sans-serif" font-size="11" fill="#087F72">${escapeXml(apt.specialization || 'Medicine')}</text>
      <text x="630" y="${y + 22}" font-family="Arial, sans-serif" font-size="11" fill="#475569">${dateStr} ${timeStr}</text>
      <text x="780" y="${y + 22}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${statusColor}">${apt.status}</text>
      <text x="890" y="${y + 22}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#172033">$${apt.payment_amount || '65.00'}</text>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#111C2F" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#F1F5F9" />
      
      <!-- Top Brand Header -->
      <rect x="30" y="20" width="940" height="90" rx="8" fill="url(#headerGrad)" />
      <rect x="30" y="106" width="940" height="4" fill="#087F72" />
      
      <text x="60" y="55" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">HEALPOINT HEALTHCARE SYSTEMS</text>
      <text x="60" y="80" font-family="Arial, sans-serif" font-size="13" fill="#94A3B8">Clinical Appointments Administration Report • Exported on ${new Date().toLocaleDateString()}</text>
      
      <!-- Filters sub-bar -->
      <rect x="30" y="120" width="940" height="40" rx="4" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <text x="45" y="145" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Filtered by: <tspan font-weight="bold" fill="#172033">Status: ${statusLabel} | Specialty: ${specialtyLabel} | Total: ${appointments.length} records</tspan></text>
      
      <!-- Table Header -->
      <rect x="30" y="170" width="940" height="30" fill="#087F72" rx="4" />
      <text x="45" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">ID</text>
      <text x="110" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">PATIENT</text>
      <text x="290" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">DOCTOR</text>
      <text x="470" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">SPECIALTY</text>
      <text x="630" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">SCHEDULE</text>
      <text x="780" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">STATUS</text>
      <text x="890" y="190" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">FEE</text>
      
      <!-- Rows -->
      ${rowsSvg}
    </svg>
  `;
};

export const generateSingleAppointmentSvg = (apt) => {
  const width = 800;
  const height = 550;
  const aptDate = new Date(apt.appointment_datetime);
  const formattedDate = !isNaN(aptDate) ? aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const formattedTime = !isNaN(aptDate) ? aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  let statusColor = '#059669';
  if (apt.status === 'CANCELLED') statusColor = '#DC2626';
  if (apt.status === 'SCHEDULED') statusColor = '#2563EB';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="cardHeader" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#111C2F" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
      </defs>
      
      <!-- Main Card Container -->
      <rect width="${width}" height="${height}" fill="#F8FAFC" />
      <rect x="25" y="25" width="750" height="500" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />
      
      <!-- Header -->
      <rect x="25" y="25" width="750" height="85" rx="12" fill="url(#cardHeader)" />
      <rect x="25" y="105" width="750" height="5" fill="#087F72" />
      
      <text x="50" y="60" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">HEALPOINT HEALTHCARE SYSTEMS</text>
      <text x="50" y="85" font-family="Arial, sans-serif" font-size="12" fill="#94A3B8">Official Appointment Verification & Slip #${apt.appointment_id}</text>
      
      <text x="730" y="65" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${statusColor}" text-anchor="end">${apt.status}</text>
      
      <!-- Info Grid -->
      <g transform="translate(50, 130)">
        <!-- Patient -->
        <rect x="0" y="0" width="330" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="15" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">PATIENT</text>
        <text x="15" y="44" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#172033">${escapeXml(apt.patient_name || 'Patient')}</text>
        
        <!-- Doctor -->
        <rect x="370" y="0" width="330" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="385" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">DOCTOR & SPECIALTY</text>
        <text x="385" y="44" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#172033">${escapeXml(apt.doctor_name || 'Doctor')} (${escapeXml(apt.specialization || 'Medicine')})</text>
        
        <!-- Schedule -->
        <rect x="0" y="80" width="330" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="15" y="102" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">DATE & TIME</text>
        <text x="15" y="124" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#172033">${formattedDate} at ${formattedTime}</text>
        
        <!-- Mode & Location -->
        <rect x="370" y="80" width="330" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="385" y="102" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748B">CONSULTATION MODE</text>
        <text x="385" y="124" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#172033">${apt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic'}</text>
        
        <!-- Fee & Payment -->
        <rect x="0" y="160" width="700" height="60" rx="6" fill="#F0FDF4" stroke="#BBF7D0"/>
        <text x="15" y="182" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#166534">PAYMENT STATUS</text>
        <text x="15" y="204" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#15803D">$${apt.payment_amount || '65.00'} (${apt.payment_status || 'PAID'})</text>
      </g>
      
      <!-- Footer Note -->
      <text x="400" y="490" font-family="Arial, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">HealPoint Healthcare Management System • Verified Electronic Clinical Record</text>
    </svg>
  `;
};

// Aliases for compatibility
export const buildAppointmentsImageSvg = generateAppointmentsSvg;
export const buildSingleAppointmentImageSvg = generateSingleAppointmentSvg;

const escapeXml = (str) => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
