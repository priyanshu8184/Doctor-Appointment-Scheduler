import React from 'react'

const DoctorPatientsTab = ({
  patients = []
}) => {
  return (
    <section className="dashboard-section">
      <h2>Your Patients</h2>
      <div className="patients-table">
        <div className="table-header">
          <p className="col-patient">Patient Name</p>
          <p className="col-visits">Total Visits</p>
          <p className="col-last-visit">Last Visit</p>
        </div>
        {patients.map((patient) => (
          <div key={patient.id} className="table-row">
            <p className="col-patient">{patient.name}</p>
            <p className="col-visits">{patient.visits}</p>
            <p className="col-last-visit">{patient.lastVisit}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DoctorPatientsTab
