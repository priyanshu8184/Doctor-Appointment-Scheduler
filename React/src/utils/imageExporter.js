import html2canvas from 'html2canvas';

/**
 * Convert an HTML element or canvas directly into a downloadable PNG or JPG
 */
export const exportAppointmentsToImage = async (appointments = [], format = 'png', filters = {}) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1000px';
  container.style.background = '#FFFFFF';
  container.style.padding = '30px';
  container.style.fontFamily = 'Arial, sans-serif';

  const rowsHtml = appointments.map((a, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-weight: bold; color: #087F72;">#${a.appointment_id}</td>
      <td style="padding: 10px; color: #172033;"><strong>${a.patient_name || 'Patient'}</strong></td>
      <td style="padding: 10px; color: #172033;">${a.doctor_name || 'Doctor'}<br/><span style="color: #087F72; font-size: 11px;">${a.specialization || ''}</span></td>
      <td style="padding: 10px; color: #64748b; font-size: 12px;">${new Date(a.appointment_datetime).toLocaleDateString()}<br/>${new Date(a.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td style="padding: 10px; color: #334155; font-size: 12px;">${a.appointment_type === 'VIDEO' ? 'Telemedicine' : 'Clinic'}</td>
      <td style="padding: 10px;"><span style="display:inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; color: ${a.status === 'COMPLETED' ? '#059669' : a.status === 'CANCELLED' ? '#dc2626' : '#2563eb'}; background: #eff6ff;">${a.status}</span></td>
      <td style="padding: 10px; font-weight: bold; color: #172033;">$${a.payment_amount || '65.00'}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div style="background: #111C2F; border-bottom: 4px solid #087F72; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
      <h2 style="margin: 0; font-size: 22px;">HEALPOINT HEALTHCARE SYSTEMS</h2>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #94A3B8;">Appointments Administration & Governance Roster Report</p>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #A7F3D0;">Export Date: ${new Date().toLocaleString()} | Filter: ${filters.status || 'ALL'} | Total: ${appointments.length} Bookings</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
      <thead>
        <tr style="background: #087F72; color: white; text-align: left;">
          <th style="padding: 10px;">ID</th>
          <th style="padding: 10px;">Patient</th>
          <th style="padding: 10px;">Doctor</th>
          <th style="padding: 10px;">Schedule</th>
          <th style="padding: 10px;">Mode</th>
          <th style="padding: 10px;">Status</th>
          <th style="padding: 10px;">Fee</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94A3B8; text-align: center;">
      HealPoint Healthcare Management System • Confidential Clinical Export
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const link = document.createElement('a');
    link.download = `HealPoint_Appointments_${new Date().toISOString().slice(0, 10)}.${format}`;
    link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * Export an individual appointment verification slip card to PNG or JPG
 */
export const exportSingleAppointmentToImage = async (apt, format = 'png') => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '700px';
  container.style.background = '#FFFFFF';
  container.style.padding = '30px';
  container.style.fontFamily = 'Arial, sans-serif';

  const aptDate = new Date(apt.appointment_datetime);
  const formattedDate = !isNaN(aptDate) ? aptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const formattedTime = !isNaN(aptDate) ? aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  container.innerHTML = `
    <div style="border: 2px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: #111C2F; border-bottom: 4px solid #087F72; padding: 24px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">HEALPOINT HEALTHCARE SYSTEMS</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Official Digital Appointment Verification Slip</p>
        <span style="display:inline-block; margin-top: 10px; background: #087F72; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold;">
          SLIP REF: #HP-${apt.appointment_id}
        </span>
      </div>

      <div style="padding: 24px; background: #FAFAFA;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-size: 11px; color: #64748B; font-weight: bold;">PATIENT NAME</div>
            <div style="font-size: 15px; font-weight: bold; color: #172033; margin-top: 4px;">${apt.patient_name || 'Patient'}</div>
            <div style="font-size: 11px; color: #94A3B8;">${apt.patient_email || ''}</div>
          </div>

          <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-size: 11px; color: #64748B; font-weight: bold;">ATTENDING PRACTITIONER</div>
            <div style="font-size: 15px; font-weight: bold; color: #172033; margin-top: 4px;">${apt.doctor_name || 'Doctor'}</div>
            <div style="font-size: 11px; color: #087F72; font-weight: bold;">${apt.specialization || ''}</div>
          </div>

          <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-size: 11px; color: #64748B; font-weight: bold;">DATE & TIME</div>
            <div style="font-size: 14px; font-weight: bold; color: #172033; margin-top: 4px;">${formattedDate}</div>
            <div style="font-size: 12px; color: #475569;">${formattedTime}</div>
          </div>

          <div style="background: white; padding: 12px 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
            <div style="font-size: 11px; color: #64748B; font-weight: bold;">CONSULTATION TYPE</div>
            <div style="font-size: 14px; font-weight: bold; color: #172033; margin-top: 4px;">${apt.appointment_type === 'VIDEO' ? 'Telemedicine Video' : 'In-Person Clinic'}</div>
            <div style="font-size: 12px; color: #475569;">${apt.location || 'HealPoint Health Center'}</div>
          </div>
        </div>

        <div style="margin-top: 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; color: #166534; font-weight: bold;">STATUS & BILLING</div>
            <div style="font-size: 14px; font-weight: bold; color: #15803D;">${apt.status} • $${apt.payment_amount || '65.00'} (${apt.payment_status || 'PAID'})</div>
          </div>
          <div style="font-size: 11px; color: #166534; font-weight: bold; background: white; padding: 6px 12px; border-radius: 20px; border: 1px solid #BBF7D0;">
            VERIFIED APPOINTMENT
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 11px; color: #94A3B8; text-align: center;">
          HealPoint Healthcare Management System • Present this digital pass during appointment check-in
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const link = document.createElement('a');
    link.download = `Appointment_Slip_${apt.appointment_id}.${format}`;
    link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
    link.click();
  } finally {
    document.body.removeChild(container);
  }
};
