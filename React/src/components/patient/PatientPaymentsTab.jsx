import React, { useState } from 'react'
import { CreditCard } from 'lucide-react'

const PatientPaymentsTab = ({
  payments = [],
  appointments = [],
  onMakePayment
}) => {
  const [paymentAppointmentId, setPaymentAppointmentId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!paymentAppointmentId) {
      alert("Please select an appointment to pay for")
      return
    }
    onMakePayment(paymentAppointmentId)
    setPaymentAppointmentId('')
  }

  return (
    <section className="dashboard-section">
      <div className="section-header-row">
        <div className="section-title-wrap">
          <CreditCard size={18} className="section-icon" />
          <h2>Payment History</h2>
        </div>
      </div>
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Doctor / Service</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="col-date">{payment.date}</td>
                <td className="col-doctor">{payment.doctorName}</td>
                <td className="col-amount">{payment.amount}</td>
                <td>
                  <span className={`status-pill status-${payment.status.toLowerCase()}`}>{payment.status}</span>
                </td>
                <td className="col-method">{payment.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-payment-section">
        <h3>Make a Mock Payment</h3>
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="payment-select">Select Appointment</label>
            <select 
              id="payment-select" 
              value={paymentAppointmentId} 
              onChange={e => setPaymentAppointmentId(e.target.value)}
            >
              <option value="">Choose an appointment...</option>
              {appointments.map((apt) => (
                <option key={apt.id} value={apt.id}>{apt.date} - {apt.doctorName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="primary-btn">Pay $150.00 Now</button>
        </form>
      </div>
    </section>
  )
}

export default PatientPaymentsTab
